let canvas;
let world;
let keyboard = new Keyboard();
let intervalRegistery = [];
let allSounds = [];
let muted = false;
let backgroundMusic = new Audio("audio/game_audio/ingame_music.mp3");

function startGame() {
  canvas = getElement("canvas");
  overlay = getElement("start_screen");
  showElement(canvas);
  hideElement(overlay);
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
    stopAllSounds();
    console.log("Game Over");
  }
}

function playSound(audio) {
  if (!muted) {
    audio.currentTime = 0;
    audio.play();
  }
}

function stopAllSounds() {
  allSounds.forEach((audio) => {
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
  allSounds.push(backgroundMusic);
}
