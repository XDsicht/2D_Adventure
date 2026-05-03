let allGameSounds = [];
let allSounds = [];
let muted = false;
let lobbyMusicMuted = false;
let gameSoundsMuted = false;
let gameSoundsVolume = 0.2;
let lobbyMusicVolume = 0.2;
let defaultVolume = Number(0.4);
let backgroundMusic = new Audio("audio/game_audio/ingame_music.mp3");
let lobbyMusic = new Audio("audio/game_audio/lobby_music.mp3");
let lobbyMuteIcon;
let gameMuteIcon;
let musicMuteStatus;

function applyAudioState(audio, audioVolume) {
  audio.volume = audioVolume;
  audio.muted = muted || lobbyMusicMuted;
  return audio;
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
  if (number <= 0.1) {
    toggleMute(id);
    console.log('lobbyMusicVolume', lobbyMusic.volume);
     
  } else {
    let music = getMusic(id);
    setVolume(music, number);
    musicMuteStatus = unmuteMusic(music);
    setButton(id, musicMuteStatus);
  }
  console.log("lobbyMute:", lobbyMusicMuted);
  console.log("gameMute:", gameSoundsMuted);

  checkMuteStatus("mute-all-btn");
}

function setVolume(music, number) {
  if(!Array.isArray(music)) {
    music = [music];
  }
  music.forEach((audio) => (audio.volume = number));
}

function unmuteMusic(music) {
  music.forEach((audio) => (audio.muted = false));
  unmuteCorrectMuteVariable(music);
  return false;
}

function unmuteCorrectMuteVariable(music) {
  switch (music) {
    case lobbyMusic:
      lobbyMusicMuted = false;
      break;
    case allGameSounds:
      gameSoundsMuted = false;
      break;
    default:
      gameSoundsMuted = false;
      lobbyMusicMuted = false;
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
    muteMusic(allSounds);
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

function muteMusic(music) {
  music.forEach((audio) => (audio.muted = true));
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
  allSounds.push(allGameSounds);
  allSounds.push(lobbyMusic);
}

function checkMuteStatus(id) {
  if (lobbyMusicMuted && gameSoundsMuted) {
    toggleMuteAll(id);
  }
}
//TODO: if both volumes are 0 => toggleMuteAll() behavior
// TODO: reset All mute if one is unmuted
