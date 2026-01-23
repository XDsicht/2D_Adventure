class Endboss extends MovableObject {
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
  hurtY = 62;
  deadWidth = 360;
  deadHeight = 380;
  deadY = 152;
  otherDirection = true;
  activated = false;
  isAngry = false;
  isWalking = false;
  isRunning = false;
  baseX = 0;
  xOffset = 0;

  offset = {
    top: 160,
    left: 40,
    right: 20,
    bottom: 10,
  };

  IMAGES_IDLE = [
    "img/4.boss/1.idle/Idle_000.png",
    "img/4.boss/1.idle/Idle_001.png",
    "img/4.boss/1.idle/Idle_002.png",
    "img/4.boss/1.idle/Idle_003.png",
    "img/4.boss/1.idle/Idle_004.png",
    "img/4.boss/1.idle/Idle_005.png",
    "img/4.boss/1.idle/Idle_006.png",
    "img/4.boss/1.idle/Idle_007.png",
    "img/4.boss/1.idle/Idle_008.png",
    "img/4.boss/1.idle/Idle_009.png",
  ];

  IMAGES_WALKING = [
    "img/4.boss/2.walk/Walk_000.png",
    "img/4.boss/2.walk/Walk_001.png",
    "img/4.boss/2.walk/Walk_002.png",
    "img/4.boss/2.walk/Walk_003.png",
    "img/4.boss/2.walk/Walk_004.png",
    "img/4.boss/2.walk/Walk_005.png",
    "img/4.boss/2.walk/Walk_006.png",
    "img/4.boss/2.walk/Walk_007.png",
    "img/4.boss/2.walk/Walk_008.png",
    "img/4.boss/2.walk/Walk_009.png",
  ];

  IMAGES_RUN = [
    "img/4.boss/3.run/Run_000.png",
    "img/4.boss/3.run/Run_001.png",
    "img/4.boss/3.run/Run_002.png",
    "img/4.boss/3.run/Run_003.png",
    "img/4.boss/3.run/Run_004.png",
    "img/4.boss/3.run/Run_005.png",
    "img/4.boss/3.run/Run_006.png",
    "img/4.boss/3.run/Run_007.png",
    "img/4.boss/3.run/Run_008.png",
    "img/4.boss/3.run/Run_009.png",
  ];

  IMAGES_JUMP = [
    "img/4.boss/4.jump/Jump_000.png",
    "img/4.boss/4.jump/Jump_001.png",
    "img/4.boss/4.jump/Jump_002.png",
    "img/4.boss/4.jump/Jump_003.png",
    "img/4.boss/4.jump/Jump_004.png",
    "img/4.boss/4.jump/Jump_005.png",
    "img/4.boss/4.jump/Jump_006.png",
    "img/4.boss/4.jump/Jump_007.png",
    "img/4.boss/4.jump/Jump_008.png",
    "img/4.boss/4.jump/Jump_009.png",
  ];

  IMAGES_HURT = [
    "img/4.boss/6.hurt/Hurt_000.png",
    "img/4.boss/6.hurt/Hurt_001.png",
    "img/4.boss/6.hurt/Hurt_002.png",
    "img/4.boss/6.hurt/Hurt_003.png",
    "img/4.boss/6.hurt/Hurt_004.png",
    "img/4.boss/6.hurt/Hurt_005.png",
    "img/4.boss/6.hurt/Hurt_006.png",
    "img/4.boss/6.hurt/Hurt_007.png",
    "img/4.boss/6.hurt/Hurt_008.png",
    "img/4.boss/6.hurt/Hurt_009.png",
  ];

  IMAGES_DEAD = [
    "img/4.boss/7.dead/Dead_000.png",
    "img/4.boss/7.dead/Dead_001.png",
    "img/4.boss/7.dead/Dead_002.png",
    "img/4.boss/7.dead/Dead_003.png",
    "img/4.boss/7.dead/Dead_004.png",
    "img/4.boss/7.dead/Dead_005.png",
    "img/4.boss/7.dead/Dead_006.png",
    "img/4.boss/7.dead/Dead_007.png",
    "img/4.boss/7.dead/Dead_008.png",
    "img/4.boss/7.dead/Dead_009.png",
  ];

  IMAGES_ATTACKING = [
    // "img/4.boss/5.attack/Attack_000.png",
    "img/4.boss/5.attack/Attack_001.png",
    "img/4.boss/5.attack/Attack_002.png",
    "img/4.boss/5.attack/Attack_003.png",
    "img/4.boss/5.attack/Attack_004.png",
    "img/4.boss/5.attack/Attack_005.png",
    "img/4.boss/5.attack/Attack_006.png",
    "img/4.boss/5.attack/Attack_007.png",
    "img/4.boss/5.attack/Attack_008.png",
    "img/4.boss/5.attack/Attack_009.png",
  ];

  constructor() {
    super().loadImage(this.IMAGES_WALKING[0]);
    this.loadImages(this.IMAGES_IDLE);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_RUN);
    this.loadImages(this.IMAGES_JUMP);
    this.loadImages(this.IMAGES_ATTACKING);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.x = 2500;
    this.baseX = this.x;
    this.animate();
  }

  isInCharacterFrame() {
    if (!this.world || !this.world.character) return false;
    const characterViewEnd = this.world.character.x + 450;
    return characterViewEnd >= this.x;
  }

  sprint() {
    this.isRunning = true;
    this.isWalking = false;
    this.speed = 1.8;
  }

  updateXOffset(newWidth) {
    const widthDifference = newWidth - this.walkWidth;
    this.xOffset = widthDifference;
    this.x = this.baseX - this.xOffset;
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
    setTimeout(() => {
      this.sprint();
    }, 1600);
  }

  animate() {
    setInterval(() => {
      if (!this.world || this.world.character.dead || !this.world.character) {
        return;
      }
      if (this.isDead() && !this.dead) {
        this.resetCurrentImage();
        return (this.dead = true);
      }
      if (!this.isAttacking && this.activated && !this.world.character.isEncounteringEndboss(this)) {
        if (!this.dead && !this.shouldStopMoving()) {
          this.startMoving();
        }
      }
      if (this.isInCharacterFrame() && !this.activated) {
        this.activated = true;
      }
    }, 1000 / 60);

    setInterval(() => {
      if (!this.world || !this.world.character || this.world.character.dead) {
        return;
      } else if (this.world.character.isHurt() && this.isAttacking) {
        this.y = this.attackY;
        this.width = this.attackWidth;
        this.height = this.attackHeight;
        this.loadImage(this.IMAGES_ATTACKING[2]);
        this.isAttacking = false;
        this.hasDealtDamage = false;
        this.attackAnimationStarted = false;
        this.resetCurrentImage();
      } else if (this.isAttacking && !this.dead) {
        this.isRunning = false;
        this.y = this.attackY;
        this.width = this.attackWidth;
        this.height = this.attackHeight;
        this.updateXOffset(this.attackWidth);
        if (this.currentImage >= this.IMAGES_ATTACKING.length - 1) {
          this.isRunning = true;
          this.isAttacking = false;
          this.hasDealtDamage = false;
          this.attackAnimationStarted = false;
        } else {
          this.playAnimation(this.IMAGES_ATTACKING);
          if (this.currentImage >= 7 && !this.hasDealtDamage && this.world.character.isEncounteringEndboss(this)) {
            this.world.character.addPendingDamage(this, 40);
            this.world.character.lastAttacker = this;
            this.hasDealtDamage = true;
            this.resetCurrentImage();
          }
        }
      } else if (this.dead) {
        this.y = this.deadY;
        this.height = this.deadHeight;
        this.width = this.deadWidth;
        this.updateXOffset(this.hurtWidth);
        if (this.currentImage < this.IMAGES_DEAD.length - 1) {
          this.playAnimation(this.IMAGES_DEAD);
        } else {
          this.loadImage(this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1]);
          setTimeout(() => {
            return (this.delete = true);
          }, 800);
        }
      } else if (this.isHurt()) {
        this.y = this.hurtY;
        this.width = this.hurtWidth;
        this.height = this.hurtHeight;
        this.updateXOffset(this.hurtWidth);
        this.playAnimation(this.IMAGES_HURT);
      } else if (this.isRunning && !this.world.character.isEncounteringEndboss(this)) {
        this.y = this.runY;
        this.width = this.runWidth;
        this.height = this.runHeight;
        this.updateXOffset(this.runWidth);
        this.playAnimation(this.IMAGES_RUN);
      } else if (this.isWalking) {
        this.y = this.walkY;
        this.width = this.walkWidth;
        this.height = this.walkHeight;
        this.resetXOffset();
        this.playAnimation(this.IMAGES_WALKING);
      } else if (!this.world.character.isEncounteringEndboss(this) && !this.isWalking && !this.isRunning) {
        this.y = this.walkY;
        this.width = this.walkWidth;
        this.height = this.walkHeight;
        this.resetXOffset();
        this.playAnimation(this.IMAGES_IDLE);
      }
      console.log("Walking:", this.isWalking, "Running:", this.isRunning, "Attacking:", this.isAttacking);
    }, 100);
  }
}
