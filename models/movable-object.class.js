/**
 * Base class for everything that moves, collides or takes damage.
 *
 * Adds position, gravity, health and the collision primitives on top of
 * DrawableObject. The key idea here is the offset: a sprite's image is mostly
 * transparent padding, so collisions are tested against a smaller box inset
 * from the image edges. Subclasses supply their own offsets per animation
 * state, and getCurrentOffset() picks whichever one applies right now.
 *
 * Vertical positions grow downward, so a positive speedY moves an object up
 * and gravity works by subtracting from it until it goes negative.
 */
class MovableObject extends DrawableObject {
  /** Horizontal step per move; subclasses override it with their own pace. */
  speed = 0.15;

  /** True when the object faces left, which mirrors both drawing and offsets. */
  otherDirection = false;

  dead = false;

  /** Set once the final frame of the death animation has actually been drawn. */
  deathAnimationDone = false;

  /** Vertical speed; positive moves up, negative falls. */
  speedY = 0;

  /** Amount subtracted from speedY each gravity tick. */
  acceleration = 2.5;

  /** Hit points; trolls override this with 10 and the endboss with 20. */
  energy = 100;

  /** Timestamp of the last hit taken, used by isHurt(). */
  lastHit = 0;

  isAttacking = false;
  isWalking = false;
  isRunning = false;
  lastAttackTime = 0;

  /** Latch so one attack animation can only land damage once. */
  hasDealtDamage = false;

  lastAttacker;
  world;

  /** Height this object comes to rest at; arrows override it with 410. */
  groundY = 250;

  spawningLocation;

  /** Pixels to inset each edge of the sprite to get its collision box. */
  offset = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };

  /**
   * Reports whether this object's animation loops should stop.
   *
   * Despite the name it returns true when the world is *missing* or the
   * character has died, so callers use it as an early-exit guard.
   *
   * @returns {boolean} True when the loop should bail out.
   */
  checkIfWorldExists() {
    return !this.world || this.world.character.dead || !this.world.character;
  }

  /** Starts the fall loop, pulling the object down until it reaches groundY. */
  applyGravity() {
    registerInterval(
      setInterval(() => {
        if (this.paused) return;
        if (this.isAboveGround() || this.speedY > 0) {
          this.executeFall();
        }
        if (!this.isAboveGround() && this.speedY < 0) {
          this.y = this.groundY;
          this.speedY = 0;
        }
      }, 1000 / 20),
    );
  }

  /** Advances one gravity step: move by the current speed, then slow it. */
  executeFall() {
    this.y -= this.speedY;
    this.speedY -= this.acceleration;
  }

  /**
   * Reports whether the object is off the ground.
   *
   * @returns {boolean} True while the object is above its resting height.
   */
  isAboveGround() {
    return this.y < this.groundY;
  }

  /**
   * Picks the collision box that matches the current animation state.
   *
   * Subclasses only define the state offsets they need, so each check tests
   * that the offset exists before using it, and the plain offset is the
   * fallback for anything unhandled.
   *
   * @returns {{top: number, left: number, right: number, bottom: number}} The offset in effect.
   */
  getCurrentOffset() {
    if (this.dead && this.offsetDead) return this.offsetDead;
    if (this.isHurt() && this.offsetHurt) return this.offsetHurt;
    if (this.isAttacking && this.offsetAttack) return this.offsetAttack;
    if (this.isRunning && this.offsetRun) return this.offsetRun;
    if (this.isWalking && this.offsetWalking) return this.offsetWalking;
    if (this.offsetIdle) return this.offsetIdle;
    return this.offset;
  }

  /**
   * Resolves both objects' offsets against the way each is facing.
   *
   * A mirrored sprite has its padding mirrored too, so left and right swap
   * whenever otherDirection is set. Without this a troll walking left would
   * collide using the box it had while walking right.
   *
   * @param {MovableObject} mo - The other object in the comparison.
   * @returns {{thisLeft: number, thisRight: number, moLeft: number, moRight: number}} Horizontal insets for both objects.
   */
  getDirectionalOffset(mo) {
    const thisOffset = this.getCurrentOffset();
    const moOffset = mo.getCurrentOffset();
    return {
      thisLeft: this.otherDirection ? thisOffset.right : thisOffset.left,
      thisRight: this.otherDirection ? thisOffset.left : thisOffset.right,
      moLeft: mo.otherDirection ? moOffset.right : moOffset.left,
      moRight: mo.otherDirection ? moOffset.left : moOffset.right,
    };
  }

  /**
   * Tests whether two collision boxes overlap on both axes.
   *
   * @param {MovableObject} mo - The object to test against.
   * @returns {boolean} True when the inset boxes intersect.
   */
  isColliding(mo) {
    const offset = this.getDirectionalOffset(mo);
    const thisOffset = this.getCurrentOffset();
    const moOffset = mo.getCurrentOffset();
    return (
      this.x + this.width - offset.thisRight > mo.x + offset.moRight &&
      this.y + this.height - thisOffset.bottom > mo.y + moOffset.top &&
      this.x + offset.thisLeft < mo.x + mo.width - offset.moLeft &&
      this.y + thisOffset.top < mo.y + mo.height - moOffset.bottom
    );
  }

  /**
   * Takes five points of damage, the amount one arrow deals.
   *
   * Trolls therefore need two arrows and the endboss four. The hurt timer and
   * animation reset are skipped on the killing blow, so the death animation
   * starts from its first frame instead of the hurt one.
   */
  hit() {
    this.energy -= 5;
    if (this.energy < 0) {
      this.energy = 0;
    } else {
      this.lastHit = new Date().getTime();
      this.resetCurrentImage();
    }
  }

  /**
   * Reports whether the object has run out of health.
   *
   * @returns {boolean} True when energy has reached zero.
   */
  isDead() {
    return this.energy == 0;
  }

  /**
   * Reports whether the object was hit within the last 0.8 seconds.
   *
   * Drives the hurt animation and doubles as the window during which an
   * enemy cannot start a fresh attack.
   *
   * @returns {boolean} True while the hurt reaction is still playing.
   */
  isHurt() {
    let timePassed = new Date().getTime() - this.lastHit;
    timePassed = timePassed / 1000;
    return timePassed < 0.8;
  }

  /**
   * Shows the next frame of an animation, wrapping at the end of the array.
   *
   * currentImage is never reset here, so it keeps counting up and the modulo
   * does the wrapping. Coins additionally get their width adjusted to fake a
   * spin, which is why this method knows about that one subclass.
   *
   * @param {string[]} images - Frame paths for the animation to play.
   */
  playAnimation(images) {
    let i = this.currentImage % images.length;
    let path = images[i];
    this.img = this.imageCache[path];
    this.currentImage++;
    if (this instanceof Coin) {
      this.adjustCoinPosition(i);
    }
  }

  /** Moves one step right. */
  moveRight() {
    this.x += this.speed;
  }

  /** Moves one step left. */
  moveLeft() {
    this.x -= this.speed;
  }

  /** Moves one step in whichever direction the object is facing. */
  move() {
    if (this.otherDirection) {
      this.moveLeft();
    } else {
      this.moveRight();
    }
  }

  /** Launches the object upward with a full jump's force. */
  jump() {
    this.speedY = 25;
  }

  /** Launches the object upward slightly less hard, after stomping an enemy. */
  bounce() {
    this.speedY = 20;
  }

  /**
   * Draws a rotated sprite, used for arrows instead of the normal draw().
   *
   * Rotation has to happen around the sprite's centre, so the context is
   * translated there first and the image drawn at negative half its size.
   *
   * @param {CanvasRenderingContext2D} ctx - The rendering context.
   * @param {MovableObject} mo - The arrow to draw; always the same object as this.
   */
  drawArrow(ctx, mo) {
    ctx.save();
    ctx.translate(mo.x + mo.width / 2, mo.y + mo.height / 2);
    if (mo.otherDirection) {
      ctx.scale(-1, 1);
    }
    ctx.rotate((mo.angle * Math.PI) / 180);
    ctx.drawImage(mo.img, -mo.width / 2, -mo.height / 2, mo.width, mo.height);
    ctx.restore();
  }
}
