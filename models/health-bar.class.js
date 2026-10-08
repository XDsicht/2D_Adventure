class HealthBar extends StatusBar {
  y = 0;

  IMAGES = healthBarImages;

  constructor() {
    super();
    this.loadImages(this.IMAGES);
    this.setPercentage(100); // Set initial percentage to 100
  }
}
