class Troll extends MovableObject {
  height = 240;
  width = 240;
  y = 226;
  otherDirection = true;
  energy = 10;
  delete = false;

  offset = {
    top: 85,
    left: 90,
    right: 60,
    bottom: 35,
  };

  IMAGES_IDLE = [
    "img/3.enemy/1.idle/Troll_03_1_IDLE_000.png",
    "img/3.enemy/1.idle/Troll_03_1_IDLE_001.png",
    "img/3.enemy/1.idle/Troll_03_1_IDLE_002.png",
    "img/3.enemy/1.idle/Troll_03_1_IDLE_003.png",
    "img/3.enemy/1.idle/Troll_03_1_IDLE_004.png",
    "img/3.enemy/1.idle/Troll_03_1_IDLE_005.png",
    "img/3.enemy/1.idle/Troll_03_1_IDLE_006.png",
    "img/3.enemy/1.idle/Troll_03_1_IDLE_007.png",
    "img/3.enemy/1.idle/Troll_03_1_IDLE_008.png",
    "img/3.enemy/1.idle/Troll_03_1_IDLE_009.png",
  ];

  IMAGES_WALKING = [
    "img/3.enemy/2.walk/Troll_03_1_WALK_000.png",
    "img/3.enemy/2.walk/Troll_03_1_WALK_001.png",
    "img/3.enemy/2.walk/Troll_03_1_WALK_002.png",
    "img/3.enemy/2.walk/Troll_03_1_WALK_003.png",
    "img/3.enemy/2.walk/Troll_03_1_WALK_004.png",
    "img/3.enemy/2.walk/Troll_03_1_WALK_005.png",
    "img/3.enemy/2.walk/Troll_03_1_WALK_006.png",
    "img/3.enemy/2.walk/Troll_03_1_WALK_007.png",
    "img/3.enemy/2.walk/Troll_03_1_WALK_008.png",
    "img/3.enemy/2.walk/Troll_03_1_WALK_009.png",
  ];

  IMAGES_HURT = [
    "img/3.enemy/6.hurt/Troll_03_1_HURT_000.png",
    "img/3.enemy/6.hurt/Troll_03_1_HURT_001.png",
    "img/3.enemy/6.hurt/Troll_03_1_HURT_002.png",
    "img/3.enemy/6.hurt/Troll_03_1_HURT_003.png",
    "img/3.enemy/6.hurt/Troll_03_1_HURT_004.png",
    "img/3.enemy/6.hurt/Troll_03_1_HURT_005.png",
    "img/3.enemy/6.hurt/Troll_03_1_HURT_006.png",
    "img/3.enemy/6.hurt/Troll_03_1_HURT_007.png",
    "img/3.enemy/6.hurt/Troll_03_1_HURT_008.png",
    "img/3.enemy/6.hurt/Troll_03_1_HURT_009.png",
  ];

  IMAGES_DEAD = [
    "img/3.enemy/7.dead/Troll_03_1_DIE_000.png",
    "img/3.enemy/7.dead/Troll_03_1_DIE_001.png",
    "img/3.enemy/7.dead/Troll_03_1_DIE_002.png",
    "img/3.enemy/7.dead/Troll_03_1_DIE_003.png",
    "img/3.enemy/7.dead/Troll_03_1_DIE_004.png",
    "img/3.enemy/7.dead/Troll_03_1_DIE_005.png",
    "img/3.enemy/7.dead/Troll_03_1_DIE_006.png",
    "img/3.enemy/7.dead/Troll_03_1_DIE_007.png",
    "img/3.enemy/7.dead/Troll_03_1_DIE_008.png",
    "img/3.enemy/7.dead/Troll_03_1_DIE_009.png",
  ];

  IMAGES_ATTACKING = [
    "img/3.enemy/5.attack/Troll_03_1_ATTACK_000.png",
    "img/3.enemy/5.attack/Troll_03_1_ATTACK_001.png",
    "img/3.enemy/5.attack/Troll_03_1_ATTACK_002.png",
    "img/3.enemy/5.attack/Troll_03_1_ATTACK_003.png",
    "img/3.enemy/5.attack/Troll_03_1_ATTACK_004.png",
    "img/3.enemy/5.attack/Troll_03_1_ATTACK_005.png",
    "img/3.enemy/5.attack/Troll_03_1_ATTACK_006.png",
    "img/3.enemy/5.attack/Troll_03_1_ATTACK_007.png",
    "img/3.enemy/5.attack/Troll_03_1_ATTACK_008.png",
    "img/3.enemy/5.attack/Troll_03_1_ATTACK_009.png",
  ];

  constructor() {
    super().loadImage("img/3.enemy/1.idle/Troll_03_1_IDLE_000.png");
    this.loadImages(this.IMAGES_IDLE);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_ATTACKING);
    this.moveLeft();
    // this.x = this.calculateSpawningLocation();
    this.speed = 0.15 + Math.random() * 0.25;
    this.animate();
  }

  calculateSpawningLocation() {
    this.spawningLocation = this.world.initialObstacleSpawn + Math.random() * 500;
    return (this.world.initialObstacleSpawn = this.spawningLocation);
  }

  isCharacterBehind() {
    if (!this.world || !this.world.character) return false;
    if (this.otherDirection) {
      return this.world.character.x > this.x;
    } else {
      return this.world.character.x < this.x;
    }
  }

  animate() {
    setInterval(() => {
      if (!this.world || this.world.character.dead || !this.world.character) {
        return;
      } else if (this.isDead() && !this.dead) {
        this.resetCurrentImage();
        return (this.dead = true);
      }
      if (!this.dead && !this.isAttacking && !this.shouldStopMoving()) {
        if (this.isCharacterBehind()) {
          this.otherDirection = !this.otherDirection;
        }
        this.move();
      }
    }, 1000 / 60);

    setInterval(() => {
      if (!this.world || this.world.character.dead || !this.world.character) {
        return;
      } else if (this.world.character.isHurt() && this.isAttacking) {
        this.playAnimation(this.IMAGES_IDLE);
      } else if (this.isAttacking && !this.world.character.isHurt()) {
        if (this.currentImage >= this.IMAGES_ATTACKING.length - 1) {
          this.isAttacking = false;
          this.hasDealtDamage = false;
          this.resetCurrentImage();
        } else {
          this.playAnimation(this.IMAGES_ATTACKING);
          if (this.currentImage >= 7 && !this.hasDealtDamage && this.world.character.isColliding(this)) {
            this.world.character.addPendingDamage(this, 20);
            this.world.character.lastAttacker = this;
            this.hasDealtDamage = true;
          }
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
      } else {
        this.playAnimation(this.IMAGES_WALKING);
      }
    }, 100);
  }
}
