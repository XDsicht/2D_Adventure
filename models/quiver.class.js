/**
 * Status bar showing how many arrows the character is carrying.
 *
 * Filled by fillBar() when an arrow is collected and emptied by depleteBar()
 * when one is shot, each step moving it by 20 percent. Starts empty, so the
 * character cannot shoot until the first arrow is picked up.
 */
class Quiver extends StatusBar {
  y = 55;

  IMAGES = quiverImages;

  /** Creates the bar, preloads its six frames and starts it empty. */
  constructor() {
    super();
    this.loadImages(this.IMAGES);
    this.setPercentage(0);
  }
}
