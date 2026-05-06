let allGameSounds = [];
let allSounds = [];
let muted = false;
let lobbyMusicMuted = false;
let gameSoundsMuted = false;
let gameSoundsVolume = 0.2;
let lobbyMusicVolume = 0.2;
let backGroundMusicVolume = gameSoundsVolume * 0.5;
let defaultVolume = Number(0.2);
let backgroundMusic = new Audio("audio/game_audio/ingame_music.mp3");
let lobbyMusic = new Audio("audio/game_audio/lobby_music.mp3");
let lobbyMuteIcon;
let gameMuteIcon;
let musicMuteStatus;

function applyAudioState(audio, audioVolume) {
  audio.volume = audioVolume;
  // audio.muted = muted || lobbyMusicMuted;
  audio.muted = resolveMuted(audio);
  return audio;
}

function resolveMuted(audio) {
  if (audio === lobbyMusic) {
    return lobbyMusicMuted;
  } else {
    return gameSoundsMuted;
  }
}

function getMuteStatus(audio) {
  if (audio === lobbyMusic) {
    return lobbyMusicMuted;
  } else {
    return audio.muted;
  }
}

function registerGameSound(audio) {
  applyAudioState(audio, gameSoundsVolume);
  allGameSounds.push(audio);
  return audio;
}

function playSound(audio, audioVolume) {
  activateListener(audio);
  activateLoop(audio);
  getMuteStatus(audio);
  applyAudioState(audio, audioVolume);
  audio.play();
}

function stopSound(audio) {
  audio.pause();
  audio.currentTime = 0;
}

function activateListener(audio) {
  if (audio === lobbyMusic) {
    activateLobbyMusicListener();
  }
  if (audio === backgroundMusic) {
    activateBackgroundMusicListener();
  }
}

function activateLoop(audio) {
  if (audio === lobbyMusic || audio === backgroundMusic) {
    audio.loop = true;
  }
}

function activateLobbyMusicListener() {
  lobbyMusic.addEventListener("timeupdate", () => {
    if (lobbyMusic.duration && lobbyMusic.currentTime >= lobbyMusic.duration - 3) {
      lobbyMusic.currentTime = 0;
    }
  });
}

function activateBackgroundMusicListener() {
  backgroundMusic.addEventListener("timeupdate", () => {
    if (backgroundMusic.duration && backgroundMusic.currentTime >= backgroundMusic.duration - 1) {
      backgroundMusic.currentTime = 3;
    }
  });
}

function stopAllGameSounds() {
  allGameSounds.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}

function toggleMute(id) {
  musicMuteStatus = changeMusicMuteStatus(id);
  setButton(id, musicMuteStatus);
  allGameSounds.forEach((audio) => console.log(audio.muted));
}

function setButton(id, musicMuteStatus) {
  let button = getElement(id);
  button.innerHTML = getMuteIconState(musicMuteStatus);
}

function changeMusicMuteStatus(id) {
  let music = getMusic(id);
  if (id == "lobby-mute-btn") {
    changeMusicMuteState(music);
    return (lobbyMusicMuted = !lobbyMusicMuted);
  } else {
    changeMusicMuteState(music);
    return (gameSoundsMuted = !gameSoundsMuted);
  }
}

function changeMusicMuteState(music) {
  music.forEach((audio) => {
    audio.muted = !audio.muted;
  });
}

function getMuteIconState(muteState) {
  return muteState ? SVG_SPEAKER_OFF : SVG_SPEAKER_ON;
}

function changeVolume(value, id) {
  let number = Number(value);
  let music = getMusic(id);
  setVolumeVariable(id, number);
  if (number <= 0.02) {
    musicMuteStatus = muteMusic(music, id);
    // console.log("lobbyMusicVolume", lobbyMusic.volume);
    setVolume(music, number);
    setButton(id, musicMuteStatus);
  } else {
    setVolume(music, number);
    musicMuteStatus = unmuteMusic(music, id);
    setButton(id, musicMuteStatus);
  }
  // console.log("lobbyMute:", lobbyMusicMuted);
  // console.log("gameMute:", gameSoundsMuted);
  checkMuteStatus("mute-all-btn");
}

function setVolumeVariable(id, number) {
  if (id == "lobby-mute-btn") {
    lobbyMusicVolume = number;
  } else {
    gameSoundsVolume = number;
  }
}

function setVolume(music, number) {
  if (!Array.isArray(music)) {
    music = [music];
  }
  music.forEach((audio) => (audio.volume = number));
}

function unmuteMusic(music, id) {
  music.forEach((audio) => (audio.muted = false));
  unmuteCorrectMuteVariable(id);
  return false;
}

function unmuteCorrectMuteVariable(id) {
  switch (id) {
    case "lobby-mute-btn":
      lobbyMusicMuted = false;
      break;
    case "game-mute-btn":
      gameSoundsMuted = false;
      break;
    case "mute-all-btn":
      gameSoundsMuted = false;
      lobbyMusicMuted = false;
  }
}

function muteCorrectMuteVariable(id) {
  switch (id) {
    case "lobby-mute-btn":
      lobbyMusicMuted = true;
      break;
    case "game-mute-btn":
      gameSoundsMuted = true;
      break;
  }
}

function getMusic(id) {
  if (id == "lobby-mute-btn") {
    return [lobbyMusic];
  } else {
    return allGameSounds;
  }
}

function toggleMuteAll(id) {
  let button = getElement(id);
  muted = !muted;
  if (muted) {
    muteMusic(allSounds, id);
    musicMuteStatus = setAllToMute();
    setCorrectMuteButtons(button, musicMuteStatus);
  } else {
    unmuteMusic(allSounds);
    musicMuteStatus = setAllToUnmute();
    setCorrectMuteButtons(button, musicMuteStatus);
    setMinVolume(allSounds);
  }
}

function setMinVolume(allSounds) {
  allSounds.forEach((audio) => {
    if (audio.volume <= 0.2) {
      setVolume(audio, defaultVolume);
      setVolumeSlider(audio);
    }
  });
}

function setVolumeSlider(audio) {
  let volumeSlider;
  if (audio == lobbyMusic) {
    volumeSlider = getElement("lobby-volume");
    volumeSlider.value = defaultVolume;
  } else {
    volumeSlider = getElement("game-volume");
    volumeSlider.value = defaultVolume;
  }
}

function muteMusic(music, id) {
  music.forEach((audio) => (audio.muted = true));
  muteCorrectMuteVariable(id);
  return true;
}

function getMuteAllButtonState(muteStatus) {
  return muteStatus ? "Unmute All" : "Mute All";
}

function setAllToMute() {
  gameSoundsMuted = true;
  lobbyMusicMuted = true;
  return true;
}

function setAllToUnmute() {
  gameSoundsMuted = false;
  lobbyMusicMuted = false;
  return false;
}

function setCorrectMuteButtons(button, musicMuteStatus) {
  if (musicMuteStatus) {
    setButton("lobby-mute-btn", musicMuteStatus);
    setButton("game-mute-btn", musicMuteStatus);
    button.textContent = getMuteAllButtonState(musicMuteStatus);
  } else if (!musicMuteStatus) {
    setButton("lobby-mute-btn", musicMuteStatus);
    setButton("game-mute-btn", musicMuteStatus);
    button.textContent = getMuteAllButtonState(musicMuteStatus);
  }
}

function createAllSoundsArray() {
  allGameSounds.forEach((sound) => allSounds.push(sound));
  allSounds.push(lobbyMusic);
  // console.log(allSounds);
}

function checkMuteStatus(id) {
  if (lobbyMusicMuted && gameSoundsMuted && !muted) {
    toggleMuteAll(id);
    // console.log("both muted?", lobbyMusicMuted && gameSoundsMuted);
  } else if (!(lobbyMusicMuted && gameSoundsMuted) && muted) {
    let button = getElement("mute-all-btn");
    muted = !muted;
    button.textContent = getMuteAllButtonState(muted);
  }
}
//TODO: stopSound(lobbyMusic) does not work
//TODO: GameSounds are not muted
