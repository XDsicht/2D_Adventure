/**
 * Vorga, the player-controlled archer.
*/
class Character extends MovableObject {
  height = 200;
  width = 250;
  speed = 10;
  y = 250;
  x = 120;

  /**
   * True while an arrow is drawn but not yet spawned.
   */
  releaseArrow = false;

  /** 
   * Timestamp of the last arrow spawned, used by shotAllowed() as a cooldown. 
   */
  shootingTime = 0;
  characterJumping = false;

  /**
   * Records that the current jump has already cost her health, and is cleared by the next jump.
   */
  hasBeenHurtThisJump = false;

  /** 
   * Facing snapshotted when the draw begins, so the arrow flies the way the shot was aimed. 
   */
  currentDirection;

  /** 
   * Blocks movement for 400ms from the start of a draw, slightly outlasting the animation. 
   */
  attackDelay = false;

  offset = {
    top: 35,
    left: 90,
    right: 78,
    bottom: 20,
  };

  /**
   * Foot inset for the jump frames, which tuck the legs up.
   */
  jumpFootInset = 34;

  /**
   * Seconds between shots. The endboss raises it when it wakes, so arrows stay quick against trolls but have to be timed during the fight.
   */
  shotCooldown = 0.2;

  /**
   * Vorga's own set, declared with the others in sounds.js.
   */
  characterSounds = playerSounds;

  IMAGES_IDLE = characterImages.idle;
  IMAGES_WALKING = characterImages.walking;
  IMAGES_JUMPING = characterImages.jumping;
  IMAGES_HURT = characterImages.hurt;
  IMAGES_DEAD = characterImages.dead;
  IMAGES_ATTACKING = characterImages.attacking;

  world;

  /** 
   * Preloads every animation, starts the three loops and registers the sounds. 
   */
  constructor() {
    super().loadImage("img/2.character/1.idle/Warrior_03__IDLE_000.png");
    this.loadCharacterImages();
    this.animate();
    this.applyGravity();
    this.registerCharacterSounds();
  }

  /** 
   * Preloads all six animation sets into the image cache. 
   */
  loadCharacterImages() {
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_ATTACKING);
    this.loadImages(this.IMAGES_IDLE);
  }

  /** 
   * Adds the five character sounds to the shared list for muting and volume. 
   */
  registerCharacterSounds() {
    registerGameSound(this.characterSounds.isAttackingSound);
    registerGameSound(this.characterSounds.isWalkingSound);
    registerGameSound(this.characterSounds.isJumpingSound);
    registerGameSound(this.characterSounds.isHurtSound);
    registerGameSound(this.characterSounds.isDeadSound);
  }

  /** 
   * Starts all three loops: movement animation, input handling and attack animation. 
   */
  animate() {
    this.characterMovementAnimationIntervals();
    this.characterActionsIntervals();
    this.characterAttackAnimationIntervals();
  }

  /** 
   * Starts the input and attack loops. 
   */
  characterActionsIntervals() {
    if (!this.dead || !this.isHurt()) {
      let actions = this.characterActions();
      let attack = this.characterAttack();
    }
  }

  /** 
   * Attack loop: ten times a second, begins a draw if everything allows it. 
   */
  characterAttack() {
    registerInterval(
      setInterval(() => {
        if (this.paused) return;
        if (this.canStartAttack()) {
          this.activateDKey();
          this.resetAttackDelayTimer();
        }
      }, 100),
    );
  }

  /**
   * Decides whether a new draw may begin.
   *
   * @returns {boolean} - True when a draw may start this tick.
   */
  canStartAttack() {
    if (this.dead) return false;
    if (this.isAttacking) return false;
    if (this.releaseArrow) return false;
    if (!this.world.keyboard.D) return false;
    if (!this.shotAllowed()) return false;
    return this.world.quiver.percentage > 0;
  }

  /** 
   * Input loop: reads the keyboard and moves the character sixty times a second. 
   */
  characterActions() {
    let movements = registerInterval(
      setInterval(() => {
        if (this.paused) return;
        this.resetMovementStatus();
        this.getMovements();
        this.disableMovements(movements);
      }, 1000 / 60),
    );
  }

  /** 
   * Clears walking and jumping state once the character is back on the ground. 
   */
  resetMovementStatus() {
    if (!this.isAboveGround()) {
      this.isWalking = false;
      this.characterJumping = false;
      this.characterSounds.isWalkingSound.pause();
      this.characterSounds.isJumpingSound.pause();
    }
  }

  /**
   * Applies whatever movement keys are held.
   */
  getMovements() {
    if (!this.isAttacking && !this.attackDelay) {
      if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
        this.executeMoveRight();
      }
      if (this.world.keyboard.LEFT && this.x > 0) {
        this.executeMoveLeft();
      }
      if (this.world.keyboard.SPACE && !this.isAboveGround()) {
        this.executeJump();
      }
    }
  }

  /** 
   * Steps right, faces right and keeps the walking sound going. 
   */
  executeMoveRight() {
    this.moveRight();
    this.otherDirection = false;
    this.isWalking = true;
    this.playWalkingSound();
  }

  /** 
   * Steps left, faces left and keeps the walking sound going. 
   */
  executeMoveLeft() {
    this.moveLeft();
    this.otherDirection = true;
    this.isWalking = true;
    this.playWalkingSound();
  }

  /** 
   * Launches a jump, restarting the animation so it begins at its first frame. 
   */
  executeJump() {
    this.characterJumping = true;
    this.hasBeenHurtThisJump = false;
    this.isWalking = false;
    this.resetCurrentImage();
    this.jump();
    this.characterSounds.isWalkingSound.pause();
    playSound(this.characterSounds.isJumpingSound, gameSoundsVolume);
  }

  /**
   * Switches the character to dead the first time health reaches zero and clears all character related intervals.
   *
   * @param {number} movements - Interval id of the input loop, cleared here.
   * @returns {boolean|undefined} - True on the transition, undefined otherwise.
   */
  disableMovements(movements) {
    if (this.isDead() && !this.dead) {
      this.resetCurrentImage();
      clearInterval(movements);
      this.playOwnSound(this.characterSounds.isDeadSound);
      return (this.dead = true);
    }
  }

  /**
   * Begins a draw: starts the animation, plays the attacking sound and snapshots the facing, then schedules the arrow's release 300ms later.
   */
  activateDKey() {
    if (!this.isAttacking) {
      this.resetCurrentImage();
      this.isAttacking = true;
      this.playOwnSound(this.characterSounds.isAttackingSound);
      this.world.keyboard.D = true;
      this.currentDirection = this.otherDirection;
      this.attackDelay = true;
      this.resetAttackVariables();
    }
  }

  /** 
   * Releases the movement block 400ms after the draw began. 
   */
  resetAttackDelayTimer() {
    registerInterval(
      setTimeout(() => {
        this.attackDelay = false;
      }, 400),
    );
  }

  /**
   * Ends the draw 300ms in and hands World permission to spawn the arrow.
   */
  resetAttackVariables() {
    registerInterval(
      setTimeout(() => {
        this.isAttacking = false;
        this.world.keyboard.D = false;
        this.releaseArrow = true;
      }, 300),
    );
  }

  /**
   * Movement animation loop, ten frames a second.
   */
  characterMovementAnimationIntervals() {
    registerInterval(
      setInterval(() => {
        if (this.paused) return;
        if (this.isAttacking) return;
        return this.executeMovementAnimations();
      }, 1000 / 10),
    );
  }

  /** 
   * Chooses an animation: death first, then hurt, jumping, walking, idle. 
   */
  executeMovementAnimations() {
    if (this.dead) {
      this.executeDeathAnimation();
    } else if (this.isHurt()) {
      this.executeHurtAnimation();
    } else if (this.isAboveGround()) {
      this.executeJumpAnimation();
    } else if (this.isWalking) {
      this.playAnimation(this.IMAGES_WALKING);
    } else {
      this.playAnimation(this.IMAGES_IDLE);
    }
  }

  /**
   * Plays the death animation once, then holds its final frame.
   */
  executeDeathAnimation() {
    if (this.currentImage < this.IMAGES_DEAD.length - 1) {
      this.playAnimation(this.IMAGES_DEAD);
    } else {
      this.loadImage(this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1]);
      this.deathAnimationDone = true;
    }
  }

  /** 
   * Plays the hurt cry and the matching frames. 
   */
  executeHurtAnimation() {
    this.playHurtSound();
    this.playAnimation(this.IMAGES_HURT);
  }

  /**
   * Plays the jump frames, then settles on a standing pose.
   */
  executeJumpAnimation() {
    this.characterJumping = true;
    this.playAnimation(this.IMAGES_JUMPING);
    if (this.currentImage === this.IMAGES_JUMPING.length - 1 || !this.isAboveGround()) {
      this.loadImage(this.IMAGES_IDLE[this.IMAGES_IDLE.length - 1]);
    }
  }

  /** 
   * Plays the hurt cry, only on the first frame so it does not retrigger. 
   */
  playHurtSound() {
    if (this.currentImage === 0) {
      this.characterSounds.isHurtSound.currentTime = 0;
      playSound(this.characterSounds.isHurtSound, gameSoundsVolume);
    }
  }

  /** 
   * Attack animation loop, faster than the movement one so the draw reads crisply. 
   */
  characterAttackAnimationIntervals() {
    registerInterval(
      setInterval(() => {
        if (this.paused) return;
        if (this.isAttacking) {
          this.playAnimation(this.IMAGES_ATTACKING);
        }
      }, 30),
    );
  }

  /**
   * Reports whether enough time has passed since the last arrow was spawned.
   *
   * @returns {boolean} - True once 0.2 seconds have elapsed.
   */
  shotAllowed() {
    let timePassed = new Date().getTime() - this.shootingTime;
    timePassed = timePassed / 1000;
    return timePassed > this.shotCooldown;
  }

  /**
   * Reports whether a troll is within striking distance horizontally.
   *
   * @param {Enemy} enemy - The troll to measure against.
   * @returns {boolean} - True when the troll is close enough to attack.
   */
  isEncounteringObstacle(enemy) {
    const offset = this.getDirectionalOffset(enemy);

    return this.x + this.width - offset.thisRight > enemy.x + offset.moRight - 15 && this.x + offset.thisLeft < enemy.x + enemy.width - offset.moLeft;
  }

  /**
   * Reports whether the endboss is within striking distance horizontally.
   *
   * @param {Endboss} endboss - The boss to measure against.
   * @returns {boolean} - True when the boss is close enough to attack.
   */
  isEncounteringEndboss(endboss) {
    const offset = this.getDirectionalOffset(endboss);
    return this.x + this.width - offset.thisRight > endboss.x + offset.moRight * 0.99 && this.x + offset.thisLeft * 0.99 < endboss.x + endboss.width - offset.moLeft;
  }

  /**
   * Distance from the sprite's bottom edge up to the soles.
   *
   * @returns {number} - The inset for the pose being drawn.
   */
  getFootInset() {
    if (this.characterJumping) {
      return this.jumpFootInset;
    } else {
      return this.offset.bottom;
    }
  }

  /** 
   * Plays footsteps on the ground and silences them in mid-air. 
   */
  playWalkingSound() {
    if (!this.isAboveGround()) {
      playSound(this.characterSounds.isWalkingSound, gameSoundsVolume);
    } else {
      this.characterSounds.isWalkingSound.pause();
    }
  }
}
