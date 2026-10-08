let allGameSounds = [];
let allSounds = [];
let muted = false;
let lobbyMusicMuted = false;
let gameSoundsMuted = false;
let gameSoundsVolume = 0.5;
let lobbyMusicVolume = 0.2;
let defaultVolume = Number(0.2);
let backgroundMusic = new Audio("audio/game_audio/ingame_music.mp3");
let endbossMusic = new Audio("audio/game_audio/endboss_music.mp3");
let lobbyMusic = new Audio("audio/game_audio/lobby_music.mp3");
let currentMusic = backgroundMusic;
let lobbyMuteIcon;
let gameMuteIcon;
let allMuteIcon;
let musicMuteStatus;
const soundSettingsKey = "vorgaSoundSettings";

function applyAudioState(audio, audioVolume) {
  audio.volume = audioVolume;
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

function resolveVolume(audio) {
  if (audio === lobbyMusic) {
    return lobbyMusicVolume;
  } else if (audio === backgroundMusic) {
    return gameSoundsVolume * 0.12;
  } else if (audio === endbossMusic) {
    return gameSoundsVolume * 0.144;
  } else {
    return gameSoundsVolume;
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
  if (!allGameSounds.includes(audio)) {
    allGameSounds.push(audio);
  }
  return audio;
}

function playSound(audio, audioVolume) {
  activateListener(audio);
  activateLoop(audio);
  getMuteStatus(audio);
  applyAudioState(audio, audioVolume);
  audio.play().catch((error) => {
    if (error.name !== "AbortError") console.error(error);
  });
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
  if (audio === lobbyMusic || audio === backgroundMusic || audio === endbossMusic) {
    audio.loop = true;
  }
}

function activateLobbyMusicListener() {
  lobbyMusic.addEventListener("timeupdate", loopLobbyMusic);
}

function loopLobbyMusic() {
  if (lobbyMusic.duration && lobbyMusic.currentTime >= lobbyMusic.duration - 3) {
    lobbyMusic.currentTime = 0;
  }
}

function activateBackgroundMusicListener() {
  backgroundMusic.addEventListener("timeupdate", loopBackgroundMusic);
}

function loopBackgroundMusic() {
  if (backgroundMusic.duration && backgroundMusic.currentTime >= backgroundMusic.duration - 1) {
    backgroundMusic.currentTime = 3;
  }
}

function startEndbossMusic() {
  stopSound(backgroundMusic);
  currentMusic = endbossMusic;
  playSound(endbossMusic, resolveVolume(endbossMusic));
}

function stopAllGameSounds() {
  allGameSounds.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}

function clearGameSounds() {
  allGameSounds.length = 0;
  createAllSoundsArray();
}

function stopAllSoundEffects() {
  allGameSounds.forEach((audio) => {
    if (audio === backgroundMusic || audio === endbossMusic) return;
    audio.pause();
    audio.currentTime = 0;
  });
}

function toggleMute(id) {
  musicMuteStatus = changeMusicMuteStatus(id);
  setButton(id, musicMuteStatus);
  checkMuteStatus("mute-all-btn");
  saveSoundSettings();
}

function setButton(id, musicMuteStatus) {
  let icon = getMuteIconState(musicMuteStatus);
  let button = getElement(id);
  if (button) button.innerHTML = icon;
  return icon;
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
    muteSound(music, id);
    applyAudioStates(music);
  } else {
    unmuteSound(music, id);
    applyAudioStates(music);
  }
  checkMuteStatus("mute-all-btn");
  saveSoundSettings();
}

function muteSound(music, id) {
  musicMuteStatus = muteMusic(music, id);
  setButton(id, musicMuteStatus);
}

function unmuteSound(music, id) {
  musicMuteStatus = unmuteMusic(music, id);
  setButton(id, musicMuteStatus);
}

function setVolumeVariable(id, number) {
  if (id == "lobby-mute-btn") {
    lobbyMusicVolume = number;
  } else {
    gameSoundsVolume = number;
  }
}

function applyAudioStates(music) {
  if (!Array.isArray(music)) {
    music = [music];
  }
  music.forEach((audio) => {
    let volume = resolveVolume(audio);
    applyAudioState(audio, volume);
  });
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
    muteAllSounds(id, button);
  } else {
    unmuteAllSounds(button);
  }
  saveSoundSettings();
}

function muteAllSounds(id, button) {
  muteMusic(allSounds, id);
  musicMuteStatus = setAllToMute();
  setCorrectMuteButtons(button, musicMuteStatus);
}

function unmuteAllSounds(button) {
  unmuteMusic(allSounds);
  musicMuteStatus = setAllToUnmute();
  setCorrectMuteButtons(button, musicMuteStatus);
  setMinVolume();
}

function setMinVolume() {
  if (lobbyMusicVolume <= 0.02) {
    resetChannelVolume("lobby-mute-btn", "lobby-volume");
  }
  if (gameSoundsVolume <= 0.02) {
    resetChannelVolume("game-mute-btn", "game-volume");
  }
}

function resetChannelVolume(id, sliderId) {
  changeVolume(defaultVolume, id);
  setVolumeSlider(sliderId);
}

function setVolumeSlider(sliderId) {
  let volumeSlider = getElement(sliderId);
  if (volumeSlider) volumeSlider.value = defaultVolume;
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
  setButton("lobby-mute-btn", musicMuteStatus);
  setButton("game-mute-btn", musicMuteStatus);
  if (button) button.textContent = getMuteAllButtonState(musicMuteStatus);
}

function createAllSoundsArray() {
  allSounds = allGameSounds.concat(lobbyMusic);
}

function checkMuteStatus(id) {
  if (lobbyMusicMuted && gameSoundsMuted && !muted) {
    toggleMuteAll(id);
  } else if (!(lobbyMusicMuted && gameSoundsMuted) && muted) {
    muted = !muted;
    setMuteAllButton(id, muted);
  }
}

function setMuteAllButton(id, muted) {
  let button = getElement(id);
  if (!button) return null;
  button.textContent = getMuteAllButtonState(muted);
  return button;
}

function saveSoundSettings() {
  let settings = {
    muted: muted,
    lobbyMusicMuted: lobbyMusicMuted,
    gameSoundsMuted: gameSoundsMuted,
    lobbyMusicVolume: lobbyMusicVolume,
    gameSoundsVolume: gameSoundsVolume,
  };
  sessionStorage.setItem(soundSettingsKey, JSON.stringify(settings));
}

function loadSoundSettings() {
  let stored = sessionStorage.getItem(soundSettingsKey);
  if (!stored) return;
  try {
    applySoundSettings(JSON.parse(stored));
  } catch (error) {
    sessionStorage.removeItem(soundSettingsKey);
  }
}

function applySoundSettings(settings) {
  muted = settings.muted;
  lobbyMusicMuted = settings.lobbyMusicMuted;
  gameSoundsMuted = settings.gameSoundsMuted;
  lobbyMusicVolume = settings.lobbyMusicVolume;
  gameSoundsVolume = settings.gameSoundsVolume;
}
