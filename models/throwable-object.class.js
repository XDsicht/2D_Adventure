class ThrowableObject extends MovableObject {
    speedX = 20;
    IMAGE = 'img/5.elements/throwables/arrows/arrow.png';
    angle = 23;
    acceleration = 1;

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
        setInterval(() => {
            if (this.isAboveGround()) {
                if (this.otherDirection) {
                    this.x -= this.speedX;
                } else {
                    this.x += this.speedX;
                }
            }
        }, 25);
        setInterval(() => {
            if (this.speedY > 0) {
                this.angle += 2;
            }
        }, 1000 / 20);
    }

    checkQuiverPercentage() {
        if (this.quiver.percentage === 0) {
            return true;
        }
    }
}