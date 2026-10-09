/**
 * Shared behaviour for every hostile in the game: both troll types and the
 * endboss.
 *
 * Enemies walk toward the character, turn to face it, attack when it is in
 * reach and play a death animation before removing themselves. Subclasses
 * supply only their sprite arrays and, for the endboss, a larger set of
 * per-state dimensions.
 *
 * Two sound sets exist because the endboss has its own recordings. Rather than
 * branching at every call site, the methods below point enemySoundLibrary at
 * whichever set applies and then use that.
 */
class Enemy extends MovableObject {
  height = 240;
  width = 240;
  y = 226;
  otherDirection = true;
  energy = 10;

  /** Set 800ms after the death animation ends; World then splices it out. */
  delete = false;

  /** Vertical position while dead, slightly lower than the walking height. */
  deadY = 228;

  /** Points at either enemySounds or endbossSounds, chosen per instance at runtime. */
  enemySoundLibrary;

  /** Collision box inset, leaving roughly 100px of the 240px sprite. */
  offset = {
    top: 85,
    left: 90,
    right: 50,
    bottom: 35,
  };

  /**
   * Horizontal band the character's centre must land within to stomp this
   * enemy. Narrower than the collision box on purpose, so a glancing hit from
   * the side does not count as landing on top.
   */
  stompOffset = {
    left: 100,
    right: 75,
  };

  /**
   * Mirrors the stomp band when the enemy faces left.
   *
   * @returns {{left: number, right: number}} The band, resolved for the current facing.
   */
  getStompOffset() {
    return {
      left: this.otherDirection ? this.stompOffset.right : this.stompOffset.left,
      right: this.otherDirection ? this.stompOffset.left : this.stompOffset.right,
    };
  }

  /** Troll sound set; the endboss defines its own and uses that instead. */
  enemySounds = {
    isAttackingSound: new Audio("audio/enemy_audio/enemy_attack_sound.mp3"),
    isWalkingSound: new Audio("audio/enemy_audio/enemy_walking_sound.mp3"),
    isHitSound: new Audio("audio/enemy_audio/enemy_arrow_impact_sound.mp3"),
    isHurtSound: new Audio("audio/enemy_audio/enemy_hurt_sound.mp3"),
    isDeadSound: new Audio("audio/enemy_audio/enemy_dead_sound.mp3"),
  };

  /**
   * Picks a start position 0 to 500px past wherever the previous enemy was
   * placed, then stores it back on the world as the next starting point.
   *
   * Chaining the positions this way keeps the enemies spread along the level
   * instead of clustering, which independent random values would allow.
   *
   * @returns {number} The position chosen, also written to world.initialObstacleSpawn.
   */
  calculateSpawningLocation() {
    this.spawningLocation = this.world.initialObstacleSpawn + Math.random() * 500;
    return (this.world.initialObstacleSpawn = this.spawningLocation);
  }

  /**
   * Reports whether the character has got past this enemy.
   *
   * @returns {boolean} True when the character is behind the way the enemy faces.
   */
  isCharacterBehind() {
    if (!this.world || !this.world.character) return false;
    if (this.otherDirection) {
      return this.world.character.x > this.x;
    } else {
      return this.world.character.x < this.x;
    }
  }

  /**
   * Reports whether the enemy should hold still this tick.
   *
   * True while it is reeling from a hit, and also while the character is
   * recovering from a hit this enemy landed, so a troll does not walk through
   * its victim mid-animation. The airborne check lets a jumping character
   * escape rather than being followed.
   *
   * @returns {boolean} True when movement should be suppressed.
   */
  shouldStopMoving() {
    if (!this.world || !this.world.character) return false;
    return this.isHurt() || (this.world.character.isHurt() && this.world.character.lastAttacker === this && !this.world.character.isAboveGround());
  }

  /**
   * Flips the enemy to dead the first time its health reaches zero.
   *
   * Resets the frame counter so the death animation starts at frame 0 rather
   * than continuing from whatever was playing.
   *
   * @returns {boolean|undefined} True on the transition, undefined otherwise.
   */
  checkIfEnemyIsDead() {
    if (this.isDead() && !this.dead) {
      this.playEnemyBasedDeadSound();
      this.resetCurrentImage();
      return (this.dead = true);
    }
  }

  /** Selects the right sound set for this enemy type and plays its death cry. */
  playEnemyBasedDeadSound() {
    if (this instanceof Troll_1 || this instanceof Troll_2) {
      this.enemySoundLibrary = this.enemySounds;
      this.enemySoundLibrary.isDeadSound.currentTime = 0;
      playSound(this.enemySoundLibrary.isDeadSound, gameSoundsVolume);
    } else {
      this.enemySoundLibrary = this.endbossSounds;
      this.enemySoundLibrary.isDeadSound.currentTime = 0;
      playSound(this.enemySoundLibrary.isDeadSound, gameSoundsVolume);
    }
  }

  /**
   * Plays the hurt cry, but only on the first frame of the hurt animation so
   * it does not retrigger ten times a second while the animation runs.
   */
  playEnemyBasedHurtSound() {
    if (this.currentImage === 0) {
      if (this instanceof Troll_1 || this instanceof Troll_2) {
        this.enemySoundLibrary = this.enemySounds;
      } else {
        this.enemySoundLibrary = this.endbossSounds;
      }
      this.enemySoundLibrary.isHurtSound.currentTime = 0;
      playSound(this.enemySoundLibrary.isHurtSound, gameSoundsVolume);
    }
  }

  /**
   * Plays the death animation once, then holds its final frame.
   *
   * Setting deathAnimationDone here is what lets World decide the endboss
   * fight is over only after the last frame has actually been drawn.
   */
  playEnemyDeadAnimation() {
    this.y = this.deadY;
    let imagesDead = this.getImagesDead();
    if (this.currentImage < imagesDead.length - 1) {
      this.playAnimation(imagesDead);
    } else {
      this.loadImage(imagesDead[imagesDead.length - 1]);
      this.deathAnimationDone = true;
      if (this.enemySoundLibrary) {
        this.enemySoundLibrary.isDeadSound.pause();
      }
      this.setEnemyDeadTimeout();
    }
  }

  /** Marks the corpse for removal 800ms later, leaving it briefly on screen. */
  setEnemyDeadTimeout() {
    registerInterval(
      setTimeout(() => {
        return (this.delete = true);
      }, 800),
    );
  }

  /**
   * Returns the death frames for this enemy type.
   *
   * @returns {string[]} The endboss array for the boss, the troll array otherwise.
   */
  getImagesDead() {
    if (this instanceof Endboss) {
      return this.ENDBOSS_IMAGES_DEAD;
    } else {
      return this.IMAGES_DEAD;
    }
  }

  /**
   * Runs one attack animation through to its end, then releases the attack.
   *
   * Only the trolls reach this: the endboss overrides the animation dispatch
   * and uses its own attack handling.
   */
  playAttackAnimation() {
    if (this.currentImage >= this.IMAGES_ATTACKING.length - 1) {
      this.isAttacking = false;
      this.resetCurrentImage();
    } else {
      this.playAnimation(this.IMAGES_ATTACKING);
      this.enemyDealsDamage();
    }
  }

  /**
   * Lands 20 points of damage partway through the attack animation.
   *
   * Waiting for frame 7 lines the damage up with the swing connecting, and
   * the hasDealtDamage latch keeps one swing from hitting repeatedly.
   */
  enemyDealsDamage() {
    if (this.currentImage >= 7 && !this.hasDealtDamage && this.world.character.isEncounteringObstacle(this)) {
      this.world.character.addPendingDamage(this, 20);
      this.world.character.lastAttacker = this;
      this.hasDealtDamage = true;
    }
  }

  /**
   * Reports whether any part of the enemy is currently on screen.
   *
   * Used to skip arrow collision tests against enemies the player cannot see.
   *
   * @returns {boolean} True when the enemy overlaps the visible viewport.
   */
  inFrame() {
    const enemyOffsets = this.getEnemyDirectionalOffset();
    return this.x + this.width - enemyOffsets.rightOffset >= -this.world.camera_x && this.x + enemyOffsets.leftOffset <= -this.world.camera_x + this.world.canvas.width;
  }

  /**
   * Mirrors the horizontal collision insets for the current facing.
   *
   * @returns {{leftOffset: number, rightOffset: number}} Insets resolved for the current facing.
   */
  getEnemyDirectionalOffset() {
    return {
      leftOffset: this.otherDirection ? this.offset.right : this.offset.left,
      rightOffset: this.otherDirection ? this.offset.left : this.offset.right,
    };
  }

  /** Starts both enemy loops: movement at 60fps and animation at 10fps. */
  animate() {
    this.startEnemy();
    this.startStatusBasedAnimation();
  }

  /** Movement loop: checks for death and walks the enemy sixty times a second. */
  startEnemy() {
    registerInterval(
      setInterval(() => {
        if (this.paused) return;
        if (this.checkIfWorldExists()) return;
        this.checkIfEnemyIsDead();
        this.activateEnemy();
      }, 1000 / 60),
    );
  }

  /** Animation loop: picks and advances the right sprite ten times a second. */
  startStatusBasedAnimation() {
    registerInterval(
      setInterval(() => {
        if (this.paused) return;
        if (this.checkIfWorldExists()) return;
        this.playStatusBasedAnimation();
      }, 100),
    );
  }

  /** Turns the enemy around when the character slips past it. */
  getEnemyDirection() {
    if (this.isCharacterBehind()) {
      this.otherDirection = !this.otherDirection;
    }
  }

  /**
   * Chooses which animation to show, in priority order.
   *
   * Death beats being hurt, which beats attacking, which beats walking. The
   * idle branch is the odd one: while the character is reeling the enemy
   * pauses mid-attack rather than swinging at someone already staggered.
   */
  playStatusBasedAnimation() {
    if (this.dead) {
      this.playEnemyDeadAnimation();
    } else if (this.isHurt()) {
      this.executeHurtAnimation();
    } else if (this.world.character.isHurt() && this.isAttacking) {
      this.playAnimation(this.IMAGES_IDLE);
    } else if (this.isAttacking && !this.world.character.isHurt()) {
      this.hasDealtDamage = false;
      this.playAttackAnimation();
    } else {
      this.playAnimation(this.IMAGES_WALKING);
    }
  }

  /** Plays the hurt cry and the matching frames. */
  executeHurtAnimation() {
    this.playEnemyBasedHurtSound();
    this.playAnimation(this.IMAGES_HURT);
  }

  /** Turns and walks the enemy, unless it is dead, attacking or reeling. */
  activateEnemy() {
    if (!this.dead && !this.isAttacking && !this.shouldStopMoving()) {
      this.getEnemyDirection();
      this.move();
    }
  }
}
