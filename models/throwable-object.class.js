class ThrowableObject extends MovableObject {
    speedY = 30;
    speedX = 25;
    IMAGE = 'img/5.elements/throwables/arrows/arrow.png';
    angle = 42;

    // TODO: Check width and height of arrow accord. to animation
    constructor(x, y) {
        super().loadImage(this.IMAGE);
        this.x = x;
        this.y = y;
        this.width = 55;
        this.height = 55;
        this.shoot();
    }

    shoot() {
        this.speedY = 5;
        this.applyGravity();
        console.log("this.y", this.y);
        console.log("this.speedY", this.speedY);
        setInterval(() => {
            this.x += this.speedX;
        }, 25);
    }
}