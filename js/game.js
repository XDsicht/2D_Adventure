let canvas;
let world;
let keyboard = new Keyboard();
let intervalRegistery = [];
let allGameSounds = [];
let muted = false;
let backgroundMusic = new Audio("audio/game_audio/ingame_music.mp3");
let lobbyMusic = new Audio("audio/game_audio/lobby_music.mp3");

function startGame() {
  stopLobbyMusic();
  canvas = getElement("canvas");
  gameLobby = getElement("lobby");
  showElement(canvas);
  hideElement(gameLobby);
  world = new World(canvas, keyboard);
  backgroundMusic.currentTime = 3;
  playBackgroundMusic();
  registerInterval(
    setInterval(() => {
      checkIfGameOver();
    }, 100),
  );
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
  intervalRegistery.push(id);
  return id;
}

function clearAllIntervals() {
  intervalRegistery.forEach((id) => {
    clearInterval(id);
    clearTimeout(id);
  });
  intervalRegistery.length = 0;
}

function checkIfGameOver() {
  let endboss = world.level.enemies.find((enemy) => enemy instanceof Endboss);
  if (
    (world.character.dead && world.character.currentImage == world.character.IMAGES_DEAD.length - 1) ||
    (endboss.dead && endboss.currentImage == endboss.ENDBOSS_IMAGES_DEAD.length - 1)
  ) {
    clearAllIntervals();
    stopallGameSounds();
    console.log("Game Over");
  }
}

function playSound(audio) {
  if (!muted) {
    audio.currentTime = 0;
    audio.play();
  }
}

function stopallGameSounds() {
  allGameSounds.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}

function playBackgroundMusic() {
  backgroundMusic.addEventListener("timeupdate", () => {
    if (backgroundMusic.duration && backgroundMusic.currentTime >= backgroundMusic.duration - 1) {
      backgroundMusic.currentTime = 3;
    }
  });
  backgroundMusic.volume = 0.2;
  backgroundMusic.loop = true;
  backgroundMusic.play();
  allGameSounds.push(backgroundMusic);
}

function playLobbyMusic() {
  lobbyMusic.addEventListener("timeupdate", () => {
    if (lobbyMusic.duration && lobbyMusic.currentTime >= lobbyMusic.duration - 3) {
      lobbyMusic.currentTime = 0;
    }
  });
  lobbyMusic.volume = 0.2;
  lobbyMusic.loop = true;
  lobbyMusic.play();
}

function stopLobbyMusic() {
  lobbyMusic.pause();
  lobbyMusic.currentTime = 0;
}
