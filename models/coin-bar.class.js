class CoinBar extends StatusBar {
    y = 105;

    IMAGES = [
        'img/6.bars/3.coins/coins_0.png',
        'img/6.bars/3.coins/coins_20.png',
        'img/6.bars/3.coins/coins_40.png',
        'img/6.bars/3.coins/coins_60.png',
        'img/6.bars/3.coins/coins_80.png',
        'img/6.bars/3.coins/coins_100.png',
    ]

    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.setPercentage(0);
    }
}