/**
 * A single tile of one parallax background layer.
 *
 * Level 1 builds its backdrop from five stacked layers repeated at 720px
 * intervals from -720 to 3600, so the tile width below is the repeat distance
 * of that pattern and is independent of the canvas width.
 */
class BackgroundObject extends MovableObject {
  height = 480;

  /** Tile width, matching the 720px spacing the level repeats the layers at. */
  width = 720;

  /**
   * Places one background tile at the given horizontal position.
   *
   * @param {string} imagePath - Path to the layer image, relative to index.html.
   * @param {number} x - World position of the tile's left edge.
   */
  constructor(imagePath, x) {
    super().loadImage(imagePath);
    this.x = x;
    this.y = 480 - this.height;
  }
}
