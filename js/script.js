function showElement(element) {
  element.classList.remove("d_none");
}

function hideElement(element) {
  element.classList.add("d_none");
}

function getElement(elementId) {
    return document.getElementById(elementId);
}

function renderHTML(templateFn, targetId) {
  getElement(targetId).innerHTML = templateFn();
}

function renderLobby() {
  let lobby = getElement("lobby");
  lobby.innerHTML = getLobbyTemplate();
}

function renderSoundControls() {
  let lobby = getElement("lobby");
  updateSoundButtonsState()
  lobby.innerHTML = getSoundControlsTemplate();
}

document.addEventListener("click", () => {
  playLobbyMusic();
}, { once: true });
