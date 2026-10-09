/**
 * Base class for the three bars drawn in the top-left corner of the canvas.
 *
 * HealthBar, Quiver and CoinBar all share this size and x position and stack
 * vertically at y 0, 55 and 105. Each supplies six images of its own, one per
 * 20 percent step, and this class picks the right one whenever the percentage
 * changes. Because the bars are drawn in screen space rather than world space,
 * World adds them after restoring the camera translation.
 */
class StatusBar extends DrawableObject {
  width = 200;
  height = 60;
  percentage = 100;
  x = 25;

  constructor() {
    super();
  }

  /**
   * Stores a new fill level and swaps in the image that matches it.
   *
   * @param {number} percentage - Fill level from 0 to 100.
   */
  setPercentage(percentage) {
    this.percentage = percentage;
    let path = this.IMAGES[this.resolveImageIndex()];
    this.img = this.imageCache[path];
  }

  /**
   * Maps the current percentage onto one of the six image indexes, where 5 is
   * a full bar and 0 an empty one.
   *
   * @returns {number} Index into IMAGES, 0 to 5.
   */
  resolveImageIndex() {
    if (this.percentage == 100) {
      return 5;
    } else if (this.percentage >= 80) {
      return 4;
    } else if (this.percentage >= 60) {
      return 3;
    } else {
      return this.resolveLowImageIndex();
    }
  }

  /**
   * Continuation of resolveImageIndex() for the lower half of the range.
   *
   * @returns {number} Index into IMAGES, 0 to 2.
   */
  resolveLowImageIndex() {
    if (this.percentage >= 40) {
      return 2;
    } else if (this.percentage >= 20) {
      return 1;
    } else {
      return 0;
    }
  }

  /** Raises the bar by one 20 percent step, stopping at full. */
  fillBar() {
    this.percentage += 20;
    if (this.percentage > 100) {
      this.percentage = 100;
    }
    this.setPercentage(this.percentage);
  }

  /** Lowers the bar by one 20 percent step, stopping at empty. */
  depleteBar() {
    this.percentage -= 20;
    if (this.percentage < 0) {
      this.percentage = 0;
    }
    this.setPercentage(this.percentage);
  }

  /**
   * Reports whether the bar is already full, used by World to ignore a
   * collectible the player has no room for.
   *
   * @returns {boolean|undefined} True when full, otherwise undefined rather
   *   than false, so callers must test it loosely.
   */
  checkBarPercentage() {
    if (this.percentage === 100) {
      return true;
    }
  }
}
