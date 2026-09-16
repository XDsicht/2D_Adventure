class Level {
  enemies;
  backgroundObjects;
  throwableObjects;
  coins;
  arrows;
  level_end_x = 3400;

  constructor(enemies, backgroundObjects, coins, throwableObjects, arrows) {
    this.enemies = enemies;
    this.backgroundObjects = backgroundObjects;
    this.throwableObjects = throwableObjects;
    this.coins = coins;
    this.arrows = arrows;
  }
}
