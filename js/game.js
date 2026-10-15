/**
 * Everything outside the canvas lives here: Game lifecycle, pausing, screen routing and input.
 */
let canvas;
let gameControlsBar;

/** 
 * The running game world, or null between runs. Most of this file checks it before acting. 
 * */
let world;

/**
 * This array collects all interval and timeout IDs started during a run.
 */
let intervalRegistry = [];
let pauseReasons = new Set();

/** Set once the player dismisses the enlarge-window prompt, so it does not return. */
let windowPromptDismissed = false;

/** True once the victory screen is scheduled, so the ten-a-second poll cannot queue it twice. */
let victoryPending = false;

/**
 * The pause reasons to be tracked independently, so the game can be paused for multiple reasons at once and only resumes when all are cleared.
 */
const pauseReasonPortrait = "portrait";
const pauseReasonManual = "manual";
const pauseReasonWindow = "window";

/**
 * Starts a game run, or asks the player to rotate first, depending on the device's orientation.
 */
function startGame() {
  if (forceRotatePhone()) {
    renderHTML("rotatePhone");
    window.addEventListener("resize", waitForLandscape);
  } else {
    launchGame();
  }
}

/** 
 * One-shot resize handler that launches the deferred run once the device is in landscape.
 */
function waitForLandscape() {
  if (!checkOrientation()) {
    window.removeEventListener("resize", waitForLandscape);
    startGame();
  }
}

/**
 * Shows the loading screen, waits for the sprites, then builds the game.
 */
async function launchGame() {
  renderHTML("loading");
  document.removeEventListener("click", startLobbyMusic);
  stopSound(lobbyMusic);
  await waitForAssets();
  startWorld();
}

/**
 * Builds the level and the world and starts the game-over watcher.
 */
function startWorld() {
  initLevel1();
  canvas = getElement("canvas");
  gameLobby = getElement("lobby");
  renderInGameControlsBar();
  initGame(canvas);
  handleOrientationChange();
  freezeWorld();
  renderPauseState();
  monitorGameOver();
}

/**
 * Creates the world and starts the background music.
 *
 * @param {HTMLCanvasElement} canvas - The canvas the world draws to.
 */
function initGame(canvas) {
  world = new World(canvas, keyboard);
  registerGameSound(backgroundMusic);
  registerGameSound(endbossMusic);
  registerGameSound(coinCollectSound);
  createAllSoundsArray();
  applyAudioStates(allSounds);
  currentMusic = backgroundMusic;
  backgroundMusic.currentTime = 3;
  let volume = resolveVolume(backgroundMusic);
  playSound(backgroundMusic, volume);
}

/**
 * Re-evaluates the two environment-driven pause reasons.
 */
function handleOrientationChange() {
  syncPauseReason(pauseReasonPortrait, forceRotatePhone());
  syncPauseReason(pauseReasonWindow, shouldPromptEnlarge());
}

/**
 * Adds or removes one pause reason, doing nothing if it is already in that state.
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
 * @returns {boolean} - True when the window is too small and the prompt has not been dismissed.
 */
function shouldPromptEnlarge() {
  return isWindowTooSmall() && !windowPromptDismissed;
}

/**
 * Four sources for one handler: window resize, the legacy orientation event, the shared media query and the Screen Orientation API.
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
 * @param {string} reason - The reason being added.
 */
function pauseGame(reason) {
  pauseReasons.add(reason);
  releaseAllKeys();
  freezeWorld();
  renderPauseState();
}

/**
 * Freezes the world whenever something is blocking play like a rotate prompt or a manual pause, and stops the music and sound effects.
 */
function freezeWorld() {
  if (pauseReasons.size == 0) return;
  if (world && !world.paused) {
    world.pause();
    stopAllSoundEffects();
    currentMusic.pause();
  }
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
 * Resumes whichever track was playing before the game was paused, and logs any error that is not an AbortError.
 */
function resumeMusic() {
  currentMusic.play().catch((error) => {
    if (error.name !== "AbortError") console.error(error);
  });
}

/**
 * Dismisses the enlarge-window prompt for the rest of the session and resumes. 
 */
function dismissWindowPrompt() {
  windowPromptDismissed = true;
  resumeGame(pauseReasonWindow);
}

/**
 * Shows the screen the current pause reasons call for.
 */
function renderPauseState() {
  if (pauseReasons.has(pauseReasonPortrait)) return showRotateScreen();
  if (pauseReasons.has(pauseReasonWindow)) return showEnlargeWindowScreen();
  if (pauseReasons.size > 0) return showPauseScreen();
  showGameScreen();
}

/** 
 * Replaces the game with the rotate-your-phone screen. 
 */
function showRotateScreen() {
  hideGameScreen();
  renderHTML("rotatePhone");
}

/** 
 * Replaces the game with the enlarge-window prompt.
*/
function showEnlargeWindowScreen() {
  hideGameScreen();
  renderHTML("enlargeWindow");
  hideUnsupportedFullscreenButton("enlarge-fullscreen-btn");
}

/** 
 * Replaces the game with the pause screen. 
 */
function showPauseScreen() {
  hideGameScreen();
  renderHTML("pause");
}

/**
 * Returns to the game, or to the last lobby screen when no game is running.
 */
function showGameScreen() {
  if (!world) return restoreCurrentScreen();
  hideElement(gameLobby);
  showElement(canvas);
  renderInGameControlsBar();
  showElement(gameControlsBar);
}

/** 
 * Hides the canvas and controls, leaving the lobby container free for another screen. 
 */
function hideGameScreen() {
  if (!world) return;
  hideElement(canvas);
  clearInGameControlsBar();
  showElement(gameLobby);
}

/** 
 * Checks ten times a second whether the run has been won or lost. 
*/
function monitorGameOver() {
  registerInterval(
    setInterval(() => {
      if (!world || world.paused) return;
      checkIfGameOver();
    }, 100),
  );
}

/**
 * Pauses the game when the tab is hidden, so it does not run on unseen. 
*/
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
 * @returns {number} - The same id, so calls can wrap setInterval directly.
 */
function registerInterval(id) {
  intervalRegistry.push(id);
  return id;
}

/**
 * Stops every registered timer.
 */
function clearAllIntervals() {
  intervalRegistry.forEach((id) => {
    clearInterval(id);
    clearTimeout(id);
  });
  intervalRegistry.length = 0;
}

/** 
 * Tears down a run: timers, sounds, pause reasons and the world itself. 
 */
function endGame() {
  clearAllIntervals();
  stopAllGameSounds();
  clearGameSounds();
  pauseReasons.clear();
  victoryPending = false;
  if (world) {
    world.pause();
    world = null;
  }
}

/** 
 * Abandons the run and returns to the lobby with its music. 
 */
function backToMenu() {
  hideGameScreen();
  endGame();
  renderLobby("lobby");
  playSound(lobbyMusic, lobbyMusicVolume);
}

/**
 * Ends the run when the character or the endboss has finished dying.
 */
function checkIfGameOver() {
  if (world.character.dead && world.character.deathAnimationDone) {
    endGame();
    showGameOverScreen();
    return;
  }
  if (checkEndbossDefeated()) {
    scheduleVictory();
  }
}

/**
 * Reports whether the boss has finished dying.
 *
 * @returns {boolean} - True once the boss is gone or has played its last frame.
 */
function checkEndbossDefeated() {
  let endboss = world.level.enemies.find((enemy) => enemy instanceof Endboss);
  if (!endboss) return true;
  return endboss.dead && endboss.deathAnimationDone;
}

/**
 * Lets the boss's death roar finish before the victory screen appears.
 */
function scheduleVictory() {
  if (victoryPending) return;
  victoryPending = true;
  registerInterval(
    setTimeout(() => {
      endGame();
      showVictoryScreen();
    }, 2200),
  );
}

/** 
 * Shows the victory screen and brings the lobby music back. 
 */
function showVictoryScreen() {
  hideElement(getElement("canvas"));
  clearInGameControlsBar();
  showElement(getElement("lobby"));
  renderHTML("victory");
  playSound(lobbyMusic, lobbyMusicVolume);
  handleOrientationChange();
}

/** 
 * Shows the game-over screen and brings the lobby music back. 
 */
function showGameOverScreen() {
  hideElement(getElement("canvas"));
  clearInGameControlsBar();
  showElement(getElement("lobby"));
  renderHTML("gameOver");
  playSound(lobbyMusic, lobbyMusicVolume);
  handleOrientationChange();
}

/** 
 * Starts a fresh run from an end screen. 
 */
function restartGame() {
  startGame();
}
