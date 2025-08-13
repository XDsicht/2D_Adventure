class Level {
    enemies;
    clouds;
    backgroundObjects;
    throwableObjects;
    level_end_x = 2210;
    constructor(enemies, clouds, backgroundObjects, throwableObjects) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.throwableObjects = throwableObjects;
    }
}