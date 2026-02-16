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
      return this.y < 410;
    } else {
      return this.y < 250;
    }
  }

  getCurrentOffset() {
    if (this.dead && this.offsetDead) return this.offsetDead;
    if (this.isHurt() && this.offsetHurt) return this.offsetHurt;
    if (this.isAttacking && this.offsetAttack) return this.offsetAttack;
    if (this.isRunning && this.offsetRun) return this.offsetRun;
    if (this.isWalking && this.offsetWalking) return this.offsetWalking;
    if (this.offsetIdle) return this.offsetIdle;
    return this.offset;
  }

  getDirectionalOffset(mo) {
    const thisOffset = this.getCurrentOffset();
    const moOffset = mo.getCurrentOffset();

    return {
      thisLeft: this.otherDirection ? thisOffset.right : thisOffset.left,
      thisRight: this.otherDirection ? thisOffset.left : thisOffset.right,
      moLeft: mo.otherDirection ? moOffset.right : moOffset.left,
      moRight: mo.otherDirection ? moOffset.left : moOffset.right,
    };
  }

  isColliding(mo) {
    const offset = this.getDirectionalOffset(mo);
    const thisOffset = this.getCurrentOffset();
    const moOffset = mo.getCurrentOffset();

    return (
      this.x + this.width - offset.thisRight > mo.x + offset.moRight &&
      this.y + this.height - thisOffset.bottom > mo.y + moOffset.top &&
      this.x + offset.thisLeft < mo.x + mo.width - offset.moLeft &&
      this.y + thisOffset.top < mo.y + mo.height - moOffset.bottom
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
