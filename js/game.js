let canvas;
let gameControlsBar;
let world;
let keyboard = new Keyboard();
let intervalRegistry = [];
let responsiveButtons = {};
let pauseReasons = new Set();
let windowPromptDismissed = false;
const gameKeyCodes = [37, 38, 39, 40, 32, 68];
const pauseReasonPortrait = "portrait";
const pauseReasonManual = "manual";
const pauseReasonWindow = "window";

function startGame() {
  if (forceRotatePhone()) {
    renderHTML("rotatePhone");
    window.addEventListener("resize", waitForLandscape);
  } else {
    launchGame();
  }
}

function waitForLandscape() {
  if (!checkOrientation()) {
    window.removeEventListener("resize", waitForLandscape);
    startGame();
  }
}

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

function hideLoadingScreen() {
  registerInterval(
    setTimeout(() => {
      handleOrientationChange();
      renderPauseState();
    }, 1500),
  );
}

function handleOrientationChange() {
  syncPauseReason(pauseReasonPortrait, forceRotatePhone());
  syncPauseReason(pauseReasonWindow, shouldPromptEnlarge());
}

function syncPauseReason(reason, active) {
  if (active == pauseReasons.has(reason)) return;
  if (active) pauseGame(reason);
  else resumeGame(reason);
}

function shouldPromptEnlarge() {
  return isWindowTooSmall() && !windowPromptDismissed;
}

window.addEventListener("resize", handleOrientationChange);
window.addEventListener("orientationchange", handleOrientationChange);
responsiveMedia.addEventListener("change", handleOrientationChange);

if (screen.orientation) {
  screen.orientation.addEventListener("change", handleOrientationChange);
}

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

function resumeGame(reason) {
  pauseReasons.delete(reason);
  if (pauseReasons.size == 0 && world && world.paused) {
    world.resume();
    resumeMusic();
  }
  renderPauseState();
}

function resumeMusic() {
  currentMusic.play().catch((error) => {
    if (error.name !== "AbortError") console.error(error);
  });
}

function supportsFullscreen() {
  return document.fullscreenEnabled;
}

function getFullscreenIcon() {
  return document.fullscreenElement ? SVG_EXIT_FULLSCREEN : SVG_FULLSCREEN;
}

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen();
}

function setFullscreenIcon() {
  let button = getElement("game-fullscreen-btn");
  if (!button) return;
  button.innerHTML = getFullscreenIcon();
}

document.addEventListener("fullscreenchange", setFullscreenIcon);

function toggleManualPause() {
  if (pauseReasons.has(pauseReasonManual)) resumeGame(pauseReasonManual);
  else pauseGame(pauseReasonManual);
}

function dismissWindowPrompt() {
  windowPromptDismissed = true;
  resumeGame(pauseReasonWindow);
}

function renderPauseState() {
  if (pauseReasons.has(pauseReasonPortrait)) return showRotateScreen();
  if (pauseReasons.has(pauseReasonWindow)) return showEnlargeWindowScreen();
  if (pauseReasons.size > 0) return showPauseScreen();
  showGameScreen();
}

function showRotateScreen() {
  hideGameScreen();
  renderHTML("rotatePhone");
}

function showEnlargeWindowScreen() {
  hideGameScreen();
  renderHTML("enlargeWindow");
  hideUnsupportedFullscreenButton("enlarge-fullscreen-btn");
}

function showPauseScreen() {
  hideGameScreen();
  renderHTML("pause");
}

function showGameScreen() {
  if (!world) return restoreCurrentScreen();
  hideElement(gameLobby);
  showElement(canvas);
  renderInGameControlsBar();
  showElement(gameControlsBar);
}

function hideGameScreen() {
  if (!world) return;
  hideElement(canvas);
  clearInGameControlsBar();
  showElement(gameLobby);
}

function monitorGameOver() {
  registerInterval(
    setInterval(() => {
      if (!world || world.paused) return;
      checkIfGameOver();
    }, 100),
  );
}

function isGameActive() {
  return canvas && !canvas.classList.contains("d_none");
}

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

function isTouched(button, target) {
  return !!button && button.contains(target);
}

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

function updateTouchedKeys(event, isPressed) {
  for (let i = 0; i < event.changedTouches.length; i++) {
    let key = getTouchedKey(event.changedTouches[i].target);
    if (key && key in keyboard) keyboard[key] = isPressed;
  }
}

function runTouchedAction(event) {
  for (let i = 0; i < event.changedTouches.length; i++) {
    let key = getTouchedKey(event.changedTouches[i].target);
    if (key == "MUTE") return toggleMuteAll("mute-all-btn");
    if (key == "PAUSE") return toggleManualPause();
    if (key == "MENU") return backToMenu();
    if (key == "FULLSCREEN") return toggleFullscreen();
  }
}

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

function releaseAllKeys() {
  keyboard.LEFT = false;
  keyboard.RIGHT = false;
  keyboard.SPACE = false;
  keyboard.D = false;
}

function handleVisibilityChange() {
  if (!document.hidden) return;
  releaseAllKeys();
  if (world) pauseGame(pauseReasonManual);
}

document.addEventListener("visibilitychange", handleVisibilityChange);

function registerInterval(id) {
  intervalRegistry.push(id);
  return id;
}

function clearAllIntervals() {
  intervalRegistry.forEach((id) => {
    clearInterval(id);
    clearTimeout(id);
  });
  intervalRegistry.length = 0;
}

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

function backToMenu() {
  hideGameScreen();
  endGame();
  renderLobby("lobby");
  playSound(lobbyMusic, lobbyMusicVolume);
}

function checkIfGameOver() {
  let endboss = world.level.enemies.find((enemy) => enemy instanceof Endboss);
  if (world.character.dead && world.character.currentImage == world.character.IMAGES_DEAD.length - 1) {
    endGame();
    showGameOverScreen();
  }
  if (endboss.dead && endboss.currentImage == endboss.ENDBOSS_IMAGES_DEAD.length - 1) {
    endGame();
    showVictoryScreen();
  }
}

function showVictoryScreen() {
  hideElement(getElement("canvas"));
  clearInGameControlsBar();
  showElement(getElement("lobby"));
  renderHTML("victory");
  playSound(lobbyMusic, lobbyMusicVolume);
  handleOrientationChange();
}

function showGameOverScreen() {
  hideElement(getElement("canvas"));
  clearInGameControlsBar();
  showElement(getElement("lobby"));
  renderHTML("gameOver");
  playSound(lobbyMusic, lobbyMusicVolume);
  handleOrientationChange();
}

function restartGame() {
  startGame();
}
