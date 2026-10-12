/**
 * The mute buttons, the volume sliders and the settings that survive a reload.
 *
 */
let lobbyMuteIcon;
let gameMuteIcon;
let allMuteIcon;
let musicMuteStatus;

/**
 * sessionStorage key; session rather than local, so settings die with the tab.
 */
const soundSettingsKey = "vorgaSoundSettings";

/**
 * Flips one channel's mute state from its button.
 *
 * @param {string} id - Button id naming the channel to toggle.
 */
function toggleMute(id) {
  musicMuteStatus = changeMusicMuteStatus(id);
  setButton(id, musicMuteStatus);
  checkMuteStatus("mute-all-btn");
  saveSoundSettings();
}

/**
 * Puts the right speaker icon on a mute button, if that button is on screen.
 *
 * @param {string} id - Button id.
 * @param {boolean} musicMuteStatus - True for the muted icon.
 * @returns {string} - The icon markup, whether or not a button was found.
 */
function setButton(id, musicMuteStatus) {
  let icon = getMuteIconState(musicMuteStatus);
  let button = getElement(id);
  if (button) button.innerHTML = icon;
  return icon;
}

/**
 * Flips every sound in a channel and that channel's flag.
 *
 * @param {string} id - Button id naming the channel.
 * @returns {boolean} - The channel's new mute state.
 */
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

/**
 * Picks the speaker icon for a mute state.
 *
 * @param {boolean} muteState - True when muted.
 * @returns {string} - The matching SVG markup.
 */
function getMuteIconState(muteState) {
  return muteState ? SVG_SPEAKER_OFF : SVG_SPEAKER_ON;
}

/**
 * Applies a slider movement to a channel.
 *
 * @param {string|number} value - The slider's new value.
 * @param {string} id - Button id naming the channel.
 */
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

/**
 * Mutes a channel and updates its button.
 *
 * @param {HTMLAudioElement[]} music - The channel's sounds.
 * @param {string} id - Button id naming the channel.
 */
function muteSound(music, id) {
  musicMuteStatus = muteMusic(music, id);
  setButton(id, musicMuteStatus);
}

/**
 * Unmutes a channel and updates its button.
 *
 * @param {HTMLAudioElement[]} music - The channel's sounds.
 * @param {string} id - Button id naming the channel.
 */
function unmuteSound(music, id) {
  musicMuteStatus = unmuteMusic(music, id);
  setButton(id, musicMuteStatus);
}

/**
 * Stores a new volume for a channel.
 *
 * @param {string} id - Button id naming the channel.
 * @param {number} number - The volume to store.
 */
function setVolumeVariable(id, number) {
  if (id == "lobby-mute-btn") {
    lobbyMusicVolume = number;
  } else {
    gameSoundsVolume = number;
  }
}

/**
 * Unmutes every sound given and clears the matching channel flags.
 *
 * @param {HTMLAudioElement[]} music - The sounds to unmute.
 * @param {string} id - Button id; omitted when unmuting everything.
 * @returns {boolean} - Always false, the new mute state.
 */
function unmuteMusic(music, id) {
  music.forEach((audio) => (audio.muted = false));
  unmuteCorrectMuteVariable(id);
  return false;
}

/**
 * Clears whichever channel flags the button id refers to.
 *
 * @param {string} id - Button id; an unknown or missing id changes nothing.
 */
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

/**
 * Sets whichever channel flag the button id refers to.
 *
 * @param {string} id - Button id; the mute-all case is handled by setAllToMute().
 */
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

/**
 * Mutes or unmutes everything at once.
 *
 * @param {string} id - Id of the Mute All button, absent during play.
 */
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

/**
 * Mutes both channels and updates all three buttons.
 *
 * @param {string} id - Id of the Mute All button.
 * @param {HTMLElement|null} button - The button itself, null when off screen.
 */
function muteAllSounds(id, button) {
  muteMusic(allSounds, id);
  musicMuteStatus = setAllToMute();
  setCorrectMuteButtons(button, musicMuteStatus);
}

/**
 * Unmutes both channels, then rescues any channel left silent.
 *
 * @param {HTMLElement|null} button - The Mute All button, null when off screen.
 */
function unmuteAllSounds(button) {
  unmuteMusic(allSounds);
  musicMuteStatus = setAllToUnmute();
  setCorrectMuteButtons(button, musicMuteStatus);
  setMinVolume();
}

/**
 * Restores a default volume to any channel sitting at zero.
 */
function setMinVolume() {
  if (lobbyMusicVolume <= 0.02) {
    resetChannelVolume("lobby-mute-btn", "lobby-volume");
  }
  if (gameSoundsVolume <= 0.02) {
    resetChannelVolume("game-mute-btn", "game-volume");
  }
}

/**
 * Sets a channel back to the default volume and moves its slider to match.
 *
 * @param {string} id - Button id naming the channel.
 * @param {string} sliderId - Id of that channel's slider.
 */
function resetChannelVolume(id, sliderId) {
  changeVolume(defaultVolume, id);
  setVolumeSlider(sliderId);
}

/**
 * Moves a slider to the default volume, if it is on screen.
 *
 * @param {string} sliderId - Id of the slider to move.
 */
function setVolumeSlider(sliderId) {
  let volumeSlider = getElement(sliderId);
  if (volumeSlider) volumeSlider.value = defaultVolume;
}

/**
 * Mutes every sound given and sets the matching channel flag.
 *
 * @param {HTMLAudioElement[]} music - The sounds to mute.
 * @param {string} id - Button id naming the channel.
 * @returns {boolean} - Always true, the new mute state.
 */
function muteMusic(music, id) {
  music.forEach((audio) => (audio.muted = true));
  muteCorrectMuteVariable(id);
  return true;
}

/**
 * Picks the Mute All button's label.
 *
 * @param {boolean} muteStatus - True when everything is muted.
 * @returns {string} - The label to show.
 */
function getMuteAllButtonState(muteStatus) {
  return muteStatus ? "Unmute All" : "Mute All";
}

/**
 * Marks both channels muted.
 *
 * @returns {boolean} - Always true, for the caller to pass on.
 */
function setAllToMute() {
  gameSoundsMuted = true;
  lobbyMusicMuted = true;
  return true;
}

/**
 * Marks both channels unmuted.
 *
 * @returns {boolean} - Always false, for the caller to pass on.
 */
function setAllToUnmute() {
  gameSoundsMuted = false;
  lobbyMusicMuted = false;
  return false;
}

/**
 * Brings both speaker icons and the Mute All label into line.
 *
 * @param {HTMLElement|null} button - The Mute All button, null when off screen.
 * @param {boolean} musicMuteStatus - The state to show.
 */
function setCorrectMuteButtons(button, musicMuteStatus) {
  setButton("lobby-mute-btn", musicMuteStatus);
  setButton("game-mute-btn", musicMuteStatus);
  if (button) button.textContent = getMuteAllButtonState(musicMuteStatus);
}

/**
 * Keeps the Mute All button honest after a single channel changes.
 *
 * @param {string} id - Id of the Mute All button.
 */
function checkMuteStatus(id) {
  if (lobbyMusicMuted && gameSoundsMuted && !muted) {
    toggleMuteAll(id);
  } else if (!(lobbyMusicMuted && gameSoundsMuted) && muted) {
    muted = !muted;
    setMuteAllButton(id, muted);
  }
}

/**
 * Updates the Mute All label, if the button is on screen.
 *
 * @param {string} id - Button id.
 * @param {boolean} muted - True when everything is muted.
 * @returns {HTMLElement|null} - The button, or null when not rendered.
 */
function setMuteAllButton(id, muted) {
  let button = getElement(id);
  if (!button) return null;
  button.textContent = getMuteAllButtonState(muted);
  return button;
}

/**
 * Writes both channels' mute flags and volumes to sessionStorage.
 */
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

/**
 * Restores saved settings, discarding them if they cannot be parsed.
 */
function loadSoundSettings() {
  let stored = sessionStorage.getItem(soundSettingsKey);
  if (!stored) return;
  try {
    applySoundSettings(JSON.parse(stored));
  } catch (error) {
    sessionStorage.removeItem(soundSettingsKey);
  }
}

/**
 * Copies stored settings back into the live variables.
 *
 * @param {{muted: boolean, lobbyMusicMuted: boolean, gameSoundsMuted: boolean, lobbyMusicVolume: number, gameSoundsVolume: number}} settings - The parsed settings.
 */
function applySoundSettings(settings) {
  muted = settings.muted;
  lobbyMusicMuted = settings.lobbyMusicMuted;
  gameSoundsMuted = settings.gameSoundsMuted;
  lobbyMusicVolume = settings.lobbyMusicVolume;
  gameSoundsVolume = settings.gameSoundsVolume;
}
