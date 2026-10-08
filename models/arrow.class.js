/**
 * A collectible arrow lying on the ground, picked up to refill the quiver.
 *
 * Not to be confused with ThrowableObject, which is the arrow the character
 * shoots. Both are rendered through drawArrow() rather than the usual draw(),
 * but this one keeps a fixed angle while a fired arrow rotates as it falls.
 */
class Arrow extends MovableObject {
  y = 420;
  width = 36;
  height = 38;

  /** Fixed tilt in degrees, applied by drawArrow() so the pickup lies on the ground. */
  angle = 105;

  IMAGE = "img/5.elements/throwables/arrows/arrow.png";

  /** Creates an arrow at a random position between x = 300 and x = 2300. */
  constructor() {
    super().loadImage(this.IMAGE);
    this.x = 300 + Math.random() * 2000;
  }
}
