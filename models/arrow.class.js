/**
 * A collectible arrow lying on the ground, picked up to refill the quiver.
 */
class Arrow extends MovableObject {
  y = 420;
  width = 36;
  height = 38;

  /** 
   * Fixed tilt in degrees, applied by drawArrow() so the pickup lies on the ground. 
   */
  angle = 105;

  IMAGE = "img/5.elements/throwables/arrows/arrow.png";

  /** 
   * Creates an arrow at a random position between x = 300 and x = 2300. 
   */
  constructor() {
    super().loadImage(this.IMAGE);
    this.x = 300 + Math.random() * 2000;
  }
}
