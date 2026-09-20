const RESPONSIVE_QUERY = "(hover: none) and (pointer: coarse)";
const responsiveMedia = window.matchMedia(RESPONSIVE_QUERY);

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

function renderInGameControlsBar() {
  gameControlsBar = getElement("gameControlsBar");
  gameControlsBar.innerHTML = getGameControlsBarTemplate();
  gameMuteIcon = setButton("game-mute-btn", gameSoundsMuted);
  hideUnsupportedFullscreenButton();
}

function hideUnsupportedFullscreenButton() {
  if (supportsFullscreen()) return;
  let button = getElement("game-fullscreen-btn");
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
  let element = getElement("lobby");
  element.innerHTML = getTemplate(id);
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

document.addEventListener("click", startLobbyMusic);
