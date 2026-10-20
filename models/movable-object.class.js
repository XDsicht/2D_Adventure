/**
 * Base class for everything that moves, collides or takes damage.
 */
class MovableObject extends DrawableObject {
  /** 
   * Horizontal step per move; subclasses override it with their own pace. 
   */
  speed = 0.15;

  /** 
   * True when the object faces left, which mirrors both drawing and offsets. 
   */
  otherDirection = false;

  dead = false;

  /** 
   * Set once the final frame of the death animation has actually been drawn. 
   */
  deathAnimationDone = false;

  /** 
   * Vertical speed; positive moves up, negative falls. 
   */
  speedY = 0;

  /** 
   * Amount subtracted from speedY each gravity tick. 
   */
  acceleration = 2.5;

  /** 
   * Hit points; trolls override this with 10 and the endboss with 20. 
   */
  energy = 100;

  /** 
   * Timestamp of the last hit taken, used by isHurt(). 
   */
  lastHit = 0;

  isAttacking = false;
  isWalking = false;
  isRunning = false;
  lastAttackTime = 0;

  /** 
   * Latch so one attack animation can only land damage once. 
   */
  hasDealtDamage = false;

  lastAttacker;
  world;

  /** 
   * Height this object comes to rest at; arrows override it with 410. 
   */
  groundY = 250;

  spawningLocation;

  /** 
   * Pixels to inset each edge of the sprite to get its collision box. 
   */
  offset = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };

  /**
   * Reports whether this object's animation loops should stop.
   *
   * @returns {boolean} - True when the loop should bail out.
   */
  checkIfWorldExists() {
    return !this.world || this.world.character.dead || !this.world.character;
  }

  /** 
   * Starts the fall loop, pulling the object down until it reaches groundY. 
   */
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

  /** 
   * Advances one gravity step: move by the current speed, then slow it. 
   */
  executeFall() {
    this.y -= this.speedY;
    this.speedY -= this.acceleration;
  }

  /**
   * Reports whether the object is off the ground.
   *
   * @returns {boolean} - True while the object is above its resting height.
   */
  isAboveGround() {
    return this.y < this.groundY;
  }

  /**
   * Picks the collision box that matches the current animation state.
   *
   * @returns {{top: number, left: number, right: number, bottom: number}} - The offset in effect.
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
   * @param {MovableObject} mo - The other object in the comparison.
   * @returns {{thisLeft: number, thisRight: number, moLeft: number, moRight: number}} - Horizontal insets for both objects.
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
   * @returns {boolean} - True when the inset boxes intersect.
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
   * @returns {boolean} - True while the hurt reaction is still playing.
   */
  isHurt() {
    let timePassed = new Date().getTime() - this.lastHit;
    timePassed = timePassed / 1000;
    return timePassed < 0.8;
  }

  /**
   * Shows the next frame of an animation, wrapping at the end of the array.
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

  /** 
   * Moves one step right. 
   */
  moveRight() {
    this.x += this.speed;
  }

  /** 
   * Moves one step left. 
   */
  moveLeft() {
    this.x -= this.speed;
  }

  /** 
   * Moves one step in whichever direction the object is facing. 
   */
  move() {
    if (this.otherDirection) {
      this.moveLeft();
    } else {
      this.moveRight();
    }
  }

  /** 
   * Launches the object upward with a full jump's force. 
   */
  jump() {
    this.speedY = 25;
  }

  /** 
   * Launches the object upward slightly less hard, after stomping an enemy. 
   */
  bounce() {
    this.speedY = 20;
  }

  /**
   * Draws a rotated sprite, used for arrows instead of the normal draw().
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

  /** 
   * Damage collected this tick, applied as one hit so simultaneous attackers stack. 
   */
  pendingDamage = 0;

  /** 
   * Attackers already counted this tick, so one enemy cannot land twice in a single pass. 
   */
  damageFromAttackers = new Set();

  /**
   * Applies damage and starts the hurt reaction.
   *
   * @param {number} [damage=20] - Points to subtract; trolls deal 20, the boss 40.
   */
  isHit(damage = 20) {
    this.energy -= damage;
    if (this.energy < 0) {
      this.energy = 0;
    } else {
      this.lastHit = new Date().getTime();
      this.resetCurrentImage();
    }
  }

  /**
   * Queues damage from one attacker for this tick.
   *
   * @param {MovableObject} attacker - The enemy dealing the damage.
   * @param {number} [damage=20] - Points queued.
   */
  addPendingDamage(attacker, damage = 20) {
    if (!this.damageFromAttackers.has(attacker)) {
      this.pendingDamage += damage;
      this.damageFromAttackers.add(attacker);
    }
  }

  /** 
   * Applies everything queued this tick as a single hit, then clears the queue. 
   */
  applyAccumulatedDamage() {
    if (this.pendingDamage > 0) {
      this.isHit(this.pendingDamage);
      this.pendingDamage = 0;
      this.damageFromAttackers.clear();
    }
  }

  /** 
   * Empties the queue at the end of a tick so the next one starts fresh. 
   */
  resetDamageAccumulation() {
    this.pendingDamage = 0;
    this.damageFromAttackers.clear();
  }

  /**
   * Plays one of this object's own sounds from the start.
   *
   * @param {HTMLAudioElement} sound - The sound to play.
   */
  playOwnSound(sound) {
    sound.currentTime = 0;
    playSound(sound, gameSoundsVolume);
  }
}
