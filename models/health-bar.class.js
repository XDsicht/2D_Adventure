/**
 * Status bar showing the character's remaining health.
 */
class HealthBar extends StatusBar {
  y = 0;

  IMAGES = healthBarImages;

  /** 
   * Creates the bar, preloads its six frames and starts it at full health. 
   */
  constructor() {
    super();
    this.loadImages(this.IMAGES);
    this.setPercentage(100);
  }
}
