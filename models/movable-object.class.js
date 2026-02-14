class MovableObject extends DrawableObject {
  speed = 0.15;
  otherDirection = false;
  dead = false;
  speedY = 0;
  acceleration = 2.5;
  energy = 100;
  lastHit = 0;
  isAttacking = false;
  isWalking = false;
  isRunning = false;
  lastAttackTime = 0;
  hasDealtDamage = false;
  lastAttacker;
  world;
  // initialObstacleSpawn = 600;
  spawningLocation;

  offset = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };

  applyGravity() {
    setInterval(() => {
      if (this.isAboveGround() || this.speedY > 0) {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
      }
      if (!this.isAboveGround() && this.speedY < 0) {
        this.y = 250;
        this.speedY = 0;
      }
    }, 1000 / 20);
  }

  isAboveGround() {
    if (this instanceof ThrowableObject) {
      // ThrowableObjects should always fall
      return this.y < 410;
    } else {
      return this.y < 250;
    }
  }

  getEffectiveOffset(mo) {
    return {
      thisLeft: this.otherDirection ? this.offset.right : this.offset.left,
      thisRight: this.otherDirection ? this.offset.left : this.offset.right,
      moLeft: mo.otherDirection ? mo.offset.right : mo.offset.left,
      moRight: mo.otherDirection ? mo.offset.left : mo.offset.right,
    };
  }

  isColliding(mo) {
    const offset = this.getEffectiveOffset(mo);

    return (
      this.x + this.width - offset.thisRight > mo.x + offset.moRight &&
      this.y + this.height - this.offset.bottom > mo.y + mo.offset.top &&
      this.x + offset.thisLeft < mo.x + mo.width - offset.moLeft &&
      this.y + this.offset.top < mo.y + mo.height - mo.offset.bottom
    );
  }

  isPassing(mo) {
    return this.x + this.width < mo.x || this.x > mo.x + mo.width;
  }

  hit() {
    this.energy -= 5;
    if (this.energy < 0) {
      this.energy = 0;
    } else {
      this.lastHit = new Date().getTime();
    }
  }

  isDead() {
    return this.energy == 0;
  }

  isHurt() {
    let timePassed = new Date().getTime() - this.lastHit; // difference in ms
    timePassed = timePassed / 1000; // difference in seconds
    return timePassed < 0.8;
  }

  isIdle() {
    return !this.moveRight() && !this.moveLeft();
  }

  playAnimation(images) {
    let i = this.currentImage % images.length;
    let path = images[i];
    this.img = this.imageCache[path];
    this.currentImage++;
    if (this instanceof Coin) {
      this.adjustCoinPosition(i);
    }
  }

  moveRight() {
    this.x += this.speed;
  }

  moveLeft() {
    this.x -= this.speed;
  }

  move() {
    if (this.otherDirection) {
      this.moveLeft();
    } else {
      this.moveRight();
    }
  }

  jump() {
    this.speedY = 25;
  }

  bounce() {
    this.speedY = 20;
  }

  drawArrow(ctx, mo) {
    ctx.save();
    ctx.translate(mo.x + mo.width / 2, mo.y + mo.height / 2);
    if (mo.otherDirection) {
      ctx.scale(-1, 1);
    }
    ctx.rotate((mo.angle * Math.PI) / 180);
    ctx.drawImage(mo.img, -mo.width / 2, -mo.height / 2, mo.width, mo.height);
    ctx.restore();
  }
}
