/**
 * The endboss's health, shown at the top right once the fight begins.
 *
 * Mirrors the character's bar on the opposite side of the canvas and stays
 * hidden until the boss wakes up, so the bar arriving is itself the signal that
 * the fight has started. It slides in rather than popping, using the same
 * easing the camera uses when it starts tracking the boss.
 *
 * The boss has 20 energy and an arrow takes 5, so every hit is a quarter of the
 * bar. That does not line up with the six 20 percent frames the art provides,
 * which is why resolveImageIndex() is overridden here.
 */
class EndbossHealthBar extends StatusBar {
  y = 0;

  IMAGES = endbossHealthBarImages;

  /** False until the boss is activated; World draws the bar only once it is set. */
  visible = false;

  /** Resting x, worked out from the canvas width so the bar sits inside the right edge. */
  targetX = 0;

  /** Fraction of the remaining distance covered each frame, matching the camera's easing. */
  slideFactor = 0.1;

  /** Distance at which the slide snaps home instead of easing on forever. */
  slideThreshold = 0.4;

  /** Creates the bar, preloads its six frames and starts it at full health. */
  constructor() {
    super();
    this.loadImages(this.IMAGES);
    this.setPercentage(100);
  }

  /**
   * Works out where the bar comes from and where it stops.
   *
   * Read from the canvas rather than hardcoded, and the 25px inset matches
   * StatusBar's left margin so the two sides of the screen are symmetrical.
   *
   * @param {number} canvasWidth - Width of the drawing surface.
   */
  setBounds(canvasWidth) {
    this.targetX = canvasWidth - this.width - 25;
    this.x = canvasWidth;
  }

  /** Starts the slide; the boss calls this the moment it wakes. */
  show() {
    this.visible = true;
  }

  /**
   * Moves the bar one frame closer to its resting place.
   *
   * Driven from World's draw loop rather than a timer of its own, so it is
   * frame synced and freezes with everything else when the game pauses.
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
   * Rounds up rather than down, so each of the first three hits drops the bar
   * one visible step and the fourth empties it. Rounding down instead would
   * make the opening hit look as though it took twice as much as the others.
   *
   * @returns {number} Index into IMAGES, 0 to 5.
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
