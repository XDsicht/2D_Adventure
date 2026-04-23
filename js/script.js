function showElement(element) {
  element.classList.remove("d_none");
}

function hideElement(element) {
  element.classList.add("d_none");
}

function getElement(elementId) {
    return document.getElementById(elementId);
}

function renderHTML(id) {
  let element = getElement('lobby');
  element.innerHTML = getTemplate(id);
}

document.addEventListener("click", () => {
  playLobbyMusic();
}, { once: true });

function getTemplate(id) {
  if (id == "lobby") {
    return getLobbyTemplate();
  }; 
  if (id == "controls") {
    return getControlsTemplate();
  };
  if (id == "soundControls") {
    return getSoundControlsTemplate();
  }
}