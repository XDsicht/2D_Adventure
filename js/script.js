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
}

function renderHTML(id) {
  let element = getElement("lobby");
  element.innerHTML = getTemplate(id);
}

function getTemplate(id) {
  if (id == "lobby") {
    return getLobbyTemplate();
  }
  if (id == "controls") {
    return getControlsTemplate();
  }
  if (id == "soundControls") {
    return getSoundControlsTemplate();
  }
}

function startLobbyMusic(event) {
    if (!event.target.closest('#start-game-btn')) {
        playSound(lobbyMusic, lobbyMusicVolume);
        document.removeEventListener('click', startLobbyMusic);
    }
}

document.addEventListener('click', startLobbyMusic)
// document.addEventListener(
//   "click",
//   (event) => {
//     if(!event.target.closest('#start-game-btn')){
//     playSound(lobbyMusic, lobbyMusicVolume);
//     }
//   },
//   { once: true },
// );
