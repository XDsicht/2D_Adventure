class Enemy extends MovableObject {
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

  playEnemyBasedHurtSound() {
    if (this.currentImage === 0) {
      if (this instanceof Troll_1 || this instanceof Troll_2) {
        this.enemySoundLibrary = this.enemySounds;
      } else {
        this.enemySoundLibrary = this.endbossSounds;
      }
      this.enemySoundLibrary.isHurtSound.currentTime = 0;
      playSound(this.enemySoundLibrary.isHurtSound, gameSoundsVolume);
    }
  }

  playEnemyDeadAnimation() {
    this.y = this.deadY;
    let imagesDead = this.getImagesDead();
    if (this.currentImage < imagesDead.length - 1) {
      this.playAnimation(imagesDead);
    } else {
      this.loadImage(imagesDead[imagesDead.length - 1]);
      this.deathAnimationDone = true;
      if (this.enemySoundLibrary) {
        this.enemySoundLibrary.isDeadSound.pause();
      }
      this.setEnemyDeadTimeout();
    }
  }

  setEnemyDeadTimeout() {
    registerInterval(
      setTimeout(() => {
        return (this.delete = true);
      }, 800),
    );
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
    this.startEnemy();
    this.startStatusBasedAnimation();
  }

  startEnemy() {
    registerInterval(
      setInterval(() => {
        if (this.paused) return;
        if (this.checkIfWorldExists()) return;
        this.checkIfEnemyIsDead();
        this.activateEnemy();
      }, 1000 / 60),
    );
  }

  startStatusBasedAnimation() {
    registerInterval(
      setInterval(() => {
        if (this.paused) return;
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
      this.executeHurtAnimation();
    } else if (this.world.character.isHurt() && this.isAttacking) {
      this.playAnimation(this.IMAGES_IDLE);
    } else if (this.isAttacking && !this.world.character.isHurt()) {
      this.hasDealtDamage = false;
      this.playAttackAnimation();
    } else {
      this.playAnimation(this.IMAGES_WALKING);
    }
  }

  executeHurtAnimation() {
    this.playEnemyBasedHurtSound();
    this.playAnimation(this.IMAGES_HURT);
  }

  activateEnemy() {
    if (!this.dead && !this.isAttacking && !this.shouldStopMoving()) {
      this.getEnemyDirection();
      this.move();
    }
  }
}
