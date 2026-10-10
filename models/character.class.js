/**
 * Vorga, the player-controlled archer.
 *
 * Runs on three loops at different rates: input and movement at 60fps, the
 * movement animation at 10fps, and the attack animation at roughly 33fps. The
 * last two are mutually exclusive, since the movement loop bails out whenever
 * an attack is playing.
 *
 * Shooting is a two-stage handshake rather than an immediate action. Pressing
 * D starts the draw animation, and only when that finishes 300ms later does
 * releaseArrow go true, which is World's cue to spawn the arrow. That is why
 * the arrow leaves the bow at the end of the animation instead of the start.
 */
class Character extends MovableObject {
  height = 200;
  width = 250;
  speed = 10;
  y = 250;
  x = 120;

  /**
   * True while an arrow is drawn but not yet spawned.
   *
   * World watches this to know when to create the arrow, and canStartAttack()
   * refuses a new draw while it is set, so one animation always yields exactly
   * one arrow however fast the key is pressed.
   */
  releaseArrow = false;

  /** Timestamp of the last arrow spawned, used by shotAllowed() as a cooldown. */
  shootingTime = 0;
  characterJumping = false;

  /** Facing snapshotted when the draw begins, so the arrow flies the way the shot was aimed. */
  currentDirection;

  /** Blocks movement for 400ms from the start of a draw, slightly outlasting the animation. */
  attackDelay = false;

  /** Damage collected this tick, applied as one hit so simultaneous attackers stack. */
  pendingDamage = 0;

  /** Attackers already counted this tick, so one enemy cannot land twice in a single pass. */
  damageFromAttackers = new Set();

  offset = {
    top: 35,
    left: 90,
    right: 78,
    bottom: 20,
  };

  characterSounds = {
    isAttackingSound: new Audio("audio/character_audio/character_arrow_shooting_sound.mp3"),
    isWalkingSound: new Audio("audio/character_audio/character_walking_sound.mp3"),
    isJumpingSound: new Audio("audio/character_audio/character_jumping_sound.mp3"),
    isHurtSound: new Audio("audio/character_audio/character_hurt_sound.mp3"),
    isDeadSound: new Audio("audio/character_audio/character_dead_sound.mp3"),
  };

  IMAGES_IDLE = characterImages.idle;
  IMAGES_WALKING = characterImages.walking;
  IMAGES_JUMPING = characterImages.jumping;
  IMAGES_HURT = characterImages.hurt;
  IMAGES_DEAD = characterImages.dead;
  IMAGES_ATTACKING = characterImages.attacking;

  world;

  /** Preloads every animation, starts the three loops and registers the sounds. */
  constructor() {
    super().loadImage("img/2.character/1.idle/Warrior_03__IDLE_000.png");
    this.loadCharacterImages();
    this.animate();
    this.applyGravity();
    this.registerCharacterSounds();
  }

  /** Preloads all six animation sets into the image cache. */
  loadCharacterImages() {
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_ATTACKING);
    this.loadImages(this.IMAGES_IDLE);
  }

  /** Adds the five character sounds to the shared list for muting and volume. */
  registerCharacterSounds() {
    registerGameSound(this.characterSounds.isAttackingSound);
    registerGameSound(this.characterSounds.isWalkingSound);
    registerGameSound(this.characterSounds.isJumpingSound);
    registerGameSound(this.characterSounds.isHurtSound);
    registerGameSound(this.characterSounds.isDeadSound);
  }

  /** Starts all three loops: movement animation, input handling and attack animation. */
  animate() {
    this.characterMovementAnimationIntervals();
    this.characterActionsIntervals();
    this.characterAttackAnimationIntervals();
  }

  /** Starts the input and attack loops. */
  characterActionsIntervals() {
    if (!this.dead || !this.isHurt()) {
      let actions = this.characterActions();
      let attack = this.characterAttack();
    }
  }

  /** Attack loop: ten times a second, begins a draw if everything allows it. */
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
   * The releaseArrow check is the important one: without it a second press
   * could start another animation while the first arrow was still pending,
   * producing two draws and a single arrow.
   *
   * @returns {boolean} True when a draw may start this tick.
   */
  canStartAttack() {
    if (this.dead) return false;
    if (this.isAttacking) return false;
    if (this.releaseArrow) return false;
    if (!this.world.keyboard.D) return false;
    if (!this.shotAllowed()) return false;
    return this.world.quiver.percentage > 0;
  }

  /** Input loop: reads the keyboard and moves the character sixty times a second. */
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

  /** Clears walking and jumping state once the character is back on the ground. */
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
   *
   * Nothing happens during an attack or its follow-through, which is what
   * stops the character sliding around mid-draw.
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

  /** Steps right, faces right and keeps the walking sound going. */
  executeMoveRight() {
    this.moveRight();
    this.otherDirection = false;
    this.isWalking = true;
    this.playWalkingSound();
  }

  /** Steps left, faces left and keeps the walking sound going. */
  executeMoveLeft() {
    this.moveLeft();
    this.otherDirection = true;
    this.isWalking = true;
    this.playWalkingSound();
  }

  /** Launches a jump, restarting the animation so it begins at its first frame. */
  executeJump() {
    this.characterJumping = true;
    this.isWalking = false;
    this.resetCurrentImage();
    this.jump();
    this.characterSounds.isWalkingSound.pause();
    playSound(this.characterSounds.isJumpingSound, gameSoundsVolume);
  }

  /**
   * Switches the character to dead the first time health reaches zero.
   *
   * Stops the input loop outright and resets the frame counter so the death
   * animation starts from frame 0.
   *
   * @param {number} movements - Interval id of the input loop, cleared here.
   * @returns {boolean|undefined} True on the transition, undefined otherwise.
   */
  disableMovements(movements) {
    if (this.isDead() && !this.dead) {
      this.resetCurrentImage();
      clearInterval(movements);
      this.playDeadSound();
      return (this.dead = true);
    }
  }

  /** Plays the death cry from the start. */
  playDeadSound() {
    this.characterSounds.isDeadSound.currentTime = 0;
    playSound(this.characterSounds.isDeadSound, gameSoundsVolume);
  }

  /**
   * Begins a draw: starts the animation, plays the attacking sound and snapshots
   * the facing, then schedules the arrow's release 300ms later.
   */
  activateDKey() {
    if (!this.isAttacking) {
      this.resetCurrentImage();
      this.isAttacking = true;
      this.playAttackingSound();
      this.world.keyboard.D = true;
      this.currentDirection = this.otherDirection;
      this.attackDelay = true;
      this.resetAttackVariables();
    }
  }

  /** Plays the attacking sound from the start. */
  playAttackingSound() {
    this.characterSounds.isAttackingSound.currentTime = 0;
    playSound(this.characterSounds.isAttackingSound, gameSoundsVolume);
  }

  /** Releases the movement block 400ms after the draw began. */
  resetAttackDelayTimer() {
    registerInterval(
      setTimeout(() => {
        this.attackDelay = false;
      }, 400),
    );
  }

  /**
   * Ends the draw 300ms in and hands World permission to spawn the arrow.
   *
   * Clearing the D flag here means holding the key still produces one arrow
   * per draw rather than a continuous stream.
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
   *
   * Yields entirely while an attack plays, so the faster attack loop owns the
   * sprite for that time.
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

  /** Chooses an animation: death first, then hurt, jumping, walking, idle. */
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
   *
   * Setting deathAnimationDone on the last frame is what tells World the Game
   * Over screen may appear; checking the frame counter instead would show it
   * one frame early.
   */
  executeDeathAnimation() {
    if (this.currentImage < this.IMAGES_DEAD.length - 1) {
      this.playAnimation(this.IMAGES_DEAD);
    } else {
      this.loadImage(this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1]);
      this.deathAnimationDone = true;
    }
  }

  /** Plays the hurt cry and the matching frames. */
  executeHurtAnimation() {
    this.playHurtSound();
    this.playAnimation(this.IMAGES_HURT);
  }

  /**
   * Plays the jump frames, then settles on a standing pose.
   *
   * Without the final swap the character would hang on the last jump frame
   * after touching down.
   */
  executeJumpAnimation() {
    this.characterJumping = true;
    this.playAnimation(this.IMAGES_JUMPING);
    if (this.currentImage === this.IMAGES_JUMPING.length - 1 || !this.isAboveGround()) {
      this.loadImage(this.IMAGES_IDLE[this.IMAGES_IDLE.length - 1]);
    }
  }

  /** Plays the hurt cry, only on the first frame so it does not retrigger. */
  playHurtSound() {
    if (this.currentImage === 0) {
      this.characterSounds.isHurtSound.currentTime = 0;
      playSound(this.characterSounds.isHurtSound, gameSoundsVolume);
    }
  }

  /** Attack animation loop, faster than the movement one so the draw reads crisply. */
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
   * Measured from the spawn rather than from the key press, so the cooldown
   * covers the gap between arrows rather than between attempts.
   *
   * @returns {boolean} True once 0.2 seconds have elapsed.
   */
  shotAllowed() {
    let timePassed = new Date().getTime() - this.shootingTime;
    timePassed = timePassed / 1000;
    return timePassed > 0.2;
  }

  /**
   * Reports whether a troll is within striking distance horizontally.
   *
   * Vertical overlap is ignored on purpose: trolls and the character share a
   * ground line, so only the horizontal gap matters. The 15px slack lets a
   * troll start its swing just before the sprites actually touch.
   *
   * @param {Enemy} enemy - The troll to measure against.
   * @returns {boolean} True when the troll is close enough to attack.
   */
  isEncounteringObstacle(enemy) {
    const offset = this.getDirectionalOffset(enemy);

    return this.x + this.width - offset.thisRight > enemy.x + offset.moRight - 15 && this.x + offset.thisLeft < enemy.x + enemy.width - offset.moLeft;
  }

  /**
   * Reports whether the endboss is within striking distance horizontally.
   *
   * Separate from the troll version because the boss's collision box changes
   * size with its animation; the 0.99 factors keep the reach just inside the
   * box so the two do not flicker in and out of contact.
   *
   * @param {Endboss} endboss - The boss to measure against.
   * @returns {boolean} True when the boss is close enough to attack.
   */
  isEncounteringEndboss(endboss) {
    const offset = this.getDirectionalOffset(endboss);
    return this.x + this.width - offset.thisRight > endboss.x + offset.moRight * 0.99 && this.x + offset.thisLeft * 0.99 < endboss.x + endboss.width - offset.moLeft;
  }

  /**
   * Reports whether the character is landing on top of an enemy.
   *
   * The speedY check is what makes this a stomp rather than a collision: it
   * only passes while falling, so jumping up into an enemy does nothing.
   *
   * @param {MovableObject} mo - The enemy being landed on.
   * @returns {boolean} True when falling onto the enemy's box.
   */
  isCollidingVertically(mo) {
    const offset = this.getDirectionalOffset(mo);
    return (
      this.x + offset.thisLeft < mo.x + mo.width - offset.moRight &&
      this.y + this.height - this.offset.bottom < mo.y + mo.height - mo.offset.bottom &&
      this.y + this.height - this.offset.bottom > mo.y + mo.offset.top &&
      this.x + this.width - offset.thisRight > mo.x + offset.moLeft &&
      this.speedY < 0
    );
  }

  /**
   * Applies damage and starts the hurt reaction.
   *
   * The timestamp and frame reset are skipped on the killing blow so the
   * death animation starts cleanly instead of continuing from the hurt one.
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
   * The attacker set means two trolls hitting in the same tick deal their
   * damage once each, while one troll cannot land twice.
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

  /** Applies everything queued this tick as a single hit, then clears the queue. */
  applyAccumulatedDamage() {
    if (this.pendingDamage > 0) {
      this.isHit(this.pendingDamage);
      this.pendingDamage = 0;
      this.damageFromAttackers.clear();
    }
  }

  /** Empties the queue at the end of a tick so the next one starts fresh. */
  resetDamageAccumulation() {
    this.pendingDamage = 0;
    this.damageFromAttackers.clear();
  }

  /** Plays footsteps on the ground and silences them in mid-air. */
  playWalkingSound() {
    if (!this.isAboveGround()) {
      playSound(this.characterSounds.isWalkingSound, gameSoundsVolume);
    } else {
      this.characterSounds.isWalkingSound.pause();
    }
  }
}
