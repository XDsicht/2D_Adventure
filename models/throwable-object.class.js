/**
 * An arrow in flight, created when the character shoots.
 *
 * Not to be confused with Arrow, which is the collectible lying on the ground.
 * The flight is an arc: shoot() gives it an upward nudge and gravity pulls it
 * back down, while a separate interval drives it forward. Once it touches the
 * ground it stops moving horizontally and World removes it.
 */
class ThrowableObject extends MovableObject {
  /** Horizontal distance covered per step, applied every 25ms by defineSpeedX(). */
  speedX = 20;

  IMAGE = "img/5.elements/throwables/arrows/arrow.png";

  /** Current tilt in degrees, applied by drawArrow() and raised during the climb. */
  angle = 23;

  /** Gravity per tick, lower than the inherited 2.5 to give the arrow a flatter arc. */
  acceleration = 1;

  /** Height at which the arrow has landed and stops travelling forward. */
  groundY = 410;

  /**
   * Creates an arrow at the character's bow, facing the way the character was.
   *
   * @param {number} x - World position the arrow starts from.
   * @param {number} y - Height the arrow starts at.
   * @param {boolean} otherDirection - True when the character faced left, which
   *   makes the arrow travel left instead of right.
   */
  constructor(x, y, otherDirection) {
    super().loadImage(this.IMAGE);
    this.x = x;
    this.y = y;
    this.width = 45;
    this.height = 33;
    this.otherDirection = otherDirection;
  }

  /** Launches the arrow: upward nudge, then gravity, forward travel and tilt. */
  shoot() {
    this.speedY = 6;
    this.applyGravity();
    this.startSpeedXInterval();
    this.startDefineAngleInterval();
  }

  /**
   * Starts the forward travel. The 25ms cadence is matched by World's fast
   * collision loop, so the arrow can never cross an enemy between two checks.
   */
  startSpeedXInterval() {
    registerInterval(
      setInterval(() => {
        if (this.paused) return;
        this.defineSpeedX();
      }, 25),
    );
  }

  /** Starts the tilt, updated twenty times a second. */
  startDefineAngleInterval() {
    registerInterval(
      setInterval(() => {
        if (this.paused) return;
        this.defineAngle();
      }, 1000 / 20),
    );
  }

  /** Raises the tilt while the arrow is still climbing; holds it once falling. */
  defineAngle() {
    if (this.speedY > 0) {
      this.angle += 2;
    }
  }

  /** Moves the arrow one step in its facing direction, but only while airborne. */
  defineSpeedX() {
    if (this.isAboveGround()) {
      if (this.otherDirection) {
        return (this.x -= this.speedX);
      } else {
        return (this.x += this.speedX);
      }
    }
  }
}
