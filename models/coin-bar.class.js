class CoinBar extends StatusBar {
  y = 105;

  IMAGES = coinBarImages;

  constructor() {
    super();
    this.loadImages(this.IMAGES);
    this.setPercentage(0);
  }
}
