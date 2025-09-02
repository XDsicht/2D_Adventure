class HealthBar extends StatusBar {
    y = 0;

    IMAGES = [
        'img/6.bars/1.health/0_ copia_3.png',
        'img/6.bars/1.health/20_ copia_4.png',
        'img/6.bars/1.health/40_ copia_3.png',
        'img/6.bars/1.health/60_ copia_3.png',
        'img/6.bars/1.health/80_ copia_3.png',
        'img/6.bars/1.health/100_ copia_2.png',
    ];

    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.setPercentage(100); // Set initial percentage to 100 
    }
}