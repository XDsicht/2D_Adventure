class Endboss extends Enemy {
  height = 360;
  width = 340;
  y = 102;
  speed = 0.9;
  energy = 20;
  walkWidth = 340;
  walkHeight = 360;
  walkY = 102;
  runWidth = 365;
  runHeight = 550;
  runY = -110;
  jumpWidth = 490;
  jumpHeight = 540;
  jumpY = -55;
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
  activated = false;
  isAngry = false;
  baseX = 0;
  xOffset = 0;

  offset = {
    top: 160,
    left: 40,
    right: 20,
    bottom: 10,
  };

  offsetRun = {
    top: 160,
    left: 50,
    right: 30,
    bottom: 10,
  };

  offsetAttack = {
    top: 180,
    left: 80,
    right: 50,
    bottom: 10,
  };

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
  }

  getCurrentOffset() {
    if (this.isAttacking) return this.offsetAttack;
    if (this.isRunning) return this.offsetRun;
    return this.offset;
  }

  isInCharacterFrame() {
    if (!this.world || !this.world.character) return false;
    const characterViewEnd = this.world.character.x + 450;
    return characterViewEnd >= this.x;
  }

  sprint() {
    this.isRunning = true;
    this.isWalking = false;
    this.speed = 3.0;
  }

  updateXOffset(newWidth) {
    const widthDifference = newWidth - this.walkWidth;
    this.xOffset = widthDifference;
    if (this.otherDirection) {
      this.updateXInOtherDirection(newWidth);
    } else {
      this.updateXInDirection(newWidth);
    }
  }

  updateXInOtherDirection(newWidth) {
    if (newWidth == this.attackWidth) {
      this.x = this.baseX - this.xOffset / 2;
    } else {
      this.x = this.baseX - this.xOffset;
    }
  }

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

  resetXOffset() {
    this.xOffset = 0;
    this.x = this.baseX;
  }

  startMoving() {
    this.move();
    this.baseX = this.x + this.xOffset;
    if (!this.isRunning) {
      this.isWalking = true;
    }
    this.startSprinting();
  }

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
        if (this.checkIfWorldExists()) return;
        this.getStatusBasedAnimation();
      }, 100),
    );
  }

  getStatusBasedAnimation() {
    if (this.dead) {
      this.playEndbossDeadAnimation();
    } else if (this.isHurt()) {
      this.playEndbossHurtAnimation();
    } else if (this.isAttacking) {
      this.getEndbossAttackState();
    } else if (this.isRunning && !this.world.character.isEncounteringEndboss(this)) {
      this.playEndbossRunAnimation();
    } else if (this.isWalking && !this.isRunning) {
      this.playEndbossWalkAnimation();
    } else if (!this.world.character.isEncounteringEndboss(this) && !this.isWalking && !this.isRunning) {
      this.playEndbossIdleAnimation();
    }
  }

  getEndbossAttackState() {
    if (this.world.character.isHurt()) {
      this.freezeEndboss();
    } else {
      this.executeAttack();
    }
  }

  executeAttack() {
    this.hasDealtDamage = false;
    if (this.currentImage >= this.ENDBOSS_IMAGES_ATTACKING.length - 1) {
      this.resetEndbossStatus();
    } else {
      this.playEndbossAttackAnimation();
    }
  }

  playEndbossDeadAnimation() {
    this.getDeadDimensions();
    this.updateXOffset(this.deadWidth);
    this.playEnemyDeadAnimation();
  }

  playEndbossHurtAnimation() {
    this.getHurtDimensions();
    this.updateXOffset(this.hurtWidth);
    this.playAnimation(this.ENDBOSS_IMAGES_HURT);
  }

  playEndbossAttackAnimation() {
    this.getAttackDimensions();
    this.updateXOffset(this.attackWidth);
    this.playAnimation(this.ENDBOSS_IMAGES_ATTACKING);
    this.endbossDealsDamage();
  }

  playEndbossRunAnimation() {
    this.getRunDimensions();
    this.updateXOffset(this.runWidth);
    this.playAnimation(this.ENDBOSS_IMAGES_RUN);
  }

  playEndbossWalkAnimation() {
    this.getWalkDimensions();
    this.resetXOffset();
    this.playAnimation(this.ENDBOSS_IMAGES_WALKING);
  }

  playEndbossIdleAnimation() {
    this.getWalkDimensions();
    this.resetXOffset();
    this.playAnimation(this.ENDBOSS_IMAGES_IDLE);
  }

  freezeEndboss() {
    this.getAttackDimensions();
    this.loadImage(this.ENDBOSS_IMAGES_ATTACKING[2]);
    this.isAttacking = false;
  }

  resetEndbossStatus() {
    this.isRunning = true;
    this.isAttacking = false;
    this.hasDealtDamage = false;
    this.resetCurrentImage();
  }

  getEndbossMovementStatus() {
    registerInterval(
      setInterval(() => {
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

  startEndbossMovement() {
    if (!this.dead && !this.shouldStopMoving() && !this.world.character.isEncounteringEndboss(this)) {
      this.startMoving();
    }
  }

  checkEndbossToCharacterRelation() {
    if (this.isInCharacterFrame() && !this.activated) {
      this.activated = true;
    }
  }

  getDeadDimensions() {
    this.y = this.deadY;
    this.height = this.deadHeight;
    this.width = this.deadWidth;
  }

  getHurtDimensions() {
    this.y = this.hurtY;
    this.width = this.hurtWidth;
    this.height = this.hurtHeight;
  }

  getAttackDimensions() {
    this.y = this.attackY;
    this.width = this.attackWidth;
    this.height = this.attackHeight;
  }

  getRunDimensions() {
    this.y = this.runY;
    this.width = this.runWidth;
    this.height = this.runHeight;
  }

  getWalkDimensions() {
    this.y = this.walkY;
    this.width = this.walkWidth;
    this.height = this.walkHeight;
  }

  endbossDealsDamage() {
    if (this.currentImage >= 7 && !this.hasDealtDamage && this.world.character.isEncounteringEndboss(this)) {
      this.world.character.addPendingDamage(this, 40);
      this.world.character.lastAttacker = this;
      this.hasDealtDamage = true;
      this.resetCurrentImage();
    }
  }
}
