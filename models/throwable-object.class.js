class ThrowableObject extends MovableObject {
  speedX = 20;
  IMAGE = "img/5.elements/throwables/arrows/arrow.png";
  angle = 23;
  acceleration = 1;
  groundY = 410;
  constructor(x, y, otherDirection) {
    super().loadImage(this.IMAGE);
    this.x = x;
    this.y = y;
    this.width = 45;
    this.height = 33;
    this.otherDirection = otherDirection;
  }

  shoot() {
    this.speedY = 6;
    this.applyGravity();
    registerInterval(
      setInterval(() => {
        this.defineSpeedX();
      }, 25),
    );
    registerInterval(
      setInterval(() => {
        this.defineAngle();
      }, 1000 / 20),
    );
  }

  defineAngle() {
    if (this.speedY > 0) {
      this.angle += 2;
    }
  }

  defineSpeedX() {
    if (this.isAboveGround()) {
      if (this.otherDirection) {
        return this.x -= this.speedX;
      } else {
        return this.x += this.speedX;
      }
    }
  }

  checkQuiverPercentage() {
    if (this.quiver.percentage === 0) {
      return true;
    }
  }
}
