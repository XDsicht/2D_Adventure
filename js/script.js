/**
 * Screen rendering, DOM helpers and device detection.
 *
 * Loaded before every other script, so the media queries and the small helpers
 * below are available to game.js, sounds.js and the model classes. Screens are
 * swapped by replacing the contents of the #lobby container; the canvas itself
 * is a sibling that is shown or hidden rather than re-rendered.
 */

/**
 * Single definition of what counts as a touch device.
 *
 * Deliberately input-based rather than width-based: a narrow desktop window is
 * not a phone, and a large touchscreen is. The identical string appears in
 * responsive.css, so CSS and JS can never disagree about which layout is live.
 */
const responsiveQuery = "(hover: none) and (pointer: coarse)";
const responsiveMedia = window.matchMedia(responsiveQuery);

/**
 * Smallest desktop window the layout fits in.
 *
 * The height is the binding figure: title, canvas and controls bar need 620px,
 * below which the centred flex column overflows in a way scrolling cannot
 * reach. The width is softer, since the canvas scales down on its own.
 */
const minSizeQuery = "(min-width: 880px) and (min-height: 620px)";
const minSizeMedia = window.matchMedia(minSizeQuery);

/**
 * Screens that sit on top of another screen rather than being one.
 *
 * renderHTML() refuses to record these as the current screen, so that resuming
 * from a pause or a rotate overlay returns to whatever was underneath instead
 * of redisplaying the overlay forever.
 */
const transientScreens = ["loading", "rotatePhone", "enlargeWindow", "pause"];

/** The last non-transient screen rendered, restored after an overlay closes. */
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
 * @returns {HTMLElement|null} The element, or null when it is not in the DOM.
 */
function getElement(elementId) {
  return document.getElementById(elementId);
}

/**
 * Renders the sound settings screen and corrects its three buttons.
 *
 * The template interpolates icon globals that may be stale and hard-codes the
 * Mute All label, so those are overwritten here from the real mute state. The
 * screen must always be opened through this function, never renderHTML().
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
 * Like renderSoundControls(), this screen is not self-sufficient: rendering it
 * through renderHTML() alone leaves the heading above three blank boxes.
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
 *
 * Caches the container in the gameControlsBar global, since the touch handlers
 * and clearInGameControlsBar() both reach for it afterwards.
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
 * iPhone Safari reports false here, which is why the in-game bar shows three
 * buttons there and four on Android. Takes an id because the in-game bar and
 * the enlarge-window screen each have their own button.
 *
 * @param {string} id - Id of the fullscreen button to hide.
 */
function hideUnsupportedFullscreenButton(id) {
  if (supportsFullscreen()) return;
  let button = getElement(id);
  if (!button) return;
  hideElement(button);
}

/** Hides and empties the control overlay when leaving the canvas. */
function clearInGameControlsBar() {
  hideElement(gameControlsBar);
  gameControlsBar.innerHTML = "";
}

/**
 * Entry point, called from the body onload attribute.
 *
 * Restores sound settings from the previous page view before rendering, so the
 * lobby draws with the right mute icons, then seeds the pause state so a device
 * already held in portrait shows the rotate screen immediately.
 */
function initApp() {
  loadSoundSettings();
  renderLobby("lobby");
  handleOrientationChange();
}

/**
 * Renders a screen and rebuilds the combined sound array.
 *
 * Used instead of renderHTML() when returning to the menu, because the game
 * sounds from the finished session have just been discarded.
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
 * Remembers the id unless it names a transient overlay, which is what lets
 * restoreCurrentScreen() put the right screen back afterwards.
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
 *
 * Sound settings and the imprint need their own render functions, since
 * neither is complete after renderHTML() alone.
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
 * @returns {string|undefined} The screen's HTML, or undefined for an unknown id.
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
 * Browsers block autoplay until the user interacts with the page, so this
 * listener waits for any click and then removes itself. Clicks on Start Game
 * are ignored because that path launches the in-game music instead.
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
 * @returns {boolean} True only on a touch device currently held in portrait.
 */
function forceRotatePhone() {
  let isPortraitMode = checkOrientation();
  let isMobile = checkIfMobile();
  return isMobile && isPortraitMode
}

/**
 * Reports whether the game is running on a touch device.
 *
 * @returns {boolean} True when the responsive media query matches.
 */
function checkIfMobile() {
  return responsiveMedia.matches;
}

/**
 * Reports whether the device is in portrait.
 *
 * Prefers the Screen Orientation API and falls back to comparing the viewport
 * dimensions, which is less reliable because a soft keyboard can invert them.
 *
 * @returns {boolean} True when the device is in portrait.
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
 * The touch check comes first and is what keeps this feature off phones, which
 * would otherwise fail the height test in landscape and be told to enlarge a
 * window they do not have.
 *
 * @returns {boolean} True only on a pointer device below the minimum size.
 */
function isWindowTooSmall() {
  return !checkIfMobile() && !minSizeMedia.matches;
}

document.addEventListener("click", startLobbyMusic);
