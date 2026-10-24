/**
 * Downloads every game image before the first frame is drawn.
 */

/** 
 * How many images the current download covers; the denominator of the progress bar. 
 */
let preloadTotal = 0;

/** 
 * How many have finished, successfully or not. 
 */
let preloadDone = 0;

/** 
 * The download in progress, kept so a second caller joins it instead of starting another. 
 */
let preloadPromise = null;

/** 
 * Every loaded image, keyed by path, handed out to the objects that draw them. 
 */
let preloadedImages = {};

/**
 * Gathers every image path the game draws.
 *
 * @returns {string[]} - All the paths, each appearing once.
 */
function collectAllImagePaths() {
  let paths = [];
  let animationSets = [characterImages, endbossImages, greyTrollImages, greenTrollImages];
  let flatSets = [coinImages, healthBarImages, quiverImages, coinBarImages, endbossHealthBarImages, backgroundImages, sceneImages];
  animationSets.forEach((set) => addAnimationSetPaths(set, paths));
  flatSets.forEach((set) => set.forEach((path) => paths.push(path)));
  return paths;
}

/**
 * Adds every frame of every state in one sprite set.
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
 * @returns {Promise} - Resolves once every image has loaded or failed.
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
 * @returns {Promise} - Resolves once all of them have settled.
 */
function loadAllImages(paths) {
  let requests = [];
  paths.forEach((path) => requests.push(preloadImage(path)));
  return Promise.all(requests);
}

/**
 * Loads one image, counting it either way.
 *
 * @param {string} path - Image to load.
 * @returns {Promise} - Resolves once the request settles.
 */
function preloadImage(path) {
  return new Promise((resolve) => {
    let img = new Image();
    img.onload = img.onerror = () => {
      preloadedImages[path] = img;
      preloadDone++;
      updateLoadingProgress();
      resolve(img);
    };
    img.src = path;
  });
}

/**
 * Hands back the already decoded image for a path.
 *
 * @param {string} path - Image path.
 * @returns {HTMLImageElement} - The preloaded image, or a fresh one if the preloader missed it.
 */
function getPreloadedImage(path) {
  if (preloadedImages[path]) {
    return preloadedImages[path];
  } else {
    let img = new Image();
    img.src = path;
    return img;
  }
}

/**
 * Waits for the images before the game starts.
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
 *  @param {number} milliseconds - How long to wait.
 * @returns {Promise} - Resolves once the time has passed.
 */
function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/**
 * Writes the current progress to the loading screen.
 */
function updateLoadingProgress() {
  let percent = Math.round((preloadDone / preloadTotal) * 100);
  let fill = getElement("loadingBarFill");
  let label = getElement("loadingPercent");
  if (fill) fill.style.width = percent + "%";
  if (label) label.textContent = percent + "%";
}
