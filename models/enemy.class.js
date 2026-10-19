/**
 * Shared behaviour for every hostile in the game: both troll types and the endboss.
 */
class Enemy extends MovableObject {
  height = 240;
  width = 240;
  y = 226;
  otherDirection = true;
  energy = 10;

  /** 
   * Set 800ms after the death animation ends; World then splices it out. 
   */
  delete = false;

  /** 
   * Vertical position while dead, slightly lower than the walking height. 
   */
  deadY = 228;

  /** 
   * Points at either enemySounds or endbossSounds, chosen per instance at runtime. 
   */
  enemySoundLibrary;

  /** 
   * Collision box inset, leaving roughly 100px of the 240px sprite. 
   */
  offset = {
    top: 85,
    left: 90,
    right: 50,
    bottom: 35,
  };

  /**
   * Horizontal band the character's centre must land within to stomp this enemy.
   */
  stompOffset = {
    left: 50,
    right: 90,
  };

  /**
   * Adds this enemy's three sounds to the shared list for muting and volume.
   */
  registerEnemySounds() {
    registerGameSound(this.enemySounds.isHurtSound);
    registerGameSound(this.enemySounds.isDeadSound);
    registerGameSound(this.enemySounds.isHitSound);
  }

  /**
   * Mirrors the stomp band when the enemy faces left.
   *
   * @returns {{left: number, right: number}} - The band, resolved for the current facing.
   */
  getStompOffset() {
    return {
      left: this.otherDirection ? this.stompOffset.right : this.stompOffset.left,
      right: this.otherDirection ? this.stompOffset.left : this.stompOffset.right,
    };
  }

  /** 
   * Troll sound set, shared between all enemies; the endboss cries with its own. 
   */
  enemySounds = trollSounds;

  /**
   * Picks a start position 0 to 500px past wherever the previous enemy was placed, then stores it back on the world as the next starting point.
   *
   * @returns {number} - The position chosen, also written to world.initialObstacleSpawn.
   */
  calculateSpawningLocation() {
    this.spawningLocation = this.world.initialObstacleSpawn + Math.random() * 500;
    return (this.world.initialObstacleSpawn = this.spawningLocation);
  }

  /**
   * Reports whether the character has got past this enemy.
   *
   * @returns {boolean} - True when the character is behind the way the enemy faces.
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
   * @returns {boolean} - True when movement should be suppressed.
   */
  shouldStopMoving() {
    if (!this.world || !this.world.character) return false;
    return this.isHurt() || (this.world.character.isHurt() && this.world.character.lastAttacker === this && !this.world.character.isAboveGround());
  }

  /**
   * Flips the enemy to dead the first time its health reaches zero.
   *
   * @returns {boolean|undefined} - True on the transition, undefined otherwise.
   */
  checkIfEnemyIsDead() {
    if (this.isDead() && !this.dead) {
      this.playEnemyBasedDeadSound();
      this.resetCurrentImage();
      return (this.dead = true);
    }
  }

  /** 
   * Selects the right sound set for this enemy type and plays its death cry. 
   */
  playEnemyBasedDeadSound() {
    if (this instanceof Troll_1 || this instanceof Troll_2) {
      this.enemySoundLibrary = this.enemySounds;
    } else {
      this.enemySoundLibrary = this.endbossSounds;
    }
    this.playOwnSound(this.enemySoundLibrary.isDeadSound);
  }

  /**
   * Plays the hurt cry, but only on the first frame of the hurt animation so it does not retrigger ten times a second while the animation runs.
   */
  playEnemyBasedHurtSound() {
    if (this.currentImage === 0) {
      if (this instanceof Troll_1 || this instanceof Troll_2) {
        this.enemySoundLibrary = this.enemySounds;
      } else {
        this.enemySoundLibrary = this.endbossSounds;
      }
      this.playOwnSound(this.enemySoundLibrary.isHurtSound);
    }
  }

  /**
   * Plays the death animation once, then holds its final frame.
   */
  playEnemyDeadAnimation() {
    this.y = this.deadY;
    let imagesDead = this.getImagesDead();
    if (this.currentImage < imagesDead.length - 1) {
      this.playAnimation(imagesDead);
    } else {
      this.loadImage(imagesDead[imagesDead.length - 1]);
      this.deathAnimationDone = true;
      this.setEnemyDeadTimeout();
    }
  }

  /** 
   * Marks the corpse for removal 800ms later, leaving it briefly on screen. 
   */
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
   * @returns {string[]} - The endboss array for the boss, the troll array otherwise.
   */
  getImagesDead() {
    if (this instanceof Endboss) {
      return endbossImages.dead;
    } else {
      return this.IMAGES_DEAD;
    }
  }

  /**
   * Runs one attack animation through to its end, then releases the attack.
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
   */
  enemyDealsDamage() {
    if (this.currentImage >= 7 && !this.hasDealtDamage && !this.world.character.isHurt() && this.world.character.isEncounteringObstacle(this)) {
      this.world.character.addPendingDamage(this, 20);
      this.world.character.lastAttacker = this;
      this.hasDealtDamage = true;
    }
  }

  /**
   * Reports whether any part of the enemy is currently on screen.
   *
   * @returns {boolean} - True when the enemy overlaps the visible viewport.
   */
  inFrame() {
    const enemyOffsets = this.getEnemyDirectionalOffset();
    return this.x + this.width - enemyOffsets.rightOffset >= -this.world.camera_x && this.x + enemyOffsets.leftOffset <= -this.world.camera_x + this.world.canvas.width;
  }

  /**
   * Mirrors the horizontal collision insets for the current facing.
   *
   * @returns {{leftOffset: number, rightOffset: number}} - Insets resolved for the current facing.
   */
  getEnemyDirectionalOffset() {
    return {
      leftOffset: this.otherDirection ? this.offset.right : this.offset.left,
      rightOffset: this.otherDirection ? this.offset.left : this.offset.right,
    };
  }

  /** 
   * Starts both enemy loops: movement at 60fps and animation at 10fps. 
   */
  animate() {
    this.startEnemy();
    this.startStatusBasedAnimation();
  }

  /** 
   * Movement loop: checks for death and walks the enemy sixty times a second. 
   */
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

  /** 
   * Animation loop: picks and advances the right sprite ten times a second. 
   */
  startStatusBasedAnimation() {
    registerInterval(
      setInterval(() => {
        if (this.paused) return;
        if (this.checkIfWorldExists()) return;
        this.playStatusBasedAnimation();
      }, 100),
    );
  }

  /** 
   * Turns the enemy around when the character slips past it. 
   */
  getEnemyDirection() {
    if (this.isCharacterBehind()) {
      this.otherDirection = !this.otherDirection;
    }
  }

  /**
   * Chooses which animation to show, in priority order.
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

  /** 
   * Plays the hurt cry and the matching frames. 
   */
  executeHurtAnimation() {
    this.playEnemyBasedHurtSound();
    this.playAnimation(this.IMAGES_HURT);
  }

  /** 
   * Turns and walks the enemy, unless it is dead, attacking or reeling. 
   */
  activateEnemy() {
    if (!this.dead && !this.isAttacking && !this.shouldStopMoving()) {
      this.getEnemyDirection();
      this.move();
    }
  }
}
