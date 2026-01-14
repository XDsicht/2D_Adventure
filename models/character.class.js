class Character extends MovableObject {
  height = 200;
  width = 250;
  speed = 10;
  y = 250;
  x = 120;

  releaseArrow = false;
  shootingTime = 0;
  checkAlreadyRunning = false;
  characterJumping = false;

  offset = {
    top: 35,
    left: 100,
    right: 78,
    bottom: 20,
  };

  IMAGES_IDLE = [
    "img/2.character/1.idle/Warrior_03__IDLE_000.png",
    "img/2.character/1.idle/Warrior_03__IDLE_001.png",
    "img/2.character/1.idle/Warrior_03__IDLE_002.png",
    "img/2.character/1.idle/Warrior_03__IDLE_003.png",
    "img/2.character/1.idle/Warrior_03__IDLE_004.png",
    "img/2.character/1.idle/Warrior_03__IDLE_005.png",
    "img/2.character/1.idle/Warrior_03__IDLE_006.png",
    "img/2.character/1.idle/Warrior_03__IDLE_007.png",
    "img/2.character/1.idle/Warrior_03__IDLE_008.png",
    "img/2.character/1.idle/Warrior_03__IDLE_009.png",
  ];

  IMAGES_WALKING = [
    "img/2.character/2.walk/Warrior_03__WALK_000.png",
    "img/2.character/2.walk/Warrior_03__WALK_001.png",
    "img/2.character/2.walk/Warrior_03__WALK_002.png",
    "img/2.character/2.walk/Warrior_03__WALK_003.png",
    "img/2.character/2.walk/Warrior_03__WALK_004.png",
    "img/2.character/2.walk/Warrior_03__WALK_005.png",
    "img/2.character/2.walk/Warrior_03__WALK_006.png",
    "img/2.character/2.walk/Warrior_03__WALK_007.png",
    "img/2.character/2.walk/Warrior_03__WALK_008.png",
    "img/2.character/2.walk/Warrior_03__WALK_009.png",
  ];

  IMAGES_JUMPING = [
    "img/2.character/4.jump/Warrior_03__JUMP_000.png",
    "img/2.character/4.jump/Warrior_03__JUMP_001.png",
    "img/2.character/4.jump/Warrior_03__JUMP_002.png",
    "img/2.character/4.jump/Warrior_03__JUMP_003.png",
    "img/2.character/4.jump/Warrior_03__JUMP_004.png",
    "img/2.character/4.jump/Warrior_03__JUMP_005.png",
    "img/2.character/4.jump/Warrior_03__JUMP_006.png",
    "img/2.character/4.jump/Warrior_03__JUMP_007.png",
    "img/2.character/4.jump/Warrior_03__JUMP_008.png",
    "img/2.character/4.jump/Warrior_03__JUMP_009.png",
  ];

  IMAGES_HURT = [
    "img/2.character/6.hurt/Warrior_03__HURT_000.png",
    "img/2.character/6.hurt/Warrior_03__HURT_001.png",
    "img/2.character/6.hurt/Warrior_03__HURT_002.png",
    "img/2.character/6.hurt/Warrior_03__HURT_003.png",
    "img/2.character/6.hurt/Warrior_03__HURT_004.png",
    "img/2.character/6.hurt/Warrior_03__HURT_005.png",
    "img/2.character/6.hurt/Warrior_03__HURT_006.png",
    "img/2.character/6.hurt/Warrior_03__HURT_007.png",
    "img/2.character/6.hurt/Warrior_03__HURT_008.png",
    "img/2.character/6.hurt/Warrior_03__HURT_009.png",
  ];

  IMAGES_DEAD = [
    "img/2.character/7.dead/Warrior_03__DIE_000.png",
    "img/2.character/7.dead/Warrior_03__DIE_001.png",
    "img/2.character/7.dead/Warrior_03__DIE_002.png",
    "img/2.character/7.dead/Warrior_03__DIE_003.png",
    "img/2.character/7.dead/Warrior_03__DIE_004.png",
    "img/2.character/7.dead/Warrior_03__DIE_005.png",
    "img/2.character/7.dead/Warrior_03__DIE_006.png",
    "img/2.character/7.dead/Warrior_03__DIE_007.png",
    "img/2.character/7.dead/Warrior_03__DIE_008.png",
    "img/2.character/7.dead/Warrior_03__DIE_009.png",
  ];

  IMAGES_ATTACKING = [
    "img/2.character/5.attack/Warrior_03__ATTACK_000.png",
    "img/2.character/5.attack/Warrior_03__ATTACK_001.png",
    "img/2.character/5.attack/Warrior_03__ATTACK_002.png",
    "img/2.character/5.attack/Warrior_03__ATTACK_003.png",
    "img/2.character/5.attack/Warrior_03__ATTACK_004.png",
    "img/2.character/5.attack/Warrior_03__ATTACK_005.png",
    "img/2.character/5.attack/Warrior_03__ATTACK_006.png",
    "img/2.character/5.attack/Warrior_03__ATTACK_007.png",
    "img/2.character/5.attack/Warrior_03__ATTACK_008.png",
    "img/2.character/5.attack/Warrior_03__ATTACK_009.png",
  ];

  world; // variable, die es ermöglicht, dass wir über den Character auf die Welt zugreifen können

  constructor() {
    super().loadImage("img/2.character/1.idle/Warrior_03__IDLE_000.png");
    // super().loadImage('img/2.character/5.attack/Warrior_03__ATTACK_009.png');
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_ATTACKING);
    this.loadImages(this.IMAGES_IDLE);
    this.animate();
    this.applyGravity();
  }

  animate() {
    this.characterMovementAnimationIntervals();
    this.characterActionsIntervals();
    this.characterAttackAnimationIntervals();
  }

  characterActionsIntervals() {
    if (!this.dead || !this.isHurt()) {
      let actions = setInterval(() => {
        if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
          this.moveRight();
          this.otherDirection = false;
          // this.walking_sound.play();
        }
        if (this.world.keyboard.LEFT && this.x > 0) {
          this.moveLeft();
          this.otherDirection = true;
          // this.walking_sound.play();
        }
        this.world.camera_x = -this.x + 50; // Kamera folgt dem Character

        if (this.world.keyboard.SPACE && !this.isAboveGround()) {
          this.characterJumping = true;
          this.resetCurrentImage();
          this.jump();
        }

        if (this.isDead() && !this.dead) {
          this.resetCurrentImage();
          clearInterval(actions);
          return (this.dead = true);
        }
      }, 1000 / 60);

      setInterval(() => {
        if (this.world.keyboard.D && this.shotAllowed() && !this.isAttacking && this.world.quiver.percentage > 0 && !this.dead) {
          this.activateDKey();
        }
      }, 100);
    }
  }

  activateDKey() {
    if (!this.isAttacking) {
      this.resetCurrentImage();
      this.isAttacking = true;
      this.world.keyboard.D = true;

      setTimeout(() => {
        this.isAttacking = false;
        this.world.keyboard.D = false;
        this.releaseArrow = true;
      }, 300);
    }
  }

  characterMovementAnimationIntervals() {
    setInterval(() => {
      if (this.isAttacking) {
        return;
      }
      if (this.dead) {
        if (this.currentImage < this.IMAGES_DEAD.length - 1) {
          this.playAnimation(this.IMAGES_DEAD);
        } else {
          this.loadImage(this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1]);
        }
      } else if (this.isHurt()) {
        this.playAnimation(this.IMAGES_HURT);
      } else if (this.isAboveGround()) {
        this.characterJumping = false;
        this.playAnimation(this.IMAGES_JUMPING);
        if (this.currentImage === this.IMAGES_JUMPING.length - 1 || !this.isAboveGround()) {
          this.loadImage(this.IMAGES_IDLE[this.IMAGES_IDLE.length - 1]);
        }
      } else if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
        this.playAnimation(this.IMAGES_WALKING);
      } else {
        this.playAnimation(this.IMAGES_IDLE);
      }
    }, 1000 / 10);
  }

  characterAttackAnimationIntervals() {
    setInterval(() => {
      if (this.isAttacking) {
        this.playAnimation(this.IMAGES_ATTACKING);
      }
    }, 30);
  }

  shotAllowed() {
    let timePassed = new Date().getTime() - this.shootingTime; // difference in ms
    timePassed = timePassed / 1000;
    return timePassed > 0.2; // difference in seconds
  }

  isEncounteringObstacle(enemy) {
    return (
      this.x + this.width - this.offset.right > enemy.x + enemy.offset.right + 10 &&
      this.x + this.offset.left * 0.98 < enemy.x + enemy.width - enemy.offset.left
    );
  }

  isEncounteringEndboss(endboss) {
    return (
      this.x + this.width - this.offset.right > endboss.x + endboss.offset.right * 0.9 &&
      this.x + this.offset.left * 0.9 < endboss.x + endboss.width - endboss.offset.left
    );
  }

  isCollidingVertically(mo) {
    return (
      this.x + this.offset.left < mo.x + mo.width - mo.offset.right &&
      this.y + this.height - this.offset.bottom < mo.y + mo.height - mo.offset.bottom &&
      this.y + this.height - this.offset.bottom > mo.y + mo.offset.top &&
      this.x + this.width - this.offset.right > mo.x + mo.offset.left &&
      this.speedY < 0
    );
  }

  isHit() {
    this.energy -= 20;
    if (this.energy < 0) {
      this.energy = 0;
    } else {
      this.lastHit = new Date().getTime();
    }
  }
}
