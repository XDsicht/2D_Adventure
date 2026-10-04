const SVG_SPEAKER_ON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
</svg>`;

const SVG_SPEAKER_OFF = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
</svg>`;

const SVG_PAUSE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
</svg>`;

const SVG_HOME = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
</svg>`;

const SVG_SHOOT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
  <path d="M5 3a13 13 0 0 1 0 18"/>
  <path d="M5 3v18"/>
  <path d="M5 12h15"/>
  <path d="M16 8l4 4-4 4"/>
</svg>`;

const SVG_SPACEBAR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
  <path d="M3 9v6h18V9"/>
</svg>`;

const SVG_TARGET = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
  <circle cx="12" cy="12" r="9"/>
  <circle cx="12" cy="12" r="5"/>
  <circle cx="12" cy="12" r="2" fill="currentColor"/>
</svg>`;

const SVG_FULLSCREEN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
</svg>`;

const SVG_EXIT_FULLSCREEN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
</svg>`;

function getLoadingTemplate() {
  return `
    <div class="overlay-btn-group flex-center-column">
      <img class="character-head" src="img/2.character/8.parts/3_head.png" alt="Vorga" />
      <p class="text-shadow-standard letter-spacing-2">Loading…</p>
    </div>
  `;
}

function getLobbyTemplate() {
  return `
    <div class="overlay-btn-group flex-center-column">
      <h1 class="game-title inner-title letter-spacing-2">Adventures of Vorga Flammenherz</h1>
      <img class="character-head" src="img/2.character/8.parts/3_head.png" alt="Vorga" />
      <button class="fantasy-btn cursor-pointer start-btn" id="start-game-btn" onclick="startGame()">Start Game</button>
      <div class="overlay-btn-row">
        <button class="fantasy-btn cursor-pointer start-btn secondary-btn letter-spacing-2" onclick="renderHTML('controls')">Show Controls</button>
        <button class="fantasy-btn cursor-pointer start-btn secondary-btn letter-spacing-2" onclick="renderSoundControls('soundControls')">Sounds</button>
        <button class="fantasy-btn cursor-pointer start-btn secondary-btn letter-spacing-2" onclick="renderHTML('imprint')">Imprint</button>
      </div>
    </div>
  `;
}

function getControlsTemplate() {
  return `
    <div class="overlay-btn-group flex-center-column">
      <h2 class="sound-settings-title text-shadow-standard letter-spacing-2">Controls</h2>
      <div class="controls-grid">
        <div class="controls-row">
          <kbd class="key-badge arrow-keys d-flex-center">&#8592;</kbd>
          <span class="text-shadow-standard controls-label">Move Left</span>
        </div>
        <div class="controls-row">
          <kbd class="key-badge arrow-keys d-flex-center">&#8594;</kbd>
          <span class="text-shadow-standard controls-label">Move Right</span>
        </div>
        <div class="controls-row">
          <kbd class="key-badge d-flex-center">${SVG_SPACEBAR}</kbd>
          <span class="text-shadow-standard controls-label">Jump</span>
        </div>
        <div class="controls-row">
          <kbd class="key-badge d-flex-center">D</kbd>
          <span class="text-shadow-standard controls-label">Shoot Arrow</span>
        </div>
      </div>
      <button class="fantasy-btn cursor-pointer start-btn secondary-btn letter-spacing-2" onclick="renderHTML('lobby')">Back</button>
    </div>
  `;
}

function getSoundControlsTemplate() {
  return `
    <div class="overlay-btn-group flex-center-column">
      <h2 class="sound-settings-title text-shadow-standard letter-spacing-2">Sound Settings</h2>
      <div class="sound-control-row">
        <label class="text-shadow-standard" for="lobby-volume">Lobby Music</label>
        <input class="cursor-pointer" type="range" id="lobby-volume" min="0" max="1" step="0.05" value="${lobbyMusicVolume}"
          oninput="changeVolume(this.value, 'lobby-mute-btn')" />
        <button class="fantasy-btn cursor-pointer mute-btn d-flex-center" id="lobby-mute-btn" onclick="toggleMute('lobby-mute-btn')">${lobbyMuteIcon}</button>
      </div>
      <div class="sound-control-row">
        <label class="text-shadow-standard" for="game-volume">Game Sounds</label>
        <input class="cursor-pointer" type="range" id="game-volume" min="0" max="1" step="0.05" value="${gameSoundsVolume}"
          oninput="changeVolume(this.value, 'game-mute-btn')" />
        <button class="fantasy-btn cursor-pointer mute-btn d-flex-center" id="game-mute-btn" onclick="toggleMute('game-mute-btn')">${gameMuteIcon}</button>
      </div>
      <button class="fantasy-btn cursor-pointer start-btn secondary-btn letter-spacing-2" id="mute-all-btn" onclick="toggleMuteAll('mute-all-btn')">Mute All</button>
      <button class="fantasy-btn cursor-pointer start-btn secondary-btn letter-spacing-2" onclick="renderHTML('lobby')">Back</button>
    </div>
  `;
}

function getGameControlsBarTemplate() {
  return `
    <div class="controls-cluster cluster-move">
      <kbd class="key-badge arrow-keys d-flex-center" id='left'>&#8592;</kbd>
      <kbd class="key-badge arrow-keys d-flex-center" id='right'>&#8594;</kbd>
    </div>
    <div class="controls-cluster cluster-action">
      <kbd class="key-badge d-flex-center" id='space'>
        <span class="badge-desktop">${SVG_SPACEBAR}</span>
        <span class="badge-touch">Jump</span>
      </kbd>
      <kbd class="key-badge d-flex-center" id='shoot'>
        <span class="badge-desktop"><span class="badge-key">D</span>${SVG_TARGET}</span>
        <span class="badge-touch">${SVG_SHOOT}</span>
      </kbd>
    </div>
    <div class="controls-cluster cluster-mute">
      <button class="fantasy-btn mute-btn cursor-pointer d-flex-center" id="game-pause-btn" onclick="toggleManualPause()">${SVG_PAUSE}</button>
      <button class="fantasy-btn mute-btn cursor-pointer d-flex-center" id="game-menu-btn" onclick="backToMenu()">${SVG_HOME}</button>
      <button class="fantasy-btn mute-btn cursor-pointer d-flex-center" id="game-mute-btn" onclick="toggleMuteAll('mute-all-btn')">${gameMuteIcon}</button>
      <button class="fantasy-btn mute-btn cursor-pointer d-flex-center" id="game-fullscreen-btn" onclick="toggleFullscreen()">${getFullscreenIcon()}</button>
    </div>
  `;
}

function getGameOverTemplate() {
  return `
    <div class="overlay-btn-group flex-center-column">
      <h2 class="sound-settings-title text-shadow-standard letter-spacing-2">Game Over</h2>
      <div class="endboss-head">
        <img src="img/4.boss/8.parts/troll_0006_left-ear.png" style="position:absolute; top:116px; left:18px; z-index:1;" />
        <img src="img/4.boss/8.parts/troll_0008_right-ear.png" style="position:absolute; top:114px; left:155px; z-index:1;" />
        <img src="img/4.boss/8.parts/troll_0007_head.png" style="position:absolute; top:30px; left:38px; z-index:2;" />
        <img src="img/4.boss/8.parts/troll_0005_scull.png" style="position:absolute; top:148px; left:60px; z-index:3;" />
        <img src="img/4.boss/8.parts/troll_0004_left-brow.png" style="position:absolute; top:100px; left:74px; z-index:3;" />
        <img src="img/4.boss/8.parts/troll_0003_right-brow.png" style="position:absolute; top:96px; left:140px; z-index:3;" />
      </div>
      <div class="overlay-btn-row">
        <button class="fantasy-btn cursor-pointer start-btn secondary-btn letter-spacing-2" onclick="restartGame()">Try Again</button>
        <button class="fantasy-btn cursor-pointer start-btn secondary-btn letter-spacing-2" onclick="renderLobby('lobby')">Back to Menu</button>
      </div>
    </div>
  `;
}

function getPauseTemplate() {
  return `
    <div class="overlay-btn-group flex-center-column">
      <h2 class="sound-settings-title text-shadow-standard letter-spacing-2">Paused</h2>
      <img class="character-head" src="img/2.character/8.parts/3_head.png" alt="Vorga" />
      <div class="overlay-btn-row">
        <button class="fantasy-btn cursor-pointer start-btn secondary-btn letter-spacing-2" onclick="resumeGame(pauseReasonManual)">Resume</button>
        <button class="fantasy-btn cursor-pointer start-btn secondary-btn letter-spacing-2" onclick="backToMenu()">Back to Menu</button>
      </div>
    </div>
  `;
}

function getRotatePhoneTemplate() {
  return `
    <div class="rotate-phone-screen">
      <p class="letter-spacing-2">Turn your Phone</p>
      <div class="rotate-phone">
        <img class="phone-red" src="img/7.responsive/rotate_phone_red.png" alt="rotate phone" />
        <img class="phone-green" src="img/7.responsive/rotate_phone_green.png" alt="rotate phone" />
        <img class="phone-original" src="img/7.responsive/rotate_phone_black.png" alt="rotate phone" />
      </div>
      <p class="letter-spacing-2">To play in Landscape</p>
    </div>
  `;
}

function getEnlargeWindowTemplate() {
  return `
    <div class="rotate-phone-screen">
      <p class="letter-spacing-2">Your window is too small</p>
      <div class="enlarge-window-icon">${SVG_FULLSCREEN}</div>
      <p class="letter-spacing-2">Please enlarge it to play</p>
      <div class="overlay-btn-row">
        <button class="fantasy-btn cursor-pointer start-btn secondary-btn letter-spacing-2" id="enlarge-fullscreen-btn" onclick="toggleFullscreen()">Fullscreen</button>
        <button class="fantasy-btn cursor-pointer start-btn secondary-btn letter-spacing-2" onclick="dismissWindowPrompt()">Continue Anyway</button>
      </div>
    </div>
  `;
}

function getImprintTemplate() {
  return `
    <div class="imprint-screen">
      <h2 class="letter-spacing-2">Imprint &amp; Privacy Policy</h2>
      ${getImprintSection()}
      ${getPrivacySection()}
      <div class="overlay-btn-row">
        <button class="fantasy-btn cursor-pointer start-btn secondary-btn letter-spacing-2" onclick="renderHTML('lobby')">Back</button>
      </div>
    </div>
  `;
}

function getImprintSection() {
  return `
    <h3>Information pursuant to Section 5 DDG</h3>
    <p>Tobias Fröhler<br />Johann-von-Weerth-Str. 22<br />79100 Freiburg im Breisgau<br />Germany</p>
    <h3>Contact</h3>
    <p>E-mail: tobias.froehler24@gmail.com</p>
    <h3>Liability for Content</h3>
    <p>As a service provider, we are responsible for our own content on these pages in accordance with general legislation. However, we are not obliged to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity. Obligations to remove or block the use of information under general law remain unaffected. Liability in this respect is only possible from the point in time at which knowledge of a specific infringement is obtained. Upon becoming aware of such violations, we will remove the content immediately.</p>
    <h3>Liability for Links</h3>
    <p>This website contains links to external third-party websites. We have no influence over their content and therefore accept no responsibility for it. The respective provider or operator of the linked pages is always responsible for their content.</p>
    <h3>Copyright</h3>
    <p>The content created by the site operator on these pages is subject to German copyright law. This project was created as part of a training programme at the Developer Akademie and serves exclusively non-commercial educational and demonstration purposes. Any commercial reuse of the content is not permitted.</p>
    <h3>Credits</h3>
    <p>
      Graphics and sprites: <a href="https://craftpix.net/" target="_blank" rel="noopener">craftpix.net</a><br />
      Music and sound effects: <a href="https://freesound.org/" target="_blank" rel="noopener">freesound.org</a><br />
      Font "Uncial Antiqua": © 2011 Brian J. Bonislawsky DBA Astigmatic (AOETI), licensed under the SIL Open Font License 1.1
    </p>
  `;
}

function getPrivacySection() {
  return `
    <h3>Data Protection at a Glance</h3>
    <p>Personal data is any data by which you can be personally identified. This website contains no contact forms, no registration, no newsletter, no analytics tools, no advertising networks and no social media plug-ins. No personal data is collected, processed or passed on to third parties by the operator of this website.</p>
    <p>Technical data such as your IP address, browser type and the time of access may be recorded automatically in the server log files of the hosting provider. This happens for the technical operation and security of the service.</p>
    <h3>Hosting</h3>
    <p>This website is hosted by an external provider:<br />netcup GmbH<br />Emmy-Noether-Straße 10<br />D-76131 Karlsruhe<br />Germany</p>
    <p>The data recorded in the provider's server log files is processed on the basis of our legitimate interest in the secure and efficient provision of this service (Art. 6(1)(f) GDPR).</p>
    <h3>Controller</h3>
    <p>The controller responsible for data processing on this website is the person named in the imprint above. This website is operated in accordance with the applicable data protection regulations, in particular the GDPR and the German Federal Data Protection Act (BDSG).</p>
    <h3>Storage Period</h3>
    <p>No data is stored by the operator. Data held in the hosting provider's server log files is deleted in accordance with that provider's retention periods.</p>
    <h3>Your Rights</h3>
    <p>You have the right at any time to obtain information about your stored personal data, its origin and recipients, and the purpose of processing (Art. 15 GDPR), as well as the right to rectification (Art. 16), erasure (Art. 17), restriction of processing (Art. 18), data portability (Art. 20) and to object to processing (Art. 21). You may withdraw any consent given at any time with effect for the future. You also have the right to lodge a complaint with the competent supervisory authority.</p>
    <h3>SSL/TLS Encryption</h3>
    <p>This site uses SSL/TLS encryption for security reasons. You can recognise an encrypted connection by the https:// prefix in your browser's address bar.</p>
    <h3>Local Storage in Your Browser</h3>
    <p>This game stores your sound settings (volume and mute state) in your browser's sessionStorage under the key "vorgaSoundSettings". This data never leaves your device, is not transmitted to any server and is deleted automatically when you close the browser window. No cookies are set.</p>
    <h3>Fonts</h3>
    <p>The font used is stored locally on this server. No connection to Google servers or any other external provider is established when you visit this site, and no data is transmitted to third parties.</p>
  `;
}

function getVictoryTemplate() {
  return `
    <div class="overlay-btn-group flex-center-column">
      <h2 class="sound-settings-title text-shadow-standard letter-spacing-2">Victory!</h2>
      <img class="character-head" src="img/2.character/8.parts/3_head.png" alt="Vorga" />
      <div class="overlay-btn-row">
        <button class="fantasy-btn cursor-pointer start-btn secondary-btn letter-spacing-2" onclick="restartGame()">Play Again</button>
        <button class="fantasy-btn cursor-pointer start-btn secondary-btn letter-spacing-2" onclick="renderLobby('lobby')">Back to Menu</button>
      </div>
    </div>
  `;
}
