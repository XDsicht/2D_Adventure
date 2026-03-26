let canvas;
let world;
let keyboard = new Keyboard();
let intervalRegistery = [];
let allSounds = [];
let muted = false;

function init() {
  canvas = document.getElementById("canvas");
  world = new World(canvas, keyboard);
  registerInterval(setInterval(() => {checkIfGameOver()}, 100));
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
  if ((world.character.dead && world.character.currentImage == world.character.IMAGES_DEAD.length - 1) || (endboss.dead && endboss.currentImage == endboss.ENDBOSS_IMAGES_DEAD.length - 1)
  ) {
    clearAllIntervals();
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
