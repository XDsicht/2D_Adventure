class Enemy extends MovableObject {
  height = 240;
  width = 240;
  y = 226;
  otherDirection = true;
  energy = 10;
  delete = false;

  offset = {
    top: 85,
    left: 90,
    right: 50,
    bottom: 35,
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
      this.resetCurrentImage();
      return (this.dead = true);
    }
  }

  playEnemyDeadAnimation() {
    this.y = 228;
    if (this.currentImage < this.IMAGES_DEAD.length - 1) {
      this.playAnimation(this.IMAGES_DEAD);
    } else {
      this.loadImage(this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1]);
      registerInterval(setTimeout(() => {
        return this.delete = true;
      }, 800)
    );
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
    registerInterval(setInterval(() => {
        if (this.checkIfWorldExists()) return;
        this.checkIfEnemyIsDead();
        this.activateEnemy();
      }, 1000 / 60),
    );
    registerInterval(setInterval(() => {
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
