/**
 * The troll chieftain guarding the end of the level.
 *
 * Unlike the trolls, each of its animation states uses a differently sized
 * sprite: the attack frames are 455x640 where the walk frames are 340x360.
 * Changing width alone would make it lurch sideways, so baseX records where it
 * really stands and updateXOffset() shifts x to keep the visible body anchored
 * while the frame grows and shrinks around it.
 *
 * It stays inert until the character comes close enough for it to enter frame,
 * at which point activated flips, the music changes and the camera starts
 * tracking it. It has 20 health, so four arrows, and cannot be stomped.
 */
class Endboss extends Enemy {
  ENDBOSS_IMAGES_IDLE = endbossImages.idle;
  ENDBOSS_IMAGES_WALKING = endbossImages.walking;
  ENDBOSS_IMAGES_RUN = endbossImages.run;
  ENDBOSS_IMAGES_JUMPING = endbossImages.jumping;
  ENDBOSS_IMAGES_HURT = endbossImages.hurt;
  ENDBOSS_IMAGES_DEAD = endbossImages.dead;
  ENDBOSS_IMAGES_ATTACKING = endbossImages.attacking;

  height = 360;
  width = 340;
  y = 102;

  /** Walking pace; sprint() raises it to 3.0 once it closes in. */
  speed = 0.9;

  /** Health, four arrows' worth, double a troll's. */
  energy = 20;

  /** Per-state sprite dimensions; the frames differ in size, so each state sets its own. */
  walkWidth = 340;
  walkHeight = 360;
  walkY = 102;
  runWidth = 365;
  runHeight = 550;
  runY = -110;
  attackWidth = 455;
  attackHeight = 640;
  attackY = -158;
  hurtWidth = 360;
  hurtHeight = 380;
  hurtY = 52;
  deadWidth = 360;
  deadHeight = 380;
  deadY = 152;
  otherDirection = true;

  /** False until the character gets close enough; gates movement and the music swap. */
  activated = false;

  /** Where the boss actually stands, independent of the current frame's width. */
  baseX = 0;

  /** How far x has been shifted to compensate for the current frame's width. */
  xOffset = 0;

  offset = {
    top: 160,
    left: 80,
    right: 60,
    bottom: 10,
  };

  offsetRun = {
    top: 160,
    left: 100,
    right: 70,
    bottom: 10,
  };

  offsetAttack = {
    top: 180,
    left: 80,
    right: 50,
    bottom: 10,
  };

  /** Its own sound set, used in place of the inherited troll sounds. */
  endbossSounds = {
    isAttackingSound: new Audio("audio/endboss_audio/endboss_attack_sound.mp3"),
    isWalkingSound: new Audio("audio/endboss_audio/endboss_walking_sound.mp3"),
    isRunningSound: new Audio("audio/endboss_audio/endboss_running_sound.mp3"),
    isHitSound: new Audio("audio/enemy_audio/enemy_arrow_impact_sound.mp3"),
    isHurtSound: new Audio("audio/endboss_audio/endboss_hurt_sound.mp3"),
    isDeadSound: new Audio("audio/endboss_audio/endboss_dead_sound.mp3"),
  };

  /**
   * Preloads all seven animations, parks the boss at x 2500 and starts its
   * loops. The loops run from the start, but movement stays gated behind
   * activated until the character approaches.
   */
  constructor() {
    super().loadImage(this.ENDBOSS_IMAGES_WALKING[0]);
    this.loadImages(this.ENDBOSS_IMAGES_IDLE);
    this.loadImages(this.ENDBOSS_IMAGES_WALKING);
    this.loadImages(this.ENDBOSS_IMAGES_RUN);
    this.loadImages(this.ENDBOSS_IMAGES_JUMPING);
    this.loadImages(this.ENDBOSS_IMAGES_ATTACKING);
    this.loadImages(this.ENDBOSS_IMAGES_HURT);
    this.loadImages(this.ENDBOSS_IMAGES_DEAD);
    this.x = 2500;
    this.baseX = this.x;
    this.animateEndboss();
    registerGameSound(this.endbossSounds.isAttackingSound);
    registerGameSound(this.endbossSounds.isWalkingSound);
    registerGameSound(this.endbossSounds.isRunningSound);
    registerGameSound(this.endbossSounds.isHitSound);
    registerGameSound(this.endbossSounds.isHurtSound);
    registerGameSound(this.endbossSounds.isDeadSound);
  }

  /**
   * Picks the collision box for the current state.
   *
   * Overrides the base version, which would also branch on dead and hurt; the
   * boss has no separate boxes for those and reuses the default.
   *
   * @returns {{top: number, left: number, right: number, bottom: number}} The offset in effect.
   */
  getCurrentOffset() {
    if (this.isAttacking) return this.offsetAttack;
    if (this.isRunning) return this.offsetRun;
    return this.offset;
  }

  /**
   * Reports whether the boss has come far enough into view to wake up.
   *
   * Derived from the canvas width rather than a fixed distance, so the reveal
   * stays proportional if the canvas is ever resized. Subtracting half the
   * walk width wakes it when roughly half its body is on screen.
   *
   * @returns {boolean} True once the boss is within the visible frame.
   */
  isInCharacterFrame() {
    if (!this.world || !this.world.character) return false;
    const characterViewEnd = this.world.character.x + this.world.canvas.width - this.world.cameraOffset - this.walkWidth / 2;
    return characterViewEnd >= this.x;
  }

  /** Switches from walking to the sprint, more than tripling its speed. */
  sprint() {
    this.isRunning = true;
    this.isWalking = false;
    this.speed = 3.0;
  }

  /**
   * Shifts x so the boss appears to stay still while its frame changes size.
   *
   * @param {number} newWidth - Width of the frame about to be drawn.
   */
  updateXOffset(newWidth) {
    const widthDifference = newWidth - this.walkWidth;
    this.xOffset = widthDifference;
    if (this.otherDirection) {
      this.updateXInOtherDirection(newWidth);
    } else {
      this.updateXInDirection(newWidth);
    }
  }

  /**
   * Compensates for a width change while facing left.
   *
   * The attack frame only shifts by half, because that sprite grows mostly to
   * the side the weapon swings rather than evenly.
   *
   * @param {number} newWidth - Width of the frame about to be drawn.
   */
  updateXInOtherDirection(newWidth) {
    if (newWidth == this.attackWidth) {
      this.x = this.baseX - this.xOffset / 2;
    } else {
      this.x = this.baseX - this.xOffset;
    }
  }

  /**
   * Compensates for a width change while facing right.
   *
   * @param {number} newWidth - Width of the frame about to be drawn.
   */
  updateXInDirection(newWidth) {
    switch (newWidth) {
      case this.attackWidth:
        this.x = this.baseX - this.xOffset / 2;
        break;
      case !this.attackWidth:
        this.xOffset = 0;
        this.x = this.baseX;
    }
  }

  /** Drops any compensation, used by states drawn at the base walk size. */
  resetXOffset() {
    this.xOffset = 0;
    this.x = this.baseX;
  }

  /**
   * Advances the boss one step and re-anchors baseX to where it now stands.
   */
  startMoving() {
    this.move();
    this.baseX = this.x + this.xOffset;
    if (!this.isRunning) {
      this.isWalking = true;
    }
    this.startSprinting();
  }

  /** Schedules the switch to a sprint 1.6 seconds from now. */
  startSprinting() {
    registerInterval(
      setTimeout(() => {
        if (!this.shouldStopMoving()) {
          this.sprint();
        }
      }, 1600),
    );
  }

  /** Starts both boss loops: movement at 60fps and animation at 10fps. */
  animateEndboss() {
    this.getEndbossMovementStatus();
    this.playEndbossAnimations();
  }

  /** Animation loop, picking a state ten times a second. */
  playEndbossAnimations() {
    registerInterval(
      setInterval(() => {
        if (this.paused) return;
        if (this.checkIfWorldExists()) return;
        this.getStatusBasedAnimation();
      }, 100),
    );
  }

  /**
   * Chooses which animation to show, death first and movement last.
   *
   * The boss's version of the enemy dispatch, kept separate because every
   * branch has to resize the sprite as well as advance the frame.
   */
  getStatusBasedAnimation() {
    if (this.dead) {
      this.playEndbossDeadAnimation();
    } else if (this.isHurt()) {
      this.playEndbossHurtAnimation();
    } else if (this.isAttacking) {
      this.getEndbossAttackState();
    } else {
      this.playEndbossMovementAnimation();
    }
  }

  /**
   * Picks between sprinting, walking and standing still.
   *
   * All three stop once the character is within reach, so the boss plants
   * itself to attack rather than walking into its target.
   */
  playEndbossMovementAnimation() {
    if (this.isRunning && !this.world.character.isEncounteringEndboss(this)) {
      this.playEndbossRunAnimation();
    } else if (this.isWalking && !this.isRunning) {
      this.playEndbossWalkAnimation();
    } else if (!this.world.character.isEncounteringEndboss(this) && !this.isWalking && !this.isRunning) {
      this.playEndbossIdleAnimation();
    }
  }

  /** Swings, unless the character is already reeling, in which case it holds. */
  getEndbossAttackState() {
    if (this.world.character.isHurt()) {
      this.freezeEndboss();
    } else {
      this.executeAttack();
    }
  }

  /** Plays one swing through to the end, then returns the boss to sprinting. */
  executeAttack() {
    this.hasDealtDamage = false;
    if (this.currentImage >= this.ENDBOSS_IMAGES_ATTACKING.length - 1) {
      this.resetEndbossStatus();
    } else {
      this.playEndbossAttackAnimation();
    }
  }

  /** Resizes to the death frames and hands off to the shared enemy death logic. */
  playEndbossDeadAnimation() {
    this.getDeadDimensions();
    this.updateXOffset(this.deadWidth);
    this.playEnemyDeadAnimation();
  }

  /** Resizes to the hurt frames, plays the cry and advances the animation. */
  playEndbossHurtAnimation() {
    this.getHurtDimensions();
    this.updateXOffset(this.hurtWidth);
    this.playEnemyBasedHurtSound();
    this.playAnimation(this.ENDBOSS_IMAGES_HURT);
  }

  /** Resizes to the attack frames, advances the swing and applies its damage. */
  playEndbossAttackAnimation() {
    this.getAttackDimensions();
    this.updateXOffset(this.attackWidth);
    this.playAnimation(this.ENDBOSS_IMAGES_ATTACKING);
    this.endbossDealsDamage();
  }

  /** Resizes to the much taller sprint frames and advances them. */
  playEndbossRunAnimation() {
    this.getRunDimensions();
    this.updateXOffset(this.runWidth);
    this.playAnimation(this.ENDBOSS_IMAGES_RUN);
  }

  /** Returns to the base walk size and advances the walk cycle. */
  playEndbossWalkAnimation() {
    this.getWalkDimensions();
    this.resetXOffset();
    this.playAnimation(this.ENDBOSS_IMAGES_WALKING);
  }

  /** Returns to the base walk size and advances the idle cycle. */
  playEndbossIdleAnimation() {
    this.getWalkDimensions();
    this.resetXOffset();
    this.playAnimation(this.ENDBOSS_IMAGES_IDLE);
  }

  /**
   * Holds a mid-swing pose while the character is recovering from a hit.
   *
   * Frame 2 is the raised-weapon frame, so the boss reads as poised to strike
   * rather than frozen mid-animation.
   */
  freezeEndboss() {
    this.getAttackDimensions();
    this.loadImage(this.ENDBOSS_IMAGES_ATTACKING[2]);
    this.isAttacking = false;
  }

  /** Ends the swing and drops the boss back into its sprint. */
  resetEndbossStatus() {
    this.isRunning = true;
    this.isAttacking = false;
    this.hasDealtDamage = false;
    this.resetCurrentImage();
  }

  /**
   * Movement loop: handles death, walks the boss and watches for the moment it
   * should wake up. Movement is skipped until activated is set.
   */
  getEndbossMovementStatus() {
    registerInterval(
      setInterval(() => {
        if (this.paused) return;
        if (this.checkIfWorldExists()) return;
        this.checkIfEnemyIsDead();
        if (!this.isAttacking && this.activated) {
          this.getEnemyDirection();
          this.startEndbossMovement();
        }
        this.checkEndbossToCharacterRelation();
      }, 1000 / 60),
    );
  }

  /** Moves the boss unless it is dead, reeling or already within reach. */
  startEndbossMovement() {
    if (!this.dead && !this.shouldStopMoving() && !this.world.character.isEncounteringEndboss(this)) {
      this.startMoving();
    }
  }

  /**
   * Wakes the boss the first time it comes into frame and swaps the music.
   *
   * The activated guard means this fires exactly once per game.
   */
  checkEndbossToCharacterRelation() {
    if (this.isInCharacterFrame() && !this.activated) {
      this.activated = true;
      startEndbossMusic();
    }
  }

  /** Switches the sprite box to the death frame size. */
  getDeadDimensions() {
    this.y = this.deadY;
    this.height = this.deadHeight;
    this.width = this.deadWidth;
  }

  /** Switches the sprite box to the hurt frame size. */
  getHurtDimensions() {
    this.y = this.hurtY;
    this.width = this.hurtWidth;
    this.height = this.hurtHeight;
  }

  /** Switches the sprite box to the attack frame size, the largest of them. */
  getAttackDimensions() {
    this.y = this.attackY;
    this.width = this.attackWidth;
    this.height = this.attackHeight;
  }

  /** Switches the sprite box to the sprint frame size, the tallest of them. */
  getRunDimensions() {
    this.y = this.runY;
    this.width = this.runWidth;
    this.height = this.runHeight;
  }

  /** Switches the sprite box back to the base walk size. */
  getWalkDimensions() {
    this.y = this.walkY;
    this.width = this.walkWidth;
    this.height = this.walkHeight;
  }

  /**
   * Lands 40 points of damage partway through the swing, double a troll's.
   *
   * Resets the frame counter afterwards, which the troll version does not, so
   * the boss recovers into its next action immediately.
   */
  endbossDealsDamage() {
    if (this.currentImage >= 7 && !this.hasDealtDamage && this.world.character.isEncounteringEndboss(this)) {
      this.world.character.addPendingDamage(this, 40);
      this.world.character.lastAttacker = this;
      this.hasDealtDamage = true;
      this.resetCurrentImage();
    }
  }
}
