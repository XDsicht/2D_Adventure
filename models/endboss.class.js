class Endboss extends MovableObject {
  height = 360;
  width = 340;
  y = 102;
  otherDirection = true;
  activated = false;
  speed = 0.9;
  walkWidth = 340;
  walkHeight = 360;
  walkY = 102;
  runWidth = 365;
  runHeight = 550;
  runY = -110;
  attackWidth = 465;
  attackHeight = 640;
  attackY = -158;
  isAngry = false;
  isRunning = false;

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

  animate() {
    setInterval(() => {
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
        this.y = this.attackY;
        this.width = this.attackWidth;
        this.height = this.attackHeight;
        if (this.currentImage < this.IMAGES_ATTACKING.length - 1) {
          this.playAnimation(this.IMAGES_ATTACKING);
        } else {
          this.isAttacking = false;
          this.resetCurrentImage();
        }
      } else if (this.isRunning) {
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
