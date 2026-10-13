/**
 * Base class for every object that is rendered to the canvas.
 */
class DrawableObject {
  img;

  /** 
   * Preloaded images, keyed by their source path. 
   */
  imageCache = {};

  /** 
   * Index of the current animation frame; wrapped by the image array length. 
   */
  currentImage = 0;

  paused = false;

  /**
   * Makes the image at this path the currently visible one.
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
   * @param {string[]} arr - Paths of the images to cache.
   */
  loadImages(arr) {
    arr.forEach((path) => {
      this.imageCache[path] = getPreloadedImage(path);
    });
  }

  /** 
   * Restarts the animation at its first frame. 
   */
  resetCurrentImage() {
    this.currentImage = 0;
  }

  /** 
   * Freezes the object so its intervals skip their work. 
   */
  pause() {
    this.paused = true;
  }

  /** 
   * Releases the object so its intervals resume their work. 
   */
  resume() {
    this.paused = false;
  }
}
