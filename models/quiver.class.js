/**
 * Status bar showing how many arrows the character is carrying.
 */
class Quiver extends StatusBar {
  y = 55;

  IMAGES = quiverImages;

  /** 
   * Creates the bar, preloads its six frames and starts it empty. 
   */
  constructor() {
    super();
    this.loadImages(this.IMAGES);
    this.setPercentage(0);
  }
}
