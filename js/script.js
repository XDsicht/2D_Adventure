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

function initApp() {
  if (forceRotatePhone()) {
    renderHTML("rotatePhone");
    window.addEventListener("resize", resumeOnLandscapeMode);
  } else {
    renderLobby("lobby");
  }
}

function renderLobby(id) {
  renderHTML(id);
  checkIfSoundArrayExists();
  window.addEventListener("resize", pauseOnPortraitMode);
}

function checkIfSoundArrayExists() {
  if (allSounds.length == 0) {
    createAllSoundsArray();
  }
}

function renderHTML(id) {
  let element = getElement("lobby");
  element.innerHTML = getTemplate(id);
}

function getTemplate(id) {
  if (id == "loading") {
    return getLoadingTemplate();
  }
if (id == "lobby") {
    return getLobbyTemplate();
  }
  if (id == "controls") {
    return getControlsTemplate();
  }
  if (id == "soundControls") {
    return getSoundControlsTemplate();
  }
  if (id == "victory") {
    return getVictoryTemplate();
  }
  if (id == "gameOver") {
    return getGameOverTemplate();
  }
  if (id == "rotatePhone") {
    return getRotatePhoneTemplate();
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
  return window.innerWidth < 720 || window.innerHeight < 480;
}

function checkOrientation() {
  return window.innerWidth < window.innerHeight;
}

document.addEventListener("click", startLobbyMusic);
