/**
 * A collectible coin that spins in place until the character walks into it.
 */
class Coin extends MovableObject {
  width = 30;
  height = 30;

  IMAGES = coinImages;

  /**
   * Played when this coin is collected; the collision resolver triggers it.
   */
  collectSound = coinCollectSound;

  /** 
   * Creates a coin at a random position between x 300-2300 and y 155-355. 
   */
  constructor() {
    super().loadImage("img/5.elements/coins/Bronze_30.png");
    this.loadImages(this.IMAGES);
    this.x = 300 + Math.random() * 2000;
    this.y = 155 + Math.random() * 200;
    this.animate();
  }

  /** 
   * Starts the spin, cycling through the ten coin frames ten times a second. 
   */
  animate() {
    registerInterval(
      setInterval(() => {
        if (this.paused) return;
        this.playAnimation(this.IMAGES);
      }, 1000 / 10),
    );
  }

  /**
   * Narrows the sprite over the first half of the spin and widens it again over
   * the second, shifting x by half the width change so the coin stays centred.
   *
   * @param {number} i - Index of the frame about to be drawn, 0 to 9.
   */
  adjustCoinPosition(i) {
    if (i > 0 && i <= 4) {
      this.width -= 6;
      this.x += 3;
    } else if (i > 4 && i < 9) {
      this.width += 6;
      this.x -= 3;
    } else if (i == 4) {
      this.width = this.width;
    }
  }
}
