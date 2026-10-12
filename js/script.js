/**
 * Screen rendering, DOM helpers and device detection.
 */

/**
 * Single definition of what counts as a touch device.
 */
const responsiveQuery = "(hover: none) and (pointer: coarse)";
const responsiveMedia = window.matchMedia(responsiveQuery);

/**
 * Smallest desktop window the layout fits in.
 */
const minSizeQuery = "(min-width: 880px) and (min-height: 620px)";
const minSizeMedia = window.matchMedia(minSizeQuery);

/**
 * Screens that sit on top of another screen rather than being one.
 */
const transientScreens = ["loading", "rotatePhone", "enlargeWindow", "pause"];

/** 
 * The last non-transient screen rendered, restored after an overlay closes. 
 */
let currentScreen = "lobby";

/**
 * Makes an element visible again.
 *
 * @param {HTMLElement} element - The element to show.
 */
function showElement(element) {
  element.classList.remove("d_none");
}

/**
 * Hides an element without removing it from the layout flow calculations.
 *
 * @param {HTMLElement} element - The element to hide.
 */
function hideElement(element) {
  element.classList.add("d_none");
}

/**
 * Shorthand for document.getElementById.
 *
 * @param {string} elementId - Id of the element to look up.
 * @returns {HTMLElement|null} - The element, or null when it is not in the DOM.
 */
function getElement(elementId) {
  return document.getElementById(elementId);
}

/**
 * Renders the sound settings screen and corrects its three buttons.
 *
 * @param {string} id - Screen id, always "soundControls".
 */
function renderSoundControls(id) {
  renderHTML(id);
  lobbyMuteIcon = setButton("lobby-mute-btn", lobbyMusicMuted);
  gameMuteIcon = setButton("game-mute-btn", gameSoundsMuted);
  allMuteIcon = setMuteAllButton("mute-all-btn", muted);
}

/**
 * Renders the imprint shell and fills its three empty content containers.
 *
 * @param {string} id - Screen id, always "imprint".
 */
function renderImprint(id) {
  renderHTML(id);
  getElement("gameDescription").innerHTML = getGameDescriptionTemplate();
  getElement("imprintInfo").innerHTML = getImprintInfoTemplate();
  getElement("privacyInfo").innerHTML = getPrivacyInfoTemplate();
}

/**
 * Builds the control overlay that sits on top of the canvas during play.
 */
function renderInGameControlsBar() {
  gameControlsBar = getElement("gameControlsBar");
  gameControlsBar.innerHTML = getGameControlsBarTemplate();
  gameMuteIcon = setButton("game-mute-btn", gameSoundsMuted);
  hideUnsupportedFullscreenButton("game-fullscreen-btn");
}

/**
 * Removes a fullscreen button on browsers without the Fullscreen API.
 *
 * @param {string} id - Id of the fullscreen button to hide.
 */
function hideUnsupportedFullscreenButton(id) {
  if (supportsFullscreen()) return;
  let button = getElement(id);
  if (!button) return;
  hideElement(button);
}

/** 
 * Hides and empties the control overlay when leaving the canvas. 
 */
function clearInGameControlsBar() {
  hideElement(gameControlsBar);
  gameControlsBar.innerHTML = "";
}

/**
 * Entry point, called from the body onload attribute.
 */
function initApp() {
  loadSoundSettings();
  renderLobby("lobby");
  handleOrientationChange();
  startPreloading();
}

/**
 * Renders a screen and rebuilds the combined sound array.
 *
 * @param {string} id - Screen id to render.
 */
function renderLobby(id) {
  renderHTML(id);
  createAllSoundsArray();
}

/**
 * Replaces the contents of the #lobby container with a screen.
 *
 * @param {string} id - Screen id, matching a case in getTemplate().
 */
function renderHTML(id) {
  if (!transientScreens.includes(id)) {
    currentScreen = id;
  }
  let element = getElement("lobby");
  element.innerHTML = getTemplate(id);
}

/**
 * Redraws whichever screen was showing before an overlay covered it.
 */
function restoreCurrentScreen() {
  if (currentScreen == "soundControls") {
    renderSoundControls(currentScreen);
  } else if (currentScreen == "imprint") {
    renderImprint(currentScreen);
  } else {
    renderHTML(currentScreen);
  }
}

/**
 * Maps a screen id to the function that produces its markup.
 *
 * @param {string} id - Screen id.
 * @returns {string|undefined} - The screen's HTML, or undefined for an unknown id.
 */
function getTemplate(id) {
  switch (id) {
    case "loading": return getLoadingTemplate();
    case "lobby": return getLobbyTemplate();
    case "controls": return getControlsTemplate();
    case "soundControls": return getSoundControlsTemplate();
    case "victory": return getVictoryTemplate();
    case "gameOver": return getGameOverTemplate();
    case "rotatePhone": return getRotatePhoneTemplate();
    case "enlargeWindow": return getEnlargeWindowTemplate();
    case "imprint": return getImprintTemplate();
    case "pause": return getPauseTemplate();
  }
}

/**
 * Starts the lobby music on the first click anywhere except Start Game.
 *
 * @param {MouseEvent} event - The click that triggered the check.
 */
function startLobbyMusic(event) {
  if (!event.target.closest("#start-game-btn")) {
    playSound(lobbyMusic, lobbyMusicVolume);
    document.removeEventListener("click", startLobbyMusic);
  }
}

/**
 * Reports whether the rotate overlay should be showing.
 *
 * @returns {boolean} - True only on a touch device currently held in portrait.
 */
function forceRotatePhone() {
  let isPortraitMode = checkOrientation();
  let isMobile = checkIfMobile();
  return isMobile && isPortraitMode
}

/**
 * Reports whether the game is running on a touch device.
 *
 * @returns {boolean} - True when the responsive media query matches.
 */
function checkIfMobile() {
  return responsiveMedia.matches;
}

/**
 * Reports whether the device is in portrait.
 *
 * @returns {boolean} - True when the device is in portrait.
 */
function checkOrientation() {
  if (screen.orientation && screen.orientation.type) {
    return screen.orientation.type.startsWith("portrait");
  }
  return window.innerWidth < window.innerHeight;
}

/**
 * Reports whether a desktop window is too small to lay the game out in.
 *
 * @returns {boolean} - True only on a pointer device below the minimum size.
 */
function isWindowTooSmall() {
  return !checkIfMobile() && !minSizeMedia.matches;
}

document.addEventListener("click", startLobbyMusic);
