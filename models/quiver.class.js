class Quiver extends StatusBar {
    y = 55;

    IMAGES = [
        'img/6.bars/2.quiver/quiver_0.png',
        'img/6.bars/2.quiver/quiver_20.png',
        'img/6.bars/2.quiver/quiver_40.png',
        'img/6.bars/2.quiver/quiver_60.png',
        'img/6.bars/2.quiver/quiver_80.png',
        'img/6.bars/2.quiver/quiver_100.png',
    ]

    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.setPercentage(0);
    }
}