class MovableObject extends DrawableObject {
  speed = 0.15;
  otherDirection = false;
  speedY = 0;
  acceleration = 2.5;
  energy = 100;
  lastHit = 0;
  // characterJumping = false;

  // offset = {
  //   top: 0,
  //   left: 0,
  //   right: 0,
  //   bottom: 0
  // };

  applyGravity() {
    setInterval(() => {
      if (this.isAboveGround() || this.speedY > 0) {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
        console.log("this.y", this.y);

      }
    }, 1000 / 20);
  }

  isAboveGround() {
    return this.y < 250;
  }

  // character.isColliding(chicken)
  isColliding(mo) {
    return (
      this.x + this.width > mo.x &&
      this.y + this.height > mo.y &&
      this.x < mo.x + mo.width &&
      this.y < mo.y + mo.height
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



  playAnimation(images) {
    let i = this.currentImage % images.length;
    let path = images[i];
    this.img = this.imageCache[path];
    this.currentImage++;
    if (images === this.IMAGES_JUMPING) {
      console.log(images[i]);
      console.log("i", i);
    }
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
}
