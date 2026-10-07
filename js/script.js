const responsiveQuery = "(hover: none) and (pointer: coarse)";
const responsiveMedia = window.matchMedia(responsiveQuery);
const minSizeQuery = "(min-width: 880px) and (min-height: 620px)";
const minSizeMedia = window.matchMedia(minSizeQuery);
const transientScreens = ["loading", "rotatePhone", "enlargeWindow", "pause"];
let currentScreen = "lobby";

function showElement(element) {
  element.classList.remove("d_none");
}

function hideElement(element) {
  element.classList.add("d_none");
}

function getElement(elementId) {
  return document.getElementById(elementId);
}

function renderSoundControls(id) {
  renderHTML(id);
  lobbyMuteIcon = setButton("lobby-mute-btn", lobbyMusicMuted);
  gameMuteIcon = setButton("game-mute-btn", gameSoundsMuted);
  allMuteIcon = setMuteAllButton("mute-all-btn", muted);
}

function renderImprint(id) {
  renderHTML(id);
  getElement("gameDescription").innerHTML = getGameDescriptionTemplate();
  getElement("imprintInfo").innerHTML = getImprintInfoTemplate();
  getElement("privacyInfo").innerHTML = getPrivacyInfoTemplate();
}

function renderInGameControlsBar() {
  gameControlsBar = getElement("gameControlsBar");
  gameControlsBar.innerHTML = getGameControlsBarTemplate();
  gameMuteIcon = setButton("game-mute-btn", gameSoundsMuted);
  hideUnsupportedFullscreenButton("game-fullscreen-btn");
}

function hideUnsupportedFullscreenButton(id) {
  if (supportsFullscreen()) return;
  let button = getElement(id);
  if (!button) return;
  hideElement(button);
}

function clearInGameControlsBar() {
  hideElement(gameControlsBar);
  gameControlsBar.innerHTML = "";
}

function initApp() {
  loadSoundSettings();
  renderLobby("lobby");
  handleOrientationChange();
}

function renderLobby(id) {
  renderHTML(id);
  createAllSoundsArray();
}

function renderHTML(id) {
  if (!transientScreens.includes(id)) {
    currentScreen = id;
  }
  let element = getElement("lobby");
  element.innerHTML = getTemplate(id);
}

function restoreCurrentScreen() {
  if (currentScreen == "soundControls") {
    renderSoundControls(currentScreen);
  } else if (currentScreen == "imprint") {
    renderImprint(currentScreen);
  } else {
    renderHTML(currentScreen);
  }
}

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

function startLobbyMusic(event) {
  if (!event.target.closest("#start-game-btn")) {
    playSound(lobbyMusic, lobbyMusicVolume);
    document.removeEventListener("click", startLobbyMusic);
  }
}

function forceRotatePhone() {
  let isPortraitMode = checkOrientation();
  let isMobile = checkIfMobile();
  return isMobile && isPortraitMode
}

function checkIfMobile() {
  return responsiveMedia.matches;
}

function checkOrientation() {
  if (screen.orientation && screen.orientation.type) {
    return screen.orientation.type.startsWith("portrait");
  }
  return window.innerWidth < window.innerHeight;
}

function isWindowTooSmall() {
  return !checkIfMobile() && !minSizeMedia.matches;
}

document.addEventListener("click", startLobbyMusic);
