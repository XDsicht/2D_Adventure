class Troll extends MovableObject {
    height = 270;
    width = 270;
    y = 201;
    constructor() {
        super().loadImage('img/3.enemy/1.idle/Troll_03_1_IDLE_000.png');
        this.x = 200 + Math.random() * 500;
    }
}