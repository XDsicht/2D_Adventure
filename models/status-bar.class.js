class StatusBar extends DrawableObject {

    IMAGES = [
        'img/6.bars/1.health/0_ copia_3.png',
        'img/6.bars/1.health/20_ copia_4.png',
        'img/6.bars/1.health/40_ copia_3.png',
        'img/6.bars/1.health/60_ copia_3.png',
        'img/6.bars/1.health/80_ copia_3.png',
        'img/6.bars/1.health/100_ copia_2.png',
    ];

    percentage = 100;

    constructor() {
        super(); // initialisiert die Funktionen des übergeordneten Objekts
        this.loadImages(this.IMAGES);
        this.x = 80;
        this.y = 0;
        this.width = 200;
        this.height = 60;
        this.setPercentage(100); // Set initial percentage to 100 
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