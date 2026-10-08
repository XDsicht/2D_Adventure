class Quiver extends StatusBar {
  y = 55;

  IMAGES = quiverImages;

  constructor() {
    super();
    this.loadImages(this.IMAGES);
    this.setPercentage(0);
  }
}
