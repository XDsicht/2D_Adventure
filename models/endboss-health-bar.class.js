/**
 * The endboss's health, shown at the top right once the fight begins.
 */
class EndbossHealthBar extends StatusBar {
  
  /**
  * Level with the quiver on the left.
  */
  y = 55;

  IMAGES = endbossHealthBarImages;

  /** 
  * False until the boss is activated; World draws the bar only once it is set. 
  */
  visible = false;

  /** 
   * Resting x, worked out from the canvas width so the bar sits inside the right edge. 
   */
  targetX = 0;

  /** 
   * Fraction of the remaining distance covered each frame, matching the camera's easing. 
   */
  slideFactor = 0.1;

  /** 
   * Distance at which the slide snaps home instead of easing on forever. 
   */
  slideThreshold = 0.4;

  /** 
   * Creates the bar, preloads its six frames and starts it at full health. 
   */
  constructor() {
    super();
    this.loadImages(this.IMAGES);
    this.setPercentage(100);
  }

  /**
   * Works out where the bar comes from and where it stops.
   *
   * @param {number} canvasWidth - Width of the drawing surface.
   */
  setBounds(canvasWidth) {
    this.targetX = canvasWidth - this.width - 25;
    this.x = canvasWidth;
  }

  /** 
   * Starts the slide; the boss calls this the moment it wakes. 
  */
  show() {
    this.visible = true;
  }

  /**
   * Moves the bar one frame closer to its resting place.
   */
  slideStep() {
    let distance = this.targetX - this.x;
    if (Math.abs(distance) < this.slideThreshold) {
      this.x = this.targetX;
    } else {
      this.x += distance * this.slideFactor;
    }
  }

  /**
   * Picks the frame for a bar that moves in quarters across six fifth-steps.
   *
   * @returns {number} - Index into IMAGES, 0 to 5.
   */
  resolveImageIndex() {
    if (this.percentage >= 100) {
      return 5;
    } else if (this.percentage >= 75) {
      return 4;
    } else if (this.percentage >= 50) {
      return 3;
    } else if (this.percentage >= 25) {
      return 2;
    } else {
      return 0;
    }
  }
}
