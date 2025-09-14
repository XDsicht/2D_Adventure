class Coin extends MovableObject {
    width = 30;
    height = 30;

    IMAGES = [
        'img/5.elements/coins/Bronze_21.png',
        'img/5.elements/coins/Bronze_22.png',
        'img/5.elements/coins/Bronze_23.png',
        'img/5.elements/coins/Bronze_24.png',
        'img/5.elements/coins/Bronze_25.png',
        'img/5.elements/coins/Bronze_26.png',
        'img/5.elements/coins/Bronze_27.png',
        'img/5.elements/coins/Bronze_28.png',
        'img/5.elements/coins/Bronze_29.png',
        'img/5.elements/coins/Bronze_30.png',
    ]

    constructor() {
        super().loadImage('img/5.elements/coins/Bronze_30.png');
        this.loadImages(this.IMAGES);
        this.x = 300 + Math.random() * 2000;
        this.y = 155 + Math.random() * 200;
        this.animate();
    }

    animate() {
        setInterval(() => {
            this.playAnimation(this.IMAGES);
        }, 1000 / 10);
    }

    adjustCoinPosition(i) {
        if (i > 0 && i <= 4) {
            this.width -= 6;
            this.x += 3;
        } else if (i > 4 && i < 9) {
            this.width += 6;
            this.x -= 3;
        } else if (i == 4) {
            this.width = this.width;
        }
    }
}