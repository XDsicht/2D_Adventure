class ThrowableObject extends MovableObject {
    speedX = 20;
    IMAGE = 'img/5.elements/throwables/arrows/arrow.png';
    angle = 23; // 42 target
    acceleration = 1;

    constructor(x, y) {
        super().loadImage(this.IMAGE);
        this.x = x;
        this.y = y;
        this.width = 45;
        this.height = 33;
        // Don't auto-shoot, wait for manual trigger
    }

    shoot() {
        this.speedY = 6;
        this.applyGravity();
        setInterval(() => {
            this.x += this.speedX;
        }, 25);
        setInterval(() => {
            if (this.speedY > 0) {
                // debugger;
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