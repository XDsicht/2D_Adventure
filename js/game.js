/**
 * Game lifecycle, pausing, screen routing and input.
 *
 * Everything outside the canvas lives here: starting and ending a run, the
 * keyboard and touch controls, fullscreen, and deciding which screen the
 * player should be looking at.
 *
 * Pausing is built on a set of reasons rather than a boolean. Portrait
 * orientation, a too-small window, Escape and switching tabs each add their own
 * entry, and the game only resumes once the set is empty. That is why rotating
 * back to landscape while the game is also manually paused leaves it paused:
 * one reason went away, the other did not.
 *
 * renderPauseState() is the single place that turns that set into a screen, so
 * no caller ever decides for itself what to display.
 */
let canvas;
let gameControlsBar;

/** The running game, or null between runs. Most of this file checks it before acting. */
let world;
let keyboard = new Keyboard();

/**
 * Every interval and timeout id started during a run.
 *
 * Collected so endGame() can stop all of them at once; a loop that is not
 * registered here keeps running after the game is over.
 */
let intervalRegistry = [];

/** Cached touch-control elements, re-read on each touch because the bar is re-rendered. */
let responsiveButtons = {};
let pauseReasons = new Set();

/** Set once the player dismisses the enlarge-window prompt, so it does not return. */
let windowPromptDismissed = false;

/** Keys whose default browser action is suppressed in-game, so arrows and space do not scroll the page. */
const gameKeyCodes = [37, 38, 39, 40, 32, 68];

/**
 * The pause reasons.
 *
 * Each is added and removed independently; the game runs only when none of them
 * is present. Portrait and window also decide which screen is shown, which is
 * why they are distinct entries rather than one "blocked" flag.
 */
const pauseReasonPortrait = "portrait";
const pauseReasonManual = "manual";
const pauseReasonWindow = "window";

/**
 * Starts a run, or asks the player to rotate first.
 *
 * In portrait the run is deferred rather than cancelled: a one-shot resize
 * listener calls back in once the device turns, so the player does not have to
 * press Start again.
 */
function startGame() {
  if (forceRotatePhone()) {
    renderHTML("rotatePhone");
    window.addEventListener("resize", waitForLandscape);
  } else {
    launchGame();
  }
}

/** One-shot resize handler that launches the deferred run once the device is in landscape. */
function waitForLandscape() {
  if (!checkOrientation()) {
    window.removeEventListener("resize", waitForLandscape);
    startGame();
  }
}

/**
 * Builds the level and the world, swaps the lobby for the canvas and starts the
 * game-over watcher.
 *
 * The click listener for the lobby music is removed here, otherwise the first
 * in-game click would start the lobby track again underneath the game.
 */
function launchGame() {
  renderHTML("loading");
  document.removeEventListener("click", startLobbyMusic);
  initLevel1();
  stopSound(lobbyMusic);
  canvas = getElement("canvas");
  gameLobby = getElement("lobby");
  renderInGameControlsBar();
  initGame(canvas);
  hideLoadingScreen();
  monitorGameOver();
}

/**
 * Creates the world and starts the background music.
 *
 * Both music tracks are registered before the sound array is built, so mute and
 * volume settings chosen in the lobby apply from the first frame. The track
 * starts three seconds in to skip its quiet intro.
 *
 * @param {HTMLCanvasElement} canvas - The canvas the world draws to.
 */
function initGame(canvas) {
  world = new World(canvas, keyboard);
  registerGameSound(backgroundMusic);
  registerGameSound(endbossMusic);
  createAllSoundsArray();
  applyAudioStates(allSounds);
  currentMusic = backgroundMusic;
  backgroundMusic.currentTime = 3;
  let volume = resolveVolume(backgroundMusic);
  playSound(backgroundMusic, volume);
}

/**
 * Leaves the loading screen after 1.5 seconds.
 *
 * It re-reads the orientation rather than simply revealing the canvas, which
 * covers the case where the player rotates the device while loading.
 */
function hideLoadingScreen() {
  registerInterval(
    setTimeout(() => {
      handleOrientationChange();
      renderPauseState();
    }, 1500),
  );
}

/**
 * Re-evaluates the two environment-driven pause reasons.
 *
 * Bound to every event that could change them and safe to call directly, since
 * syncPauseReason() ignores anything that is not an actual change.
 */
function handleOrientationChange() {
  syncPauseReason(pauseReasonPortrait, forceRotatePhone());
  syncPauseReason(pauseReasonWindow, shouldPromptEnlarge());
}

/**
 * Adds or removes one pause reason, doing nothing if it is already in that state.
 *
 * This early return is what keeps the game steady on mobile: collapsing the URL
 * bar fires a resize, but the orientation has not changed, so no pause or
 * resume cycle happens.
 *
 * @param {string} reason - One of the pause reason constants.
 * @param {boolean} active - Whether the condition currently applies.
 */
function syncPauseReason(reason, active) {
  if (active == pauseReasons.has(reason)) return;
  if (active) pauseGame(reason);
  else resumeGame(reason);
}

/**
 * Reports whether the enlarge-window prompt should be showing.
 *
 * @returns {boolean} True when the window is too small and the prompt has not been dismissed.
 */
function shouldPromptEnlarge() {
  return isWindowTooSmall() && !windowPromptDismissed;
}

/**
 * Four sources for one handler: window resize, the legacy orientation event,
 * the shared media query and the Screen Orientation API.
 *
 * Browsers differ in which of these they fire, so all four are bound. Whichever
 * arrives first does the work and the others find nothing to change.
 */
window.addEventListener("resize", handleOrientationChange);
window.addEventListener("orientationchange", handleOrientationChange);
responsiveMedia.addEventListener("change", handleOrientationChange);

if (screen.orientation) {
  screen.orientation.addEventListener("change", handleOrientationChange);
}

/**
 * Adds a pause reason and, if the game is still running, freezes it.
 *
 * Keys are released first so a held direction does not resume as movement.
 * Pausing the music goes through currentMusic, so the endboss theme pauses
 * during its fight instead of the overworld track.
 *
 * @param {string} reason - The reason being added.
 */
function pauseGame(reason) {
  pauseReasons.add(reason);
  releaseAllKeys();
  if (world && !world.paused) {
    world.pause();
    stopAllSoundEffects();
    currentMusic.pause();
  }
  renderPauseState();
}

/**
 * Removes a pause reason and resumes only once no reasons are left.
 *
 * @param {string} reason - The reason being cleared.
 */
function resumeGame(reason) {
  pauseReasons.delete(reason);
  if (pauseReasons.size == 0 && world && world.paused) {
    world.resume();
    resumeMusic();
  }
  renderPauseState();
}

/**
 * Resumes whichever track was playing.
 *
 * AbortError is expected and ignored: it is what the browser reports when a
 * rapid pause follows this play call, which happens when two pause reasons
 * arrive close together.
 */
function resumeMusic() {
  currentMusic.play().catch((error) => {
    if (error.name !== "AbortError") console.error(error);
  });
}

/**
 * @returns {boolean} True when the browser allows fullscreen.
 */
function supportsFullscreen() {
  return document.fullscreenEnabled;
}

/**
 * @returns {string} The enter or exit icon, matching the current state.
 */
function getFullscreenIcon() {
  return document.fullscreenElement ? SVG_EXIT_FULLSCREEN : SVG_FULLSCREEN;
}

/** Enters or leaves fullscreen. */
function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen();
}

/** Updates the fullscreen button's icon, if the button is on screen. */
function setFullscreenIcon() {
  let button = getElement("game-fullscreen-btn");
  if (!button) return;
  button.innerHTML = getFullscreenIcon();
}

/** Keeps the icon correct when fullscreen is left by pressing Escape rather than the button. */
document.addEventListener("fullscreenchange", setFullscreenIcon);

/** Pauses or unpauses from Escape or the pause button. */
function toggleManualPause() {
  if (pauseReasons.has(pauseReasonManual)) resumeGame(pauseReasonManual);
  else pauseGame(pauseReasonManual);
}

/** Dismisses the enlarge-window prompt for the rest of the session and resumes. */
function dismissWindowPrompt() {
  windowPromptDismissed = true;
  resumeGame(pauseReasonWindow);
}

/**
 * Shows the screen the current pause reasons call for.
 *
 * The order is deliberate: the two environment reasons come first because the
 * player cannot act on a pause screen they cannot see properly, and the plain
 * pause screen only appears when nothing more urgent applies.
 */
function renderPauseState() {
  if (pauseReasons.has(pauseReasonPortrait)) return showRotateScreen();
  if (pauseReasons.has(pauseReasonWindow)) return showEnlargeWindowScreen();
  if (pauseReasons.size > 0) return showPauseScreen();
  showGameScreen();
}

/** Replaces the game with the rotate-your-phone screen. */
function showRotateScreen() {
  hideGameScreen();
  renderHTML("rotatePhone");
}

/** Replaces the game with the enlarge-window prompt. */
function showEnlargeWindowScreen() {
  hideGameScreen();
  renderHTML("enlargeWindow");
  hideUnsupportedFullscreenButton("enlarge-fullscreen-btn");
}

/** Replaces the game with the pause screen. */
function showPauseScreen() {
  hideGameScreen();
  renderHTML("pause");
}

/**
 * Returns to the game, or to the last lobby screen when no game is running.
 *
 * The fallback matters after a run ends: leaving portrait then must restore
 * whatever screen the player was on, not reveal an empty canvas.
 */
function showGameScreen() {
  if (!world) return restoreCurrentScreen();
  hideElement(gameLobby);
  showElement(canvas);
  renderInGameControlsBar();
  showElement(gameControlsBar);
}

/** Hides the canvas and controls, leaving the lobby container free for another screen. */
function hideGameScreen() {
  if (!world) return;
  hideElement(canvas);
  clearInGameControlsBar();
  showElement(gameLobby);
}

/** Checks ten times a second whether the run has been won or lost. */
function monitorGameOver() {
  registerInterval(
    setInterval(() => {
      if (!world || world.paused) return;
      checkIfGameOver();
    }, 100),
  );
}

/**
 * @returns {boolean} True while the canvas is visible, used to decide whether input belongs to the game.
 */
function isGameActive() {
  return canvas && !canvas.classList.contains("d_none");
}

/**
 * Keyboard input.
 *
 * Default actions are only suppressed while the canvas is visible, so arrow
 * keys and space still scroll the lobby and the imprint normally.
 */
window.addEventListener("keydown", async (event) => {
  if (isGameActive() && gameKeyCodes.includes(event.keyCode)) {
    event.preventDefault();
  }
  if (event.keyCode == 27 && world) {
    toggleManualPause();
  }
  if (event.keyCode == 39) {
    keyboard.RIGHT = true;
  }
  if (event.keyCode == 37) {
    keyboard.LEFT = true;
  }
  if (event.keyCode == 32) {
    keyboard.SPACE = true;
  }
  if (event.keyCode == 68) {
    keyboard.D = true;
  }
});

/** Clears the keyboard flags when keys are released. */
window.addEventListener("keyup", async (event) => {
  if (isGameActive() && gameKeyCodes.includes(event.keyCode)) {
    event.preventDefault();
  }
  if (event.keyCode == 39) {
    keyboard.RIGHT = false;
  }
  if (event.keyCode == 37) {
    keyboard.LEFT = false;
  }
  if (event.keyCode == 32) {
    keyboard.SPACE = false;
  }
  if (event.keyCode == 68) {
    keyboard.D = false;
  }
});

/**
 * Looks up the touch controls currently in the DOM.
 *
 * Re-read on every touch rather than cached once, because the controls bar is
 * rebuilt whenever the game screen is shown again.
 *
 * @returns {Object<string, HTMLElement|null>} The buttons by role.
 */
function getResponsiveButtonElements() {
  return {
    left: getElement("left"),
    right: getElement("right"),
    space: getElement("space"),
    shoot: getElement("shoot"),
    muteButton: getElement("game-mute-btn"),
    pauseButton: getElement("game-pause-btn"),
    menuButton: getElement("game-menu-btn"),
    fullscreenButton: getElement("game-fullscreen-btn"),
  };
}

/**
 * Reports whether a touch landed on a button.
 *
 * Uses contains() because the touch target is usually the icon inside the
 * button rather than the button itself.
 *
 * @param {HTMLElement|null} button - The button to test.
 * @param {EventTarget} target - What the touch actually hit.
 * @returns {boolean} True when the touch belongs to this button.
 */
function isTouched(button, target) {
  return !!button && button.contains(target);
}

/**
 * Maps a touch to the control it hit.
 *
 * @param {EventTarget} target - What the touch hit.
 * @returns {string|null} The control's name, or null if the touch missed them all.
 */
function getTouchedKey(target) {
  if (isTouched(responsiveButtons["left"], target)) return "LEFT";
  if (isTouched(responsiveButtons["right"], target)) return "RIGHT";
  if (isTouched(responsiveButtons["space"], target)) return "SPACE";
  if (isTouched(responsiveButtons["shoot"], target)) return "D";
  if (isTouched(responsiveButtons["muteButton"], target)) return "MUTE";
  if (isTouched(responsiveButtons["pauseButton"], target)) return "PAUSE";
  if (isTouched(responsiveButtons["menuButton"], target)) return "MENU";
  if (isTouched(responsiveButtons["fullscreenButton"], target)) return "FULLSCREEN";
  return null;
}

/**
 * Applies a touch to the movement keys.
 *
 * Only names that exist on the keyboard are set, which is how the four action
 * buttons are filtered out of this path and handled by runTouchedAction().
 *
 * @param {TouchEvent} event - The touch event.
 * @param {boolean} isPressed - True on touchstart, false when the touch ends.
 */
function updateTouchedKeys(event, isPressed) {
  for (let i = 0; i < event.changedTouches.length; i++) {
    let key = getTouchedKey(event.changedTouches[i].target);
    if (key && key in keyboard) keyboard[key] = isPressed;
  }
}

/**
 * Runs the one-shot action for a released touch.
 *
 * These four are triggered on release rather than held like the movement keys,
 * so a single tap toggles once.
 *
 * @param {TouchEvent} event - The touchend event.
 */
function runTouchedAction(event) {
  for (let i = 0; i < event.changedTouches.length; i++) {
    let key = getTouchedKey(event.changedTouches[i].target);
    if (key == "MUTE") return toggleMuteAll("mute-all-btn");
    if (key == "PAUSE") return toggleManualPause();
    if (key == "MENU") return backToMenu();
    if (key == "FULLSCREEN") return toggleFullscreen();
  }
}

/**
 * Touch input.
 *
 * Registered with passive: false because preventDefault() has to work here,
 * otherwise holding a control would scroll the page or trigger a long-press
 * menu. Movement is pressed on touchstart and released on touchend, while the
 * action buttons fire only on release.
 */
window.addEventListener(
  "touchstart",
  async (event) => {
    if (isGameActive()) {
      responsiveButtons = getResponsiveButtonElements();
      event.preventDefault();
    }
    updateTouchedKeys(event, true);
  },
  { passive: false },
);

window.addEventListener(
  "touchend",
  async (event) => {
    if (isGameActive()) {
      responsiveButtons = getResponsiveButtonElements();
      event.preventDefault();
    }
    updateTouchedKeys(event, false);
    runTouchedAction(event);
  },
  { passive: false },
);

window.addEventListener("touchcancel", async (event) => {
  if (isGameActive()) {
    responsiveButtons = getResponsiveButtonElements();
  }
  updateTouchedKeys(event, false);
});

/** Clears every key, so nothing stays held across a pause or a screen change. */
function releaseAllKeys() {
  keyboard.LEFT = false;
  keyboard.RIGHT = false;
  keyboard.SPACE = false;
  keyboard.D = false;
}

/** Pauses the game when the tab is hidden, so it does not run on unseen. */
function handleVisibilityChange() {
  if (!document.hidden) return;
  releaseAllKeys();
  if (world) pauseGame(pauseReasonManual);
}

document.addEventListener("visibilitychange", handleVisibilityChange);

/**
 * Records a timer so it can be stopped when the run ends.
 *
 * @param {number} id - The interval or timeout id.
 * @returns {number} The same id, so calls can wrap setInterval directly.
 */
function registerInterval(id) {
  intervalRegistry.push(id);
  return id;
}

/**
 * Stops every registered timer.
 *
 * Each id is passed to both clear functions because the registry does not
 * record which kind it was, and clearing the wrong kind is harmless.
 */
function clearAllIntervals() {
  intervalRegistry.forEach((id) => {
    clearInterval(id);
    clearTimeout(id);
  });
  intervalRegistry.length = 0;
}

/** Tears down a run: timers, sounds, pause reasons and the world itself. */
function endGame() {
  clearAllIntervals();
  stopAllGameSounds();
  clearGameSounds();
  pauseReasons.clear();
  if (world) {
    world.pause();
    world = null;
  }
}

/** Abandons the run and returns to the lobby with its music. */
function backToMenu() {
  hideGameScreen();
  endGame();
  renderLobby("lobby");
  playSound(lobbyMusic, lobbyMusicVolume);
}

/**
 * Ends the run when the character or the endboss has finished dying.
 *
 * Both conditions wait for deathAnimationDone rather than the death flag, so
 * the end screen appears after the final frame instead of cutting the animation
 * short.
 */
function checkIfGameOver() {
  let endboss = world.level.enemies.find((enemy) => enemy instanceof Endboss);
  if (world.character.dead && world.character.deathAnimationDone) {
    endGame();
    showGameOverScreen();
  }
  if (endboss.dead && endboss.deathAnimationDone) {
    endGame();
    showVictoryScreen();
  }
}

/** Shows the victory screen and brings the lobby music back. */
function showVictoryScreen() {
  hideElement(getElement("canvas"));
  clearInGameControlsBar();
  showElement(getElement("lobby"));
  renderHTML("victory");
  playSound(lobbyMusic, lobbyMusicVolume);
  handleOrientationChange();
}

/** Shows the game-over screen and brings the lobby music back. */
function showGameOverScreen() {
  hideElement(getElement("canvas"));
  clearInGameControlsBar();
  showElement(getElement("lobby"));
  renderHTML("gameOver");
  playSound(lobbyMusic, lobbyMusicVolume);
  handleOrientationChange();
}

/** Starts a fresh run from an end screen. */
function restartGame() {
  startGame();
}
