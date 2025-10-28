class MovableObject extends DrawableObject {
  speed = 0.15;
  otherDirection = false;
  dead = false;
  speedY = 0;
  acceleration = 2.5;
  energy = 100;
  lastHit = 0;
  // characterJumping = false;

  offset = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  };

  applyGravity() {
    setInterval(() => {
      if (this.isAboveGround() || this.speedY > 0) {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
      }
    }, 1000 / 20);
  }

  isAboveGround() {
    if (this instanceof ThrowableObject) { // ThrowableObjects should always fall
      return true;
    } else {
      return this.y < 250;
    }
  }

  // character.isColliding(chicken)
  isColliding(mo) {
    return (
      this.x + this.width - this.offset.right > mo.x + mo.offset.right &&
      this.y + this.height - this.offset.bottom > mo.y + mo.offset.top &&
      this.x + this.offset.left < mo.x + mo.width - mo.offset.left &&
      this.y + this.offset.top < mo.y + mo.height - mo.offset.bottom
    );
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

  stopAnimation() {

  }

  moveRight() {
    this.x += this.speed;
  }

  moveLeft() {
    this.x -= this.speed;
  }

  jump() {
    this.speedY = 25; // Set the speedY to a positive value to make the character jump 25
  }

  drawArrow(ctx, mo) {
    ctx.save();
    ctx.translate(mo.x + mo.width / 2, mo.y + mo.height / 2);
    ctx.rotate((mo.angle * Math.PI) / 180);
    ctx.drawImage(mo.img, -mo.width / 2, -mo.height / 2, mo.width, mo.height);
    ctx.restore();
  }
}
