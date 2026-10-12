/**
 * Contains logic for everything the player can press: the keyboard, the touch controls and the
 * buttons in the in-game bar.
 */
let keyboard = new Keyboard();

/** 
 * Cached touch-control elements, re-read on each touch because the bar is re-rendered. 
 */
let responsiveButtons = {};

/** 
 * Keys whose default browser action is suppressed in-game, so arrows and space do not scroll the page. 
 */
const gameKeyCodes = [37, 38, 39, 40, 32, 68];

/**
 * @returns {boolean} - True while the canvas is visible, used to decide whether input belongs to the game.
 */
function isGameActive() {
  return canvas && !canvas.classList.contains("d_none");
}

/**
 * Keyboard input.
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

/**
 * Clears the keyboard flags when keys are released.
 */
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
 * @returns {Object<string, HTMLElement|null>} - The buttons by role.
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
 * @param {HTMLElement|null} button - The button to test.
 * @param {EventTarget} target - What the touch actually hit.
 * @returns {boolean} - True when the touch belongs to this button.
 */
function isTouched(button, target) {
  return !!button && button.contains(target);
}

/**
 * Maps a touch to the control it hit.
 *
 * @param {EventTarget} target - What the touch hit.
 * @returns {string|null} - The control's name, or null if the touch missed them all.
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
 * Lights up the controls a touch landed on.
 *
 * @param {TouchEvent} event - The touchstart event.
 */
function markPressedButtons(event) {
  for (let i = 0; i < event.changedTouches.length; i++) {
    let button = event.changedTouches[i].target.closest(".key-badge, .mute-btn");
    if (button) button.classList.add("pressed");
  }
}

/**
 * Unlights every control.
 */
function clearPressedButtons() {
  let buttons = document.querySelectorAll(".pressed");
  buttons.forEach((button) => button.classList.remove("pressed"));
}

/**
 * Runs the one-shot action for a released touch.
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
 */
window.addEventListener(
  "touchstart",
  async (event) => {
    if (isGameActive()) {
      responsiveButtons = getResponsiveButtonElements();
      event.preventDefault();
    }
    updateTouchedKeys(event, true);
    markPressedButtons(event);
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
    clearPressedButtons();
    runTouchedAction(event);
  },
  { passive: false },
);

window.addEventListener("touchcancel", async (event) => {
  if (isGameActive()) {
    responsiveButtons = getResponsiveButtonElements();
  }
  updateTouchedKeys(event, false);
  clearPressedButtons();
});

/**
 * Clears every key, so nothing stays held across a pause or a screen change.
*/
function releaseAllKeys() {
  keyboard.LEFT = false;
  keyboard.RIGHT = false;
  keyboard.SPACE = false;
  keyboard.D = false;
}

/**
 * Pauses or unpauses from Escape or the pause button.
 */
function toggleManualPause() {
  if (pauseReasons.has(pauseReasonManual)) resumeGame(pauseReasonManual);
  else pauseGame(pauseReasonManual);
}

/**
 * @returns {boolean} - True when the browser allows fullscreen.
 */
function supportsFullscreen() {
  return document.fullscreenEnabled;
}

/**
 * @returns {string} - The enter or exit icon, matching the current state.
 */
function getFullscreenIcon() {
  return document.fullscreenElement ? SVG_EXIT_FULLSCREEN : SVG_FULLSCREEN;
}

/**
 * Enters or leaves fullscreen.
 */
function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen();
}

/**
 * Updates the fullscreen button's icon, if the button is on screen.
 */
function setFullscreenIcon() {
  let button = getElement("game-fullscreen-btn");
  if (!button) return;
  button.innerHTML = getFullscreenIcon();
}

/**
 * Keeps the icon correct when fullscreen is left by pressing Escape rather than the button.
 */
document.addEventListener("fullscreenchange", setFullscreenIcon);
