class Enemy extends MovableObject {
  ENDBOSS_IMAGES_IDLE = [
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

  ENDBOSS_IMAGES_WALKING = [
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

  ENDBOSS_IMAGES_RUN = [
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

  ENDBOSS_IMAGES_JUMPING = [
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

  ENDBOSS_IMAGES_HURT = [
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

  ENDBOSS_IMAGES_DEAD = [
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

  ENDBOSS_IMAGES_ATTACKING = [
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
  
  height = 240;
  width = 240;
  y = 226;
  otherDirection = true;
  energy = 10;
  delete = false;
  deadY = 228;
  enemySoundLibrary;

  offset = {
    top: 85,
    left: 90,
    right: 50,
    bottom: 35,
  };

  stompOffset = {
    left: 100,
    right: 75,
  };

  getStompOffset() {
    return {
      left: this.otherDirection ? this.stompOffset.right : this.stompOffset.left,
      right: this.otherDirection ? this.stompOffset.left : this.stompOffset.right,
    };
  }

  enemySounds = {
    isAttackingSound: new Audio("audio/enemy_audio/enemy_attack_sound.mp3"),
    isWalkingSound: new Audio("audio/enemy_audio/enemy_walking_sound.mp3"),
    isHitSound: new Audio("audio/enemy_audio/enemy_arrow_impact_sound.mp3"),
    isHurtSound: new Audio("audio/enemy_audio/enemy_hurt_sound.mp3"),
    isDeadSound: new Audio("audio/enemy_audio/enemy_dead_sound.mp3"),
  };

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

  shouldStopMoving() {
    if (!this.world || !this.world.character) return false;
    return this.isHurt() || (this.world.character.isHurt() && this.world.character.lastAttacker === this && !this.world.character.isAboveGround());
  }

  checkIfEnemyIsDead() {
    if (this.isDead() && !this.dead) {
      this.playEnemyBasedDeadSound();
      this.resetCurrentImage();
      return (this.dead = true);
    }
  }

  playEnemyBasedDeadSound() {
    if (this instanceof Troll_1 || this instanceof Troll_2) {
      this.enemySoundLibrary = this.enemySounds;
      this.enemySoundLibrary.isDeadSound.currentTime = 0;
      playSound(this.enemySoundLibrary.isDeadSound, gameSoundsVolume);
    } else {
      this.enemySoundLibrary = this.endbossSounds;
      this.enemySoundLibrary.isDeadSound.currentTime = 0;
      playSound(this.enemySoundLibrary.isDeadSound, gameSoundsVolume);
    }
  }

  playEnemyBasedSounds() {
    this.playEnemyDeadSound();
    this.playEnemyWalkingSound();
    this.playEnemyHurtSound();
    this.playEnemyAttackingSound();
  }

  playEnemyDeadAnimation() {
    this.y = this.deadY;
    let imagesDead = this.getImagesDead();
    if (this.currentImage < imagesDead.length - 1) {
      this.playAnimation(imagesDead);
    } else {
      this.loadImage(imagesDead[imagesDead.length - 1]);
      if (this.enemySoundLibrary) {
        this.enemySoundLibrary.isDeadSound.pause();
      }
      registerInterval(
        setTimeout(() => {
          return (this.delete = true);
        }, 800),
      );
    }
  }

  getImagesDead() {
    if (this instanceof Endboss) {
      return this.ENDBOSS_IMAGES_DEAD;
    } else {
      return this.IMAGES_DEAD;
    }
  }

  playAttackAnimation() {
    if (this.currentImage >= this.IMAGES_ATTACKING.length - 1) {
      this.isAttacking = false;
      this.resetCurrentImage();
    } else {
      this.playAnimation(this.IMAGES_ATTACKING);
      this.enemyDealsDamage();
    }
  }

  enemyDealsDamage() {
    if (this.currentImage >= 7 && !this.hasDealtDamage && this.world.character.isEncounteringObstacle(this)) {
      this.world.character.addPendingDamage(this, 20);
      this.world.character.lastAttacker = this;
      this.hasDealtDamage = true;
    }
  }

  inFrame() {
    const enemyOffsets = this.getEnemyDirectionalOffset();
    return this.x + this.width - enemyOffsets.rightOffset >= -this.world.camera_x && this.x + enemyOffsets.leftOffset <= -this.world.camera_x + this.world.canvas.width;
  }

  getEnemyDirectionalOffset() {
    return {
      leftOffset: this.otherDirection ? this.offset.right : this.offset.left,
      rightOffset: this.otherDirection ? this.offset.left : this.offset.right,
    };
  }

  animate() {
    registerInterval(
      setInterval(() => {
        if (this.checkIfWorldExists()) return;
        this.checkIfEnemyIsDead();
        this.activateEnemy();
      }, 1000 / 60),
    );
    registerInterval(
      setInterval(() => {
        if (this.checkIfWorldExists()) return;
        this.playStatusBasedAnimation();
      }, 100),
    );
  }

  getEnemyDirection() {
    if (this.isCharacterBehind()) {
      this.otherDirection = !this.otherDirection;
    }
  }

  playStatusBasedAnimation() {
    if (this.dead) {
      this.playEnemyDeadAnimation();
    } else if (this.isHurt()) {
      this.playAnimation(this.IMAGES_HURT);
    } else if (this.world.character.isHurt() && this.isAttacking) {
      this.playAnimation(this.IMAGES_IDLE);
    } else if (this.isAttacking && !this.world.character.isHurt()) {
      this.hasDealtDamage = false;
      this.playAttackAnimation();
    } else {
      this.playAnimation(this.IMAGES_WALKING);
    }
  }

  activateEnemy() {
    if (!this.dead && !this.isAttacking && !this.shouldStopMoving()) {
      this.getEnemyDirection();
      this.move();
    }
  }
}
