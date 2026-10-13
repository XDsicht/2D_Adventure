/**
 * All audio: playback, the two mute channels, volume and persistence.
 */

/** 
 * Every sound registered for the current game, music included. 
 */
let allGameSounds = [];

/**
 * allGameSounds plus the lobby music, rebuilt whenever the game sounds change. 
 */
let allSounds = [];

/** 
 * Whether both channels are muted, which is what the Mute All button reflects. 
 */
let muted = false;
let lobbyMusicMuted = false;
let gameSoundsMuted = false;
let gameSoundsVolume = 0.5;
let lobbyMusicVolume = 0.2;

/** 
 * Level a channel is restored to when unmuted from silence.
 */
let defaultVolume = Number(0.2);
let backgroundMusic = new Audio("audio/game_audio/ingame_music.mp3");
let endbossMusic = new Audio("audio/game_audio/endboss_music.mp3");
let lobbyMusic = new Audio("audio/game_audio/lobby_music.mp3");

/**
 * Vorga's own set.
 */
const playerSounds = {
  isAttackingSound: new Audio("audio/character_audio/character_arrow_shooting_sound.mp3"),
  isWalkingSound: new Audio("audio/character_audio/character_walking_sound.mp3"),
  isJumpingSound: new Audio("audio/character_audio/character_jumping_sound.mp3"),
  isHurtSound: new Audio("audio/character_audio/character_hurt_sound.mp3"),
  isDeadSound: new Audio("audio/character_audio/character_dead_sound.mp3"),
};

/** 
 * The troll sound set, shared by every enemy rather than built per instance. 
 */
const trollSounds = {
  isHurtSound: new Audio("audio/enemy_audio/enemy_hurt_sound.mp3"),
  isDeadSound: new Audio("audio/enemy_audio/enemy_dead_sound.mp3"),
  isHitSound: new Audio("audio/enemy_audio/enemy_arrow_impact_sound.mp3"),
};

/** 
 * The endboss's own set. Its hit sound comes from trollSounds like every other enemy's. 
 */
const bossSounds = {
  isAttackingSound: new Audio("audio/endboss_audio/endboss_attack_sound.mp3"),
  isWalkingSound: new Audio("audio/endboss_audio/endboss_walking_sound.mp3"),
  isRunningSound: new Audio("audio/endboss_audio/endboss_running_sound.mp3"),
  isHurtSound: new Audio("audio/endboss_audio/endboss_hurt_sound.mp3"),
  isDeadSound: new Audio("audio/endboss_audio/endboss_dead_sound.mp3"),
};

/**
 * Stores whichever music track is playing right now.
 */
let currentMusic = backgroundMusic;

/**
 * Applies a volume and the current mute state of the sound's channel.
 *
 * @param {HTMLAudioElement} audio - The sound to configure.
 * @param {number} audioVolume - Volume to set, 0 to 1.
 * @returns {HTMLAudioElement} - The same sound, for chaining.
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
 * @returns {boolean} - True when that sound's channel is muted.
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
 * @param {HTMLAudioElement} audio - The sound to price.
 * @returns {number} - The volume to use, 0 to 1.
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
 * @returns {boolean} - The channel flag for lobby music, the element's own flag otherwise.
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
 * @param {HTMLAudioElement} audio - The sound to register.
 * @returns {HTMLAudioElement} - The same sound, for chaining.
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
 */
function activateLobbyMusicListener() {
  lobbyMusic.addEventListener("timeupdate", loopLobbyMusic);
}

/** 
 * Restarts the lobby track three seconds early, skipping its silent tail. 
 */
function loopLobbyMusic() {
  if (lobbyMusic.duration && lobbyMusic.currentTime >= lobbyMusic.duration - 3) {
    lobbyMusic.currentTime = 0;
  }
}

/** 
 * Attaches the in-game music trim, named for the same reason as the lobby one. 
 */
function activateBackgroundMusicListener() {
  backgroundMusic.addEventListener("timeupdate", loopBackgroundMusic);
}

/** 
 * Loops the in-game track back to three seconds in, skipping its intro. 
 */
function loopBackgroundMusic() {
  if (backgroundMusic.duration && backgroundMusic.currentTime >= backgroundMusic.duration - 1) {
    backgroundMusic.currentTime = 3;
  }
}

/**
 * Swaps the in-game music for the endboss theme.
 */
function startEndbossMusic() {
  stopSound(backgroundMusic);
  currentMusic = endbossMusic;
  playSound(endbossMusic, resolveVolume(endbossMusic));
}

/** 
 * Stops and rewinds everything, used when a game ends. 
 */
function stopAllGameSounds() {
  allGameSounds.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}

/** 
 * Discards the finished game's sounds and rebuilds the combined list. 
 */
function clearGameSounds() {
  allGameSounds.length = 0;
  createAllSoundsArray();
}

/** 
 * Stops the effects but lets the music keep playing, used when pausing. 
 */
function stopAllSoundEffects() {
  allGameSounds.forEach((audio) => {
    if (audio === backgroundMusic || audio === endbossMusic) return;
    audio.pause();
    audio.currentTime = 0;
  });
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
 * Returns the sounds belonging to a channel.
 *
 * @param {string} id - Button id naming the channel.
 * @returns {HTMLAudioElement[]} - The lobby track alone, or every game sound.
 */
function getMusic(id) {
  if (id == "lobby-mute-btn") {
    return [lobbyMusic];
  } else {
    return allGameSounds;
  }
}

/** Rebuilds the combined list of game sounds plus the lobby music. */
function createAllSoundsArray() {
  allSounds = allGameSounds.concat(lobbyMusic);
}

