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
   * Makes the image at this path the currently visible one.
   *
   * Taken from the preloader rather than requested here, so it is ready to draw
   * immediately instead of arriving a few frames later.
   *
   * @param {string} path - Path to the image file, relative to index.html.
   */
  loadImage(path) {
    this.img = getPreloadedImage(path);
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
   * Fills this object's cache with the frames of one animation, so playing it
   * never waits on a request mid-frame.
   *
   * The images come from the preloader, which has already decoded them. Every
   * troll of the same type therefore shares one copy of each frame instead of
   * holding its own.
   *
   * @param {string[]} arr - Paths of the images to cache.
   */
  loadImages(arr) {
    arr.forEach((path) => {
      this.imageCache[path] = getPreloadedImage(path);
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
