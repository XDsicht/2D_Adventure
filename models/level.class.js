/**
 * Container for everything that makes up a playable level.
 */
class Level {
  enemies;
  backgroundObjects;

  /** Arrows currently in flight; starts empty and is filled by checkShootArrow(). */
  throwableObjects;

  coins;
  arrows;

  /** World position of the right-hand wall the character cannot walk past. */
  level_end_x = 3400;

  /**
   * Stores the objects the level is built from.
   *
   * @param {Enemy[]} enemies - Trolls and the endboss, in spawn order.
   * @param {BackgroundObject[]} backgroundObjects - Parallax layer tiles.
   * @param {Coin[]} coins - Collectible coins.
   * @param {ThrowableObject[]} throwableObjects - Arrows in flight, empty at level start.
   * @param {Arrow[]} arrows - Collectible arrows lying on the ground.
   */
  constructor(enemies, backgroundObjects, coins, throwableObjects, arrows) {
    this.enemies = enemies;
    this.backgroundObjects = backgroundObjects;
    this.throwableObjects = throwableObjects;
    this.coins = coins;
    this.arrows = arrows;
  }
}
