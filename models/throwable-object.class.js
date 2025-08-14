class ThrowableObject extends MovableObject {
    speedY = 30;
    speedX = 10;
    y = 368;

    angle = 140;

    IMAGE = 'img/5.elements/throwables/arrows/arrow.png';

    constructor(x, y) {
        super().loadImage(this.IMAGE);
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 80;
        this.shoot();
    }

    shoot() {
        this.speedY = 30;
        this.applyGravity();
        setInterval(() => {
            this.x += this.speedX;
        }, 25);
    }
}