class ThrowableObject extends MovableObject {
    speedY = 30;
    speedX = 20;
    IMAGE = 'img/5.elements/throwables/arrows/arrow.png';
    angle = 23; // 42

    // TODO : adjust speed x
    // TODO: adjust angle
    constructor(x, y) {
        super().loadImage(this.IMAGE);
        this.x = x;
        this.y = y;
        this.width = 46;
        this.height = 33; // 34
        // Don't auto-shoot, wait for manual trigger
    }

    shoot() {
        this.speedY = 5;
        this.applyGravity();
        setInterval(() => {
            this.x += this.speedX;
        }, 25);
    }

    checkQuiverPercentage() {
        if (this.quiver.percentage === 0) {
            return true;
        }
    }
}