/**
 * Status bar showing how many coins the character has collected.
 */
class CoinBar extends StatusBar {
  y = 105;

  IMAGES = coinBarImages;

  /** 
   * Creates the bar, preloads its six frames and starts it empty. 
   */
  constructor() {
    super();
    this.loadImages(this.IMAGES);
    this.setPercentage(0);
  }
}
