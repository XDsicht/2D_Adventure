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
  otherDirection = true;
  activated = false;
  isAngry = false;
  isRunning = false;
  isTransitioning = false;
  attackAnimationStarted = false;
  showTransitionImage = false;

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
    "img/4.boss/5.attack/Attack_000.png",
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
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_RUN);
    this.loadImages(this.IMAGES_JUMP);
    this.loadImages(this.IMAGES_ATTACKING);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.x = 2500;
    this.animate();
  }

  isInCharacterFrame() {
    if (!this.world || !this.world.character) return false;
    const characterViewEnd = this.world.character.x + 720;
    return characterViewEnd >= this.x;
  }

  isHalfWayToCharacter() {
    if (!this.world || !this.world.character) return false;
    if (!this.initialDistance) {
      this.initialDistance = this.x - this.world.character.x;
    }
    const currentDistance = this.x - this.world.character.x;
    const halfwayPoint = this.initialDistance / 2;
    if (currentDistance <= halfwayPoint && !this.isRunning) {
      this.isRunning = true;
      this.isAngry = true;
      return true;
    }
    return false;
  }

  sprint() {
    if (!this.isRunning) {
      this.speed = 1.8;
      this.isRunning = true;
    }
  }

  startAttackTransition() {
    if (!this.isTransitioning && !this.isAttacking) {
      this.isTransitioning = true;
      this.showTransitionImage = true;
      setTimeout(() => {
        if (this.isTransitioning) {
          this.isAttacking = true;
          this.showTransitionImage = false;
        }
      }, 150);
    }
  }

  animate() {
    setInterval(() => {
      if (this.isDead() && !this.dead) {
        this.resetCurrentImage();
        return (this.dead = true);
      }
      if (this.isInCharacterFrame() && !this.activated) {
        this.activated = true;
      }
      if (this.activated) {
        this.move();
      }
      if (this.isHalfWayToCharacter()) {
        this.sprint();
      }
    }, 1000 / 60);

    setInterval(() => {
      if (this.isAttacking) {
        if (!this.attackAnimationStarted) {
          this.attackAnimationStarted = true;
        }
        if (this.attackAnimationStarted) {
          this.y = this.attackY;
          this.width = this.attackWidth;
          this.height = this.attackHeight;
        }
        if (this.currentImage < this.IMAGES_ATTACKING.length - 1) {
          this.playAnimation(this.IMAGES_ATTACKING);
        } else {
          this.isAttacking = false;
          this.attackAnimationStarted = false;
          this.isTransitioning = false;
          this.showTransitionImage = false;
          this.resetCurrentImage();
        }
      } else if (this.dead) {
        this.y = 228;
        if (this.currentImage < this.IMAGES_DEAD.length - 1) {
          this.playAnimation(this.IMAGES_DEAD);
        } else {
          this.loadImage(this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1]);
          setTimeout(() => {
            return (this.delete = true);
          }, 800);
        }
      } else if (this.isHurt()) {
        this.playAnimation(this.IMAGES_HURT);
      } else if (this.showTransitionImage) {
        this.y = this.jumpY;
        this.width = this.jumpWidth;
        this.height = this.jumpHeight;
        if (this.currentImage === 0) {
          debugger;
        }
        this.playAnimation(this.IMAGES_JUMP);
      } else if (this.isTransitioning || this.isRunning) {
        this.y = this.runY;
        this.width = this.runWidth;
        this.height = this.runHeight;
        this.playAnimation(this.IMAGES_RUN);
      } else {
        this.y = this.walkY;
        this.width = this.walkWidth;
        this.height = this.walkHeight;
        this.playAnimation(this.IMAGES_WALKING);
      }
    }, 100);
  }
}
