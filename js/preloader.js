/**
 * Downloads every game image before the first frame is drawn.
 *
 * The images are fetched into the browser's cache, not handed to the objects.
 * Every class still builds its own imageCache exactly as before, except that
 * those requests are now cache hits rather than round trips.
 *
 * Nothing here is specific to a level: the paths come from the sets in
 * images.js, so adding an animation there adds it to the download too.
 */

/** How many images the current download covers; the denominator of the progress bar. */
let preloadTotal = 0;

/** How many have finished, successfully or not. */
let preloadDone = 0;

/** The download in progress, kept so a second caller joins it instead of starting another. */
let preloadPromise = null;

/**
 * Gathers every image path the game draws.
 *
 * Two groups, because the globals come in two shapes: the four sprite sets are
 * objects of arrays keyed by animation state, while the bars and the scene
 * images are already flat arrays.
 *
 * @returns {string[]} All the paths, each appearing once.
 */
function collectAllImagePaths() {
  let paths = [];
  let animationSets = [characterImages, endbossImages, troll1Images, troll2Images];
  let flatSets = [coinImages, healthBarImages, quiverImages, coinBarImages, endbossHealthBarImages, sceneImages];
  animationSets.forEach((set) => addAnimationSetPaths(set, paths));
  flatSets.forEach((set) => set.forEach((path) => paths.push(path)));
  return paths;
}

/**
 * Adds every frame of every state in one sprite set.
 *
 * The states are read off the object rather than listed here, because the four
 * sets do not share them: the character has a jump the trolls lack, the boss
 * has a sprint, and a hardcoded list would quietly skip whatever it missed.
 *
 * @param {Object<string, string[]>} set - A sprite set from images.js.
 * @param {string[]} paths - Collector the frames are appended to.
 */
function addAnimationSetPaths(set, paths) {
  let states = Object.keys(set);
  for (let i = 0; i < states.length; i++) {
    set[states[i]].forEach((path) => paths.push(path));
  }
}

/**
 * Starts loading every game image, once.
 *
 * Called twice by design, from the lobby and again from Start. The second call
 * returns the download already in flight rather than beginning a new one, which
 * is what lets the wait overlap with the menu.
 *
 * @returns {Promise} Resolves once every image has loaded or failed.
 */
function startPreloading() {
  if (preloadPromise) {
    return preloadPromise;
  } else {
    let paths = collectAllImagePaths();
    preloadTotal = paths.length;
    preloadPromise = loadAllImages(paths);
    return preloadPromise;
  }
}

/**
 * Starts one request per path and bundles them into a single promise.
 *
 * @param {string[]} paths - Images to load.
 * @returns {Promise} Resolves once all of them have settled.
 */
function loadAllImages(paths) {
  let requests = [];
  paths.forEach((path) => requests.push(preloadImage(path)));
  return Promise.all(requests);
}

/**
 * Loads one image, counting it either way.
 *
 * A failed image resolves like a loaded one on purpose: if a missing file left
 * its promise pending, the gate would stop short of complete and the game would
 * never start over one renamed sprite.
 *
 * @param {string} path - Image to load.
 * @returns {Promise} Resolves once the request settles.
 */
function preloadImage(path) {
  return new Promise((resolve) => {
    let img = new Image();
    img.onload = img.onerror = () => {
      preloadDone++;
      updateLoadingProgress();
      resolve(img);
    };
    img.src = path;
  });
}

/**
 * Waits for the images before the game starts.
 *
 * The race caps the wait, so one request that never settles cannot hold the
 * loading screen for good. The second delay is a floor: once the lobby has
 * already fetched everything the race finishes at once, and without it the
 * loading screen would flash up and vanish within a frame. Both delays start
 * together, so the wait is the longer of the two rather than their sum.
 *
 * The catch is what guarantees the game starts: an unhandled rejection here
 * would skip the caller's next line and leave the player on the loading screen.
 */
async function waitForAssets() {
  try {
    await Promise.all([Promise.race([startPreloading(), delay(20000)]), delay(600)]);
  } catch (error) {
    console.error(error);
  }
}

/**
 * Resolves after a delay.
 *
 * Deliberately not passed through registerInterval, unlike every other timer in
 * the game: a cleared timeout would never resolve, and the loading screen would
 * stay up for good.
 *
 * @param {number} milliseconds - How long to wait.
 * @returns {Promise} Resolves once the time has passed.
 */
function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/**
 * Writes the current progress to the loading screen.
 *
 * Both lookups are guarded because this also runs while the lobby is preloading
 * in the background, where neither element is on screen.
 */
function updateLoadingProgress() {
  let percent = Math.round((preloadDone / preloadTotal) * 100);
  let fill = getElement("loadingBarFill");
  let label = getElement("loadingPercent");
  if (fill) fill.style.width = percent + "%";
  if (label) label.textContent = percent + "%";
}
