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
        this.width = 38;
        this.height = 36;
        // Don't auto-shoot, wait for manual trigger
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

    checkQuiverPercentage() {
        if (this.quiver.percentage === 0) {
            return true;
        }
    }
}