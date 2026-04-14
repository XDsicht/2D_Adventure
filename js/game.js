let canvas;
let world;
let keyboard = new Keyboard();
let intervalRegistry = [];
let allGameSounds = [];
let muted = false;
let lobbyMusicMuted = false;
let gameSoundsMuted = false;
let gameSoundsVolume = 0.2;
let backgroundMusic = new Audio("audio/game_audio/ingame_music.mp3");
let lobbyMusic = new Audio("audio/game_audio/lobby_music.mp3");

function applyGameSoundState(audio) {
  audio.volume = gameSoundsVolume;
  audio.muted = muted || gameSoundsMuted;
  return audio;
}

function applyLobbyMusicState() {
  lobbyMusic.muted = muted || lobbyMusicMuted;
  return lobbyMusic;
}

function registerGameSound(audio) {
  applyGameSoundState(audio);
  allGameSounds.push(audio);
  return audio;
}

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
  if (
    (world.character.dead && world.character.currentImage == world.character.IMAGES_DEAD.length - 1) ||
    (endboss.dead && endboss.currentImage == endboss.ENDBOSS_IMAGES_DEAD.length - 1)
  ) {
    clearAllIntervals();
    stopAllGameSounds();
    console.log("Game Over");
  }
}

function playSound(audio) {
  if (!audio.muted) {
    audio.currentTime = 0;
    audio.play();
  }
}

function stopAllGameSounds() {
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
  applyGameSoundState(backgroundMusic);
  backgroundMusic.loop = true;
  backgroundMusic.play();
  if (!allGameSounds.includes(backgroundMusic)) {
    registerGameSound(backgroundMusic);
  }
}

function playLobbyMusic() {
  lobbyMusic.addEventListener("timeupdate", () => {
    if (lobbyMusic.duration && lobbyMusic.currentTime >= lobbyMusic.duration - 3) {
      lobbyMusic.currentTime = 0;
    }
  });
  lobbyMusic.volume = 0.2;
  applyLobbyMusicState();
  lobbyMusic.loop = true;
  lobbyMusic.play();
}

function stopLobbyMusic() {
  lobbyMusic.pause();
  lobbyMusic.currentTime = 0;
}

function setLobbyMusicVolume(value) {
  lobbyMusic.volume = value;
}

function setGameSoundsVolume(value) {
  gameSoundsVolume = Number(value);
  allGameSounds.forEach((audio) => {
    applyGameSoundState(audio);
  });
}

function toggleMute(button) {
  muted = !muted;
  button.textContent = muted ? "Unmute All" : "Mute All";
  applyLobbyMusicState();
  allGameSounds.forEach((audio) => {
    applyGameSoundState(audio);
  });
  const svg = muted ? SVG_SPEAKER_OFF : SVG_SPEAKER_ON;
  let lobbyBtn = getElement("lobby-mute-btn");
  let gameBtn = getElement("game-mute-btn");
  if (lobbyBtn) lobbyBtn.innerHTML = svg;
  if (gameBtn) gameBtn.innerHTML = svg;
}

function toggleLobbyMusicMute(button) {
  lobbyMusicMuted = !lobbyMusicMuted;
  applyLobbyMusicState();
  button.innerHTML = lobbyMusic.muted ? SVG_SPEAKER_OFF : SVG_SPEAKER_ON;
}

function toggleGameSoundsMute(button) {
  gameSoundsMuted = !gameSoundsMuted;
  allGameSounds.forEach((audio) => {
    applyGameSoundState(audio);
  });
  button.innerHTML = gameSoundsMuted || muted ? SVG_SPEAKER_OFF : SVG_SPEAKER_ON;
}
