class StatusBar extends DrawableObject {

    IMAGES = [
        'img/6.bars/1.health/0_copia_3.png',
        'img/6.bars/1.health/20_copia_4.png',
        'img/6.bars/1.health/40_copia_3.png',
        'img/6.bars/1.health/60_copia_3.png',
        'img/6.bars/1.health/80_copia_3.png',
        'img/6.bars/1.health/100_copia_2.png'
    ];

    percentage = 100;

    constructor() {
        super();
        this.loadImages(this.IMAGES);
    }

    //setPercentage(50)
    setPercentage(percentage) {
        this.percentage = percentage; // => 0...5
        // let imageIndex = parseInt(percentage / 20);
        // let path = this.IMAGES[imageIndex];
        let path = this.IMAGES[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }

    resolveImageIndex() {
        if (this.percentage == 100) {
            return 5;
        } else if (this.percentage > 80) {
            return 4;
        } else if (this.percentage > 60) {
            return 3;
        } else if (this.percentage > 40) {
            return 2;
        } else if (this.percentage > 20) {
            return 1;
        } else {
            return 0;
        }
    }
}