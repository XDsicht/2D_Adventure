/**
 * Base class for every object that is rendered to the canvas.
 *
 * Holds the currently visible image, a cache of all preloaded images and the
 * animation frame counter that subclasses advance while playing an animation.
 */
class DrawableObject {
  img;

  /** Preloaded images, keyed by their source path. */
  imageCache = {};

  /** Index of the current animation frame; wrapped by the image array length. */
  currentImage = 0;

  paused = false;

  /**
   * Loads a single image and makes it the currently visible one.
   *
   * @param {string} path - Path to the image file, relative to index.html.
   */
  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  /**
   * Draws the current image onto the canvas at the object's position and size.
   *
   * @param {CanvasRenderingContext2D} ctx - The rendering context to draw on.
   */
  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  /**
   * Preloads an array of images into the cache so animations never wait on a
   * network request mid-frame.
   *
   * @param {string[]} arr - Paths of the images to preload.
   */
  loadImages(arr) {
    arr.forEach((path) => {
      let img = new Image();
      img.src = path;
      img.style = "transform: scale(-1)";
      this.imageCache[path] = img;
    });
  }

  /** Restarts the animation at its first frame. */
  resetCurrentImage() {
    this.currentImage = 0;
  }

  /** Freezes the object so its intervals skip their work. */
  pause() {
    this.paused = true;
  }

  /** Releases the object so its intervals resume their work. */
  resume() {
    this.paused = false;
  }
}
