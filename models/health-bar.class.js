/**
 * Status bar showing the character's remaining health.
 *
 * Sits at the top of the canvas and is updated from applyDamageFromEnemies()
 * in World, which passes the character's energy straight to setPercentage().
 * Starts full, unlike the quiver and coin bars which start empty.
 */
class HealthBar extends StatusBar {
  y = 0;

  IMAGES = healthBarImages;

  /** Creates the bar, preloads its six frames and starts it at full health. */
  constructor() {
    super();
    this.loadImages(this.IMAGES);
    this.setPercentage(100);
  }
}
