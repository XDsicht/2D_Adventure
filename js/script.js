function showElement(element) {
  element.classList.remove("d_none");
}

function hideElement(element) {
  element.classList.add("d_none");
}

function getElement(elementId) {
    return document.getElementById(elementId);
}

document.addEventListener("click", () => {
  playLobbyMusic();
}, { once: true });
