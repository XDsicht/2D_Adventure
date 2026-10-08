/**
 * Status bar showing how many coins the character has collected.
 *
 * Filled by fillBar() in 20 percent steps when a coin is picked up, and never
 * emptied, since coins are not spent on anything. Level 1 places exactly five
 * coins, so collecting them all fills the bar completely.
 */
class CoinBar extends StatusBar {
  y = 105;

  IMAGES = coinBarImages;

  /** Creates the bar, preloads its six frames and starts it empty. */
  constructor() {
    super();
    this.loadImages(this.IMAGES);
    this.setPercentage(0);
  }
}
