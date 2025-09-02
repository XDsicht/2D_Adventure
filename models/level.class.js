class Level {
    enemies;
    clouds;
    backgroundObjects;
    throwableObjects;
    coins;
    level_end_x = 2210;

    constructor(enemies, clouds, backgroundObjects, coins, throwableObjects) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.throwableObjects = throwableObjects;
        this.coins = coins;
    }
}