class Enemy extends MovableObject {
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
    if (this.currentImage < this.IMAGES_DEAD.length - 1) {
      this.playAnimation(this.IMAGES_DEAD);
    } else {
      this.loadImage(this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1]);
      setTimeout(() => {
        return (this.delete = true);
      }, 800);
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
    return this.x + this.width >= -this.world.camera_x && this.x <= -this.world.camera_x + this.world.canvas.width;
  }
}
