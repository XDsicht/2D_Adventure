class Arrow extends MovableObject {
    y = 395;
    width = 60;
    height = 60;
    angle = 105;

    IMAGE = 'img/5.elements/throwables/arrows/arrow.png';

    constructor() {
        super().loadImage(this.IMAGE);
        this.x = 300 + Math.random() * 2000;
    }
}