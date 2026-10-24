/**
 * Canvas y the boss's feet stand on.
 */
const ENDBOSS_GROUND_Y = 432;

/**
 * The troll chieftain guarding the end of the level.
 */
class Endboss extends Enemy {
  
  height = 360;
  width = 340;

  speed = 0.9;

  /**
   * Health, four arrows' worth, double a troll's.
   */
  energy = 20;

  /**
   * Size of each state's frames, and the fraction of that height at which the feet sit. The frames differ in both, so every state carries its own row.
   */
  stateGeometry = {
    idle: { width: 340, height: 360, foot: 0.9848 },
    walk: { width: 340, height: 360, foot: 0.9163 },
    run: { width: 365, height: 550, foot: 0.9793 },
    attack: { width: 455, height: 640, foot: 0.9222 },
    hurt: { width: 360, height: 380, foot: 0.9645 },
    dead: { width: 360, height: 380, foot: 0.7484 },
  };

  /**
   * Walk frame width, read by updateXOffset() and by World's camera.
   */
  walkWidth = 340;

  /**
   * Attack frame width, the one size updateXOffset() only shifts half of.
   */
  attackWidth = 455;

  otherDirection = true;

  /**
   * The shot cooldown it imposes on the character once the fight begins, in seconds.
   */
  imposedShotCooldown = 0.8;

  /**
   * False until the character gets close enough; gates movement and the music swap.
   */
  activated = false;

  /**
   * Where the boss actually stands, independent of the current frame's width.
   */
  baseX = 0;

  /**
   * How far x has been shifted to compensate for the current frame's width.
   */
  xOffset = 0;

  /**
   * Collision box per state. The sprint box is inset much further because the boss leans into its run, putting its legs well behind its head; the attack box sits lower and reaches wider.
   */
  offset = { top: 160, left: 80, right: 60, bottom: 10 };
  offsetRun = { top: 160, left: 150, right: 70, bottom: 10 };
  offsetAttack = { top: 180, left: 80, right: 50, bottom: 10 };

  /**
   * Its own cries, used in place of the inherited troll ones.
   */
  endbossSounds = bossSounds;

  constructor() {
    super().loadImage(endbossImages.walking[0]);
    this.loadEndbossImages();
    this.x = 2500;
    this.baseX = this.x;
    this.y = this.getStateY("idle");
    this.deadY = this.getStateY("dead");
    this.animateEndboss();
    this.registerEndbossSounds();
  }

  /**
   * Preloads the six animations the boss actually plays.
   */
  loadEndbossImages() {
    Object.values(endbossImages).forEach((set) => this.loadImages(set));
  }

  /**
   * Adds the boss's own set to the shared list for muting and volume.
   */
  registerEndbossSounds() {
    this.registerEnemySounds();
    registerGameSound(this.endbossSounds.isAttackingSound);
    registerGameSound(this.endbossSounds.isWalkingSound);
    registerGameSound(this.endbossSounds.isRunningSound);
    registerGameSound(this.endbossSounds.isHurtSound);
    registerGameSound(this.endbossSounds.isDeadSound);
  }

  /**
   * Picks the collision box for the current state.
   *
   * @returns {{top: number, left: number, right: number, bottom: number}} The offset in effect.
   */
  getCurrentOffset() {
    if (this.isAttacking) return this.offsetAttack;
    if (this.isRunning) return this.offsetRun;
    return this.offset;
  }

  /**
   * No separate projectile hit box: the boss resizes between states and already carries an offset for each.
   */
  offsetHit = null;

  /**
   * How far inside baseX the swing connects.
   */
  swingInset = 26;

  /**
   * The edges within which the swing connects.
   *
   * @returns {{left: number, right: number}} - The outer edges of the swing.
   */
  getReachEdges() {
    return { left: this.baseX + this.swingInset, right: this.baseX + this.walkWidth - this.swingInset };
  }

  /**
   * Turns the boss around, measuring from baseX rather than from x.
   */
  getEnemyDirection() {
    if (this.isCharacterBehind(this.baseX)) {
      this.otherDirection = !this.otherDirection;
    }
  }

  /**
   * Reports whether the boss has come far enough into view to wake up.
   *
   * @returns {boolean} - True once the boss is within the visible frame.
   */
  isInCharacterFrame() {
    if (!this.world || !this.world.character) return false;
    const characterViewEnd = this.world.character.x + this.world.canvas.width - this.world.cameraOffset - this.walkWidth / 2;
    return characterViewEnd >= this.x;
  }

  /**
   * Takes the hit and cries out.
   */
  hit() {
    super.hit();
    this.playOwnSound(this.endbossSounds.isHurtSound);
  }

  /**
   * Switches from walking to the sprint, more than tripling its speed.
   */
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
    this.xOffset = newWidth - this.walkWidth;
    if (this.otherDirection || newWidth == this.attackWidth) {
      this.x = this.baseX - this.getAppliedXShift();
    }
  }



  /**
   * Drops any compensation, used by states drawn at the base walk size.
   */
  resetXOffset() {
    this.xOffset = 0;
    this.x = this.baseX;
  }

  /**
   * The shift updateXOffset actually applied to x. 
   *
   * @returns {number} - The shift currently applied to x.
   */
  getAppliedXShift() {
    if (this.width == this.attackWidth) {
      return this.xOffset / 2;
    }
    return this.xOffset;
  }

  /**
   * Advances the boss one step and re-anchors baseX to where it now stands.
   */
  startMoving() {
    this.move();
    this.baseX = this.x + this.getAppliedXShift();
    if (!this.isRunning) {
      this.isWalking = true;
    }
    this.startSprinting();
  }

  /**
   * Schedules the switch to a sprint 1.6 seconds from now.
   */
  startSprinting() {
    registerInterval(
      setTimeout(() => {
        if (!this.shouldStopMoving()) {
          this.sprint();
        }
      }, 1600),
    );
  }

  animateEndboss() {
    this.getEndbossMovementStatus();
    this.playEndbossAnimations();
  }

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
   */
  getStatusBasedAnimation() {
    if (this.dead) {
      this.playEndbossDeadAnimation();
    } else if (this.isAttacking) {
      this.getEndbossAttackState();
    } else if (this.isHurt()) {
      this.playEndbossHurtAnimation();
    } else {
      this.playEndbossMovementAnimation();
    }
  }

  /**
   * Picks between sprinting, walking and standing still.
   */
  playEndbossMovementAnimation() {
    if (this.shouldStopMoving()) return;
    if (this.isRunning && !this.world.character.isEncounteringEndboss(this)) {
      this.playEndbossRunAnimation();
    } else if (this.isWalking && !this.isRunning) {
      this.playEndbossWalkAnimation();
    } else if (!this.world.character.isEncounteringEndboss(this) && !this.isWalking && !this.isRunning) {
      this.playEndbossIdleAnimation();
    }
  }

  /**
   * Swings, unless the character is already reeling, in which case it holds.
   */
  getEndbossAttackState() {
    if (this.world.character.isHurt()) {
      this.freezeEndboss();
    } else {
      this.executeAttack();
    }
  }

  /**
   * Plays one swing through to the end, then returns the boss to sprinting.
   */
  executeAttack() {
    this.hasDealtDamage = false;
    if (this.currentImage >= endbossImages.attacking.length - 1) {
      this.resetEndbossStatus();
    } else {
      this.playEndbossAttackAnimation();
    }
  }

  /**
   * The following methods resize the sprite box to the size of the current state, play the appropriate sound and advance the animation.
   */
  playEndbossDeadAnimation() {
    this.applyStateGeometry("dead");
    this.updateXOffset(this.width);
    this.playEnemyDeadAnimation();
  }

  playEndbossHurtAnimation() {
    this.applyStateGeometry("hurt");
    this.updateXOffset(this.width);
    this.playEnemyBasedHurtSound();
    this.playAnimation(endbossImages.hurt);
  }

  playEndbossAttackAnimation() {
    this.applyStateGeometry("attack");
    this.updateXOffset(this.attackWidth);
    this.playAnimation(endbossImages.attacking);
    this.endbossDealsDamage();
  }

  playEndbossRunAnimation() {
    this.applyStateGeometry("run");
    this.updateXOffset(this.width);
    this.playAnimation(endbossImages.run);
  }

  playEndbossWalkAnimation() {
    this.applyStateGeometry("walk");
    this.resetXOffset();
    this.playAnimation(endbossImages.walking);
  }

  playEndbossIdleAnimation() {
    this.applyStateGeometry("idle");
    this.resetXOffset();
    this.playAnimation(endbossImages.idle);
  }

  /**
   * Holds a mid-swing pose while the character is recovering from a hit.
   */
  freezeEndboss() {
    this.applyStateGeometry("attack");
    this.loadImage(endbossImages.attacking[2]);
    this.isAttacking = false;
  }

  /**
   * Ends the swing and drops the boss back into its sprint.
   */
  resetEndbossStatus() {
    this.isRunning = true;
    this.isAttacking = false;
    this.hasDealtDamage = false;
    this.resetCurrentImage();
  }

  /**
   * Movement loop: handles death, walks the boss and watches for the moment it should wake up. Movement is skipped until activated is set.
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

  /**
   * Moves the boss unless it is dead, reeling or already within reach.
   */
  startEndbossMovement() {
    if (!this.dead && !this.shouldStopMoving() && !this.world.character.isEncounteringEndboss(this)) {
      this.startMoving();
    }
  }

  /**
   * Wakes the boss the first time it comes into frame, swaps the music and brings in its health bar.
   */
  checkEndbossToCharacterRelation() {
    if (this.isInCharacterFrame() && !this.activated) {
      this.activated = true;
      startEndbossMusic();
      this.world.endbossHealthBar.show();
      this.world.character.shotCooldown = this.imposedShotCooldown;
    }
  }

  /**
   * Works out where a state's frames have to be drawn for its feet to land on the ground line.
   *
   * @param {string} state - Key into stateGeometry.
   * @param {number} height - Drawn height of that state's frames.
   * @returns {number} - The y to draw them at.
   */
  getStateY(state) {
    let geometry = this.stateGeometry[state];
    return ENDBOSS_GROUND_Y - geometry.height * geometry.foot;
  }

  /**
   * Sizes the sprite box for one state and sits its feet on the ground line.
   *
   * @param {string} state - Key into stateGeometry.
   */
  applyStateGeometry(state) {
    this.width = this.stateGeometry[state].width;
    this.height = this.stateGeometry[state].height;
    this.y = this.getStateY(state);
  }

  /**
   * Lands 40 points of damage partway through the swing, double a troll's.
   */
  endbossDealsDamage() {
    if (this.currentImage >= 7 && !this.hasDealtDamage && !this.world.character.isHurt() && this.world.character.isWithinStrikeZone(this)) {
      this.world.character.addPendingDamage(this, 40);
      this.world.character.lastAttacker = this;
      this.hasDealtDamage = true;
      this.resetCurrentImage();
    }
  }
}
