/**
 * A single tile of one parallax background layer.
 */
class BackgroundObject extends MovableObject {
  height = 480;

  /** 
   * Tile width, matching the 720px spacing the level repeats the layers at. 
   */
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
