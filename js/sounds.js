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

// function applyGameSoundState(audio) {
//   audio.volume = gameSoundsVolume;
//   audio.muted = muted || gameSoundsMuted;
//   return audio;
// }

//  used
function applyAudioState(audio, audioVolume) {
  audio.volume = audioVolume;
  audio.muted = muted || lobbyMusicMuted;
  return audio;
}

// used
function getMuteStatus(audio) {
  if (audio === lobbyMusic) {
    return lobbyMusicMuted;
  } else {
    return audio.muted;
  }
}

// used
function registerGameSound(audio) {
  // applyGameSoundState(audio);
  applyAudioState(audio, gameSoundsVolume)
  allGameSounds.push(audio);
  return audio;
}

// backgroundmusics
//  used for bg music
function playSound(audio, audioVolume) {
  activateListener(audio);
  activateLoop(audio);
  getMuteStatus(audio);
  applyAudioState(audio, audioVolume);
  audio.play();
}

// used
function stopSound(audio) {
  audio.pause();
  audio.currentTime = 0;
};

// TODO: New play and stop functions
// used
function activateListener(audio) {
  if (audio === lobbyMusic) {
    activateLobbyMusicListener();
  }
  if(audio === backgroundMusic) {
    activateBackgroundMusicListener();
  }
}
//  used
function activateLoop(audio) {
  if (audio === lobbyMusic || audio === backgroundMusic) {
    audio.loop = true;
  }
}
// used
function activateLobbyMusicListener() {
  lobbyMusic.addEventListener("timeupdate", () => {
    if (lobbyMusic.duration && lobbyMusic.currentTime >= lobbyMusic.duration - 3) {
      lobbyMusic.currentTime = 0;
    }
  });
}
//  used
function activateBackgroundMusicListener() {
  backgroundMusic.addEventListener("timeupdate", () => {
    if (backgroundMusic.duration && backgroundMusic.currentTime >= backgroundMusic.duration - 1) {
      backgroundMusic.currentTime = 3;
    }
  });
}

// used
function stopAllGameSounds() {
  allGameSounds.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}

function toggleMuteAll(id) {
  muted = !muted;
  let button = getElement(id);
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

// TODO: hier weiter mit neuen allg. Soundfunction

function muteAll() {}
// used
function toggleMute(id) {
  musicMuteStatus = changeMusicMuteStatus(id);
  setButton(id, musicMuteStatus);
}
// used
function setButton(id, musicMuteStatus) {
  let button = getElement(id);
  button.innerHTML = getMuteIconState(musicMuteStatus);
}
// used
function changeMusicMuteStatus(id) {
  if (id == "lobby-mute-btn") {
    return (lobbyMusic.muted = !lobbyMusic.muted);
  } else {
    changeMusicMuteState(allGameSounds);
    return (gameSoundsMuted = !gameSoundsMuted);
  }
}
// used
function changeMusicMuteState(music) {
  music.forEach((audio) => {
    audio.muted = !audio.muted;
  });
}
// used
function getMuteIconState(muteState) {
  return muteState ? SVG_SPEAKER_OFF : SVG_SPEAKER_ON;
}

function updateSoundButtonsState() {
  lobbyMuteIcon = getLobbyMuteIconState();
  gameMuteIcon = getGameMuteIconState();
  muteAllText = getMuteAllText();
}

function getMuteAllText() {
  return muted ? "Unmute All" : "Mute All";
}

function setVolume(value, id) {
  let number = Number(value);
  if (number == 0) {
    muted = setMute(id);
    updateButtonState(id, muted);
  } else {
    let music = getMusic(id);
    muted = setUnmute(id);
    music.forEach((sound) => (sound.volume = number));
    updateButtonState(id, muted);
  }
}

function updateButtonState(id, muted) {
  if (id === "lobby-volume") {
    setButton("lobby-mute-btn", muted);
  } else {
    setButton("game-mute-btn", muted);
  }
}

function getMusic(id) {
  if (id == "lobby-volume") {
    return [lobbyMusic];
  } else {
    return allGameSounds;
  }
}

function setMute(id) {
  if (id === "lobby-volume") {
    return lobbyMusic.muted = true;
  } else {
    allGameSounds.forEach((sound) => {
      sound.muted = true;
    });
    return gameSoundsMuted = true;
  }
}

function setUnmute(id) {
  if (id === "lobby-volume") {
    return lobbyMusic.muted = false;
  } else {
    allGameSounds.forEach((sound) => {
      sound.muted = false;
    });
    return gameSoundsMuted = false;
  }
}