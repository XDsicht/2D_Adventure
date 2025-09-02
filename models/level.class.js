class Level {
    enemies;
    clouds;
    backgroundObjects;
    throwableObjects;
    coins;
    arrows;
    level_end_x = 2210;

    constructor(enemies, clouds, backgroundObjects, coins, throwableObjects, arrows) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.throwableObjects = throwableObjects;
        this.coins = coins;
        this.arrows = arrows;
    }
}