let canvas;
let world;
let keyboard = new Keyboard();
let intervalRegistry = [];

async function startGame() {
  renderHTML("loading");
  document.removeEventListener("click", startLobbyMusic);
  initLevel1();
  stopSound(lobbyMusic);
  canvas = getElement("canvas");
  gameLobby = getElement("lobby");
  world = new World(canvas, keyboard);
  registerGameSound(backgroundMusic);
  backgroundMusic.currentTime = 3;
  playSound(backgroundMusic, backGroundMusicVolume);
  registerInterval(
    setInterval(() => {
      checkIfGameOver();
    }, 100),
  );
  await new Promise((resolve) => requestAnimationFrame(resolve));
  showElement(canvas);
  hideElement(gameLobby);
}

window.addEventListener("keydown", async (event) => {
  if (event.keyCode == 39) {
    keyboard.RIGHT = true;
  }
  if (event.keyCode == 37) {
    keyboard.LEFT = true;
  }
  if (event.keyCode == 38) {
    keyboard.UP = true;
  }
  if (event.keyCode == 40) {
    keyboard.DOWN = true;
  }
  if (event.keyCode == 32) {
    keyboard.SPACE = true;
  }
  if (event.keyCode == 68) {
    keyboard.D = true;
  }
});

window.addEventListener("keyup", async (event) => {
  if (event.keyCode == 39) {
    keyboard.RIGHT = false;
  }
  if (event.keyCode == 37) {
    keyboard.LEFT = false;
  }
  if (event.keyCode == 38) {
    keyboard.UP = false;
  }
  if (event.keyCode == 40) {
    keyboard.DOWN = false;
  }
  if (event.keyCode == 32) {
    keyboard.SPACE = false;
  }
  if (event.keyCode == 68) {
    keyboard.D = false;
  }
});

function registerInterval(id) {
  intervalRegistry.push(id);
  return id;
}

function clearAllIntervals() {
  intervalRegistry.forEach((id) => {
    clearInterval(id);
    clearTimeout(id);
  });
  intervalRegistry.length = 0;
}

function checkIfGameOver() {
  let endboss = world.level.enemies.find((enemy) => enemy instanceof Endboss);
  if (world.character.dead && world.character.currentImage == world.character.IMAGES_DEAD.length - 1) {
    clearAllIntervals();
    stopAllGameSounds();
    showGameOverScreen();
  }
  if (endboss.dead && endboss.currentImage == endboss.ENDBOSS_IMAGES_DEAD.length - 1) {
    clearAllIntervals();
    stopAllGameSounds();
    showVictoryScreen();
  }
}

function showVictoryScreen() {
  hideElement(getElement("canvas"));
  showElement(getElement("lobby"));
  renderHTML("victory");
  playSound(lobbyMusic, lobbyMusicVolume);
}

function showGameOverScreen() {
  hideElement(getElement("canvas"));
  showElement(getElement("lobby"));
  renderHTML("gameOver");
  playSound(lobbyMusic, lobbyMusicVolume);
}

function restartGame() {
  initLevel1();
  startGame();
}
