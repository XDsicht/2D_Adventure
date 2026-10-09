/** The level currently in play; replaced wholesale each time a game starts. */
let level1;

/**
 * Builds level 1 from scratch and assigns it to the level1 global.
 *
 * Called by launchGame() before the World is constructed, and again on every
 * restart. Because every object here is created fresh, nothing needs resetting
 * between games: dead trolls, spent arrows and collected coins all disappear
 * with the previous level.
 *
 * The level contains seven enemies (three of each troll type plus the endboss),
 * five coins and nineteen collectible arrows. The backdrop is five parallax
 * layers repeated at seven positions from -720 to 3600, which covers the whole
 * walkable stretch up to level_end_x. The empty array is throwableObjects,
 * which fills at runtime as the character shoots.
 */
function initLevel1() {
  level1 = new Level(
    [new Troll_1(), new Troll_1(), new Troll_1(), new Troll_2(), new Troll_2(), new Troll_2(), new Endboss()],
    [
      new BackgroundObject("img/5.elements/background/1.png", -720),
      new BackgroundObject("img/5.elements/background/2.png", -720),
      new BackgroundObject("img/5.elements/background/3.png", -720),
      new BackgroundObject("img/5.elements/background/4.png", -720),
      new BackgroundObject("img/5.elements/background/5.png", -720),
      new BackgroundObject("img/5.elements/background/1.png", 0),
      new BackgroundObject("img/5.elements/background/2.png", 0),
      new BackgroundObject("img/5.elements/background/3.png", 0),
      new BackgroundObject("img/5.elements/background/4.png", 0),
      new BackgroundObject("img/5.elements/background/5.png", 0),
      new BackgroundObject("img/5.elements/background/1.png", 720),
      new BackgroundObject("img/5.elements/background/2.png", 720),
      new BackgroundObject("img/5.elements/background/3.png", 720),
      new BackgroundObject("img/5.elements/background/4.png", 720),
      new BackgroundObject("img/5.elements/background/5.png", 720),
      new BackgroundObject("img/5.elements/background/1.png", 1440),
      new BackgroundObject("img/5.elements/background/2.png", 1440),
      new BackgroundObject("img/5.elements/background/3.png", 1440),
      new BackgroundObject("img/5.elements/background/4.png", 1440),
      new BackgroundObject("img/5.elements/background/5.png", 1440),
      new BackgroundObject("img/5.elements/background/1.png", 2160),
      new BackgroundObject("img/5.elements/background/2.png", 2160),
      new BackgroundObject("img/5.elements/background/3.png", 2160),
      new BackgroundObject("img/5.elements/background/4.png", 2160),
      new BackgroundObject("img/5.elements/background/5.png", 2160),
      new BackgroundObject("img/5.elements/background/1.png", 2880),
      new BackgroundObject("img/5.elements/background/2.png", 2880),
      new BackgroundObject("img/5.elements/background/3.png", 2880),
      new BackgroundObject("img/5.elements/background/4.png", 2880),
      new BackgroundObject("img/5.elements/background/5.png", 2880),
      new BackgroundObject("img/5.elements/background/1.png", 3600),
      new BackgroundObject("img/5.elements/background/2.png", 3600),
      new BackgroundObject("img/5.elements/background/3.png", 3600),
      new BackgroundObject("img/5.elements/background/4.png", 3600),
      new BackgroundObject("img/5.elements/background/5.png", 3600),
    ],
    [new Coin(), new Coin(), new Coin(), new Coin(), new Coin()],
    [],
    [
      new Arrow(),
      new Arrow(),
      new Arrow(),
      new Arrow(),
      new Arrow(),
      new Arrow(),
      new Arrow(),
      new Arrow(),
      new Arrow(),
      new Arrow(),
      new Arrow(),
      new Arrow(),
      new Arrow(),
      new Arrow(),
      new Arrow(),
      new Arrow(),
      new Arrow(),
      new Arrow(),
      new Arrow(),
    ],
  );
}
