let allGameSounds = [];
let muted = false;
let lobbyMusicMuted = false;
let gameSoundsMuted = false;
let gameSoundsVolume = 0.2;
let lobbyMusicVolume = 0.2;
let backgroundMusic = new Audio("audio/game_audio/ingame_music.mp3");
let lobbyMusic = new Audio("audio/game_audio/lobby_music.mp3");
let lobbyMuteIcon = getLobbyMuteIconState();
let gameMuteIcon = getGameMuteIconState();
let muteAllText = getMuteAllText();

function applyGameSoundState(audio) {
  audio.volume = gameSoundsVolume;
  audio.muted = muted || gameSoundsMuted;
  return audio;
}

function applyLobbyMusicState() {
  lobbyMusic.volume = lobbyMusicVolume;
  lobbyMusic.muted = muted || lobbyMusicMuted;
  return lobbyMusic;
}

function registerGameSound(audio) {
  applyGameSoundState(audio);
  allGameSounds.push(audio);
  return audio;
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
  applyLobbyMusicState();
  lobbyMusic.loop = true;
  lobbyMusic.play();
}

function stopLobbyMusic() {
  lobbyMusic.pause();
  lobbyMusic.currentTime = 0;
}

function setLobbyMusicVolume(value) {
  lobbyMusicVolume = Number(value);
  applyLobbyMusicState();
}

function setGameSoundsVolume(value) {
  gameSoundsVolume = Number(value);
  allGameSounds.forEach((audio) => {
    applyGameSoundState(audio);
  });
}

function toggleMuteAll(button) {
  muted = !muted;
  button.textContent = muted ? "Unmute All" : "Mute All";
  applyLobbyMusicState();
  allGameSounds.forEach((audio) => {
    applyGameSoundState(audio);
  });
  let svg = muted ? SVG_SPEAKER_OFF : SVG_SPEAKER_ON;
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

// TODO: hier weiter mit neuen allg. Soundfunction

function toggleMute(id) {
  muted = changeMusicMuteStatus(id);
  let button = getElement(id);
  button.innerHTML = getMuteIconState(muted);
}

function changeMusicMuteStatus(id) {
  if (id == "lobby-mute-btn") {
    return (lobbyMusic.muted = !lobbyMusic.muted);
  } else {
    changeGameSoundsState();
    return (gameSoundsMuted = !gameSoundsMuted);
  }
}

function changeGameSoundsState() {
  allGameSounds.forEach((audio) => {
    audio.muted = !audio.muted;
  });
}

function getMuteIconState(muted) {
  return muted ? SVG_SPEAKER_OFF : SVG_SPEAKER_ON;
}

function updateSoundButtonsState() {
  lobbyMuteIcon = getLobbyMuteIconState();
  gameMuteIcon = getGameMuteIconState();
  muteAllText = getMuteAllText();
}

function getLobbyMuteIconState() {
  return lobbyMusic.muted ? SVG_SPEAKER_OFF : SVG_SPEAKER_ON;
}

function getGameMuteIconState() {
  return gameSoundsMuted ? SVG_SPEAKER_OFF : SVG_SPEAKER_ON;
}

function getMuteAllText() {
  return muted ? "Unmute All" : "Mute All";
}

function setVolume(value, id) {
  let number = Number(value);
  if (number == 0) {
    setMute(id);
  } else {
    let music = getMusic(id);
    music.forEach((sound) => (sound.volume = number));
  }
}

// TODO: Muted umkehren

function getMusic(id) {
  if (id == "lobby-volume") {
    return [lobbyMusic];
  } else {
    return allGameSounds;
  }
}

function setMute(id) {
  if (id === "lobby-volume") {
    lobbyMusic.muted = true;
  } else {
    allGameSounds.forEach((sound) => {
      sound.muted = true;
    });
  }
}
