/**
 * All audio: playback, the two mute channels, volume and persistence.
 *
 * Sounds are grouped into two channels. Lobby music is one, and everything
 * heard during play - the music plus every effect - is the other. Each channel
 * has its own mute flag and volume, and most functions here take a button id
 * rather than a channel name, because the ids are what the templates already
 * carry: "lobby-mute-btn" means the lobby channel, anything else means game
 * sounds.
 *
 * Effects play at the full channel volume while music is scaled well below it
 * so the two never compete. Settings survive a reload through sessionStorage
 * and are discarded when the tab closes.
 */
/** Every sound registered for the current game, music included. */
let allGameSounds = [];

/** allGameSounds plus the lobby music, rebuilt whenever the game sounds change. */
let allSounds = [];

/** Whether both channels are muted, which is what the Mute All button reflects. */
let muted = false;
let lobbyMusicMuted = false;
let gameSoundsMuted = false;
let gameSoundsVolume = 0.5;
let lobbyMusicVolume = 0.2;

/** Level a channel is restored to when unmuted from silence. */
let defaultVolume = Number(0.2);
let backgroundMusic = new Audio("audio/game_audio/ingame_music.mp3");
let endbossMusic = new Audio("audio/game_audio/endboss_music.mp3");
let lobbyMusic = new Audio("audio/game_audio/lobby_music.mp3");

/**
 * Whichever music track is playing right now.
 *
 * Pause and resume act on this rather than on backgroundMusic directly, so the
 * endboss fight pauses the track actually playing instead of restarting the
 * wrong one underneath it.
 */
let currentMusic = backgroundMusic;
let lobbyMuteIcon;
let gameMuteIcon;
let allMuteIcon;
let musicMuteStatus;

/** sessionStorage key; session rather than local, so settings die with the tab. */
const soundSettingsKey = "vorgaSoundSettings";

/**
 * Applies a volume and the current mute state of the sound's channel.
 *
 * @param {HTMLAudioElement} audio - The sound to configure.
 * @param {number} audioVolume - Volume to set, 0 to 1.
 * @returns {HTMLAudioElement} The same sound, for chaining.
 */
function applyAudioState(audio, audioVolume) {
  audio.volume = audioVolume;
  audio.muted = resolveMuted(audio);
  return audio;
}

/**
 * Reports which channel's mute flag applies to a sound.
 *
 * @param {HTMLAudioElement} audio - The sound to check.
 * @returns {boolean} True when that sound's channel is muted.
 */
function resolveMuted(audio) {
  if (audio === lobbyMusic) {
    return lobbyMusicMuted;
  } else {
    return gameSoundsMuted;
  }
}

/**
 * Works out the volume a sound should play at.
 *
 * The three music tracks are deliberately far quieter than the effects: the
 * in-game music at about an eighth of the effect volume, and the endboss
 * theme a fifth louder than that so the fight feels heavier. Everything else
 * plays at the full game volume.
 *
 * @param {HTMLAudioElement} audio - The sound to price.
 * @returns {number} The volume to use, 0 to 1.
 */
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

/**
 * Reports a sound's mute state.
 *
 * @param {HTMLAudioElement} audio - The sound to check.
 * @returns {boolean} The channel flag for lobby music, the element's own flag otherwise.
 */
function getMuteStatus(audio) {
  if (audio === lobbyMusic) {
    return lobbyMusicMuted;
  } else {
    return audio.muted;
  }
}

/**
 * Adds a sound to the current game so mute and volume changes reach it.
 *
 * Anything not registered still plays, but cannot be muted mid-playback or
 * stopped when the game ends.
 *
 * @param {HTMLAudioElement} audio - The sound to register.
 * @returns {HTMLAudioElement} The same sound, for chaining.
 */
function registerGameSound(audio) {
  applyAudioState(audio, gameSoundsVolume);
  if (!allGameSounds.includes(audio)) {
    allGameSounds.push(audio);
  }
  return audio;
}

/**
 * Plays a sound, wiring up looping first if it is one of the music tracks.
 *
 * Swallows AbortError, which browsers raise routinely when playback is
 * interrupted by a pause or a new track before it has started.
 *
 * @param {HTMLAudioElement} audio - The sound to play.
 * @param {number} audioVolume - Volume to play it at.
 */
function playSound(audio, audioVolume) {
  activateListener(audio);
  activateLoop(audio);
  getMuteStatus(audio);
  applyAudioState(audio, audioVolume);
  audio.play().catch((error) => {
    if (error.name !== "AbortError") console.error(error);
  });
}

/**
 * Stops a sound and rewinds it so the next play starts from the beginning.
 *
 * @param {HTMLAudioElement} audio - The sound to stop.
 */
function stopSound(audio) {
  audio.pause();
  audio.currentTime = 0;
}

/**
 * Attaches the trim listener a music track needs, if it has one.
 *
 * @param {HTMLAudioElement} audio - The sound about to play.
 */
function activateListener(audio) {
  if (audio === lobbyMusic) {
    activateLobbyMusicListener();
  }
  if (audio === backgroundMusic) {
    activateBackgroundMusicListener();
  }
}

/**
 * Turns on native looping for the music tracks only.
 *
 * @param {HTMLAudioElement} audio - The sound about to play.
 */
function activateLoop(audio) {
  if (audio === lobbyMusic || audio === backgroundMusic || audio === endbossMusic) {
    audio.loop = true;
  }
}

/**
 * Attaches the lobby music trim.
 *
 * The handler is a named function on purpose: addEventListener ignores a
 * repeat registration of the same reference, so re-entering the lobby cannot
 * stack duplicate listeners the way an inline arrow would.
 */
function activateLobbyMusicListener() {
  lobbyMusic.addEventListener("timeupdate", loopLobbyMusic);
}

/** Restarts the lobby track three seconds early, skipping its silent tail. */
function loopLobbyMusic() {
  if (lobbyMusic.duration && lobbyMusic.currentTime >= lobbyMusic.duration - 3) {
    lobbyMusic.currentTime = 0;
  }
}

/** Attaches the in-game music trim, named for the same reason as the lobby one. */
function activateBackgroundMusicListener() {
  backgroundMusic.addEventListener("timeupdate", loopBackgroundMusic);
}

/** Loops the in-game track back to three seconds in, skipping its intro. */
function loopBackgroundMusic() {
  if (backgroundMusic.duration && backgroundMusic.currentTime >= backgroundMusic.duration - 1) {
    backgroundMusic.currentTime = 3;
  }
}

/**
 * Swaps the in-game music for the endboss theme.
 *
 * Called once, the moment the boss wakes up. Updating currentMusic is what
 * keeps a later pause and resume acting on the right track.
 */
function startEndbossMusic() {
  stopSound(backgroundMusic);
  currentMusic = endbossMusic;
  playSound(endbossMusic, resolveVolume(endbossMusic));
}

/** Stops and rewinds everything, used when a game ends. */
function stopAllGameSounds() {
  allGameSounds.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}

/** Discards the finished game's sounds and rebuilds the combined list. */
function clearGameSounds() {
  allGameSounds.length = 0;
  createAllSoundsArray();
}

/** Stops the effects but lets the music keep playing, used when pausing. */
function stopAllSoundEffects() {
  allGameSounds.forEach((audio) => {
    if (audio === backgroundMusic || audio === endbossMusic) return;
    audio.pause();
    audio.currentTime = 0;
  });
}

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
 * @returns {string} The icon markup, whether or not a button was found.
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
 * @returns {boolean} The channel's new mute state.
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
 * Inverts the mute flag on each sound given.
 *
 * @param {HTMLAudioElement[]} music - The sounds to flip.
 */
function changeMusicMuteState(music) {
  music.forEach((audio) => {
    audio.muted = !audio.muted;
  });
}

/**
 * Picks the speaker icon for a mute state.
 *
 * @param {boolean} muteState - True when muted.
 * @returns {string} The matching SVG markup.
 */
function getMuteIconState(muteState) {
  return muteState ? SVG_SPEAKER_OFF : SVG_SPEAKER_ON;
}

/**
 * Applies a slider movement to a channel.
 *
 * Dragging to the bottom mutes the channel rather than leaving it audible at
 * zero, and moving back up unmutes it, so the slider and the mute button can
 * never disagree.
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
 * Recomputes volume and mute state for one sound or many.
 *
 * @param {HTMLAudioElement|HTMLAudioElement[]} music - Sound or sounds to refresh.
 */
function applyAudioStates(music) {
  if (!Array.isArray(music)) {
    music = [music];
  }
  music.forEach((audio) => {
    let volume = resolveVolume(audio);
    applyAudioState(audio, volume);
  });
}

/**
 * Unmutes every sound given and clears the matching channel flags.
 *
 * @param {HTMLAudioElement[]} music - The sounds to unmute.
 * @param {string} id - Button id; omitted when unmuting everything.
 * @returns {boolean} Always false, the new mute state.
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
 * Returns the sounds belonging to a channel.
 *
 * @param {string} id - Button id naming the channel.
 * @returns {HTMLAudioElement[]} The lobby track alone, or every game sound.
 */
function getMusic(id) {
  if (id == "lobby-mute-btn") {
    return [lobbyMusic];
  } else {
    return allGameSounds;
  }
}

/**
 * Mutes or unmutes everything at once.
 *
 * Also what the in-game speaker button calls, which is why muting during play
 * silences the lobby music too rather than only the game sounds.
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
 *
 * Without this, unmuting a channel whose slider was dragged to the bottom
 * would report itself as on while still producing silence. The test reads the
 * channel volumes rather than individual sounds, because the music tracks are
 * quiet by design and would otherwise trip it every time.
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
 * The guard matters because this runs during play as well, where the sound
 * settings screen is not rendered.
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
 * @returns {boolean} Always true, the new mute state.
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
 * @returns {string} The label to show.
 */
function getMuteAllButtonState(muteStatus) {
  return muteStatus ? "Unmute All" : "Mute All";
}

/**
 * Marks both channels muted.
 *
 * @returns {boolean} Always true, for the caller to pass on.
 */
function setAllToMute() {
  gameSoundsMuted = true;
  lobbyMusicMuted = true;
  return true;
}

/**
 * Marks both channels unmuted.
 *
 * @returns {boolean} Always false, for the caller to pass on.
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

/** Rebuilds the combined list of game sounds plus the lobby music. */
function createAllSoundsArray() {
  allSounds = allGameSounds.concat(lobbyMusic);
}

/**
 * Keeps the Mute All button honest after a single channel changes.
 *
 * Muting both channels separately is the same thing as muting everything, so
 * the button has to follow; unmuting either one has to release it again.
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
 * @returns {HTMLElement|null} The button, or null when not rendered.
 */
function setMuteAllButton(id, muted) {
  let button = getElement(id);
  if (!button) return null;
  button.textContent = getMuteAllButtonState(muted);
  return button;
}

/** Writes both channels' mute flags and volumes to sessionStorage. */
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
 *
 * Runs before the first render so the lobby draws with the right mute icons
 * rather than correcting them a moment later.
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
