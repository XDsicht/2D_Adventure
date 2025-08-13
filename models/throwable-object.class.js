class ThrowableObject extends DrawableObject {
    speedY = 30;
    speedX = 20;
    y = 360;
    width = 80;
    height = 80;
    angle = 140;

    IMAGE = 'img/5.elements/throwables/arrows/arrow.png';

    constructor() {
        super().loadImage(this.IMAGE);
        this.x = 400 + Math.random() * 300 * 2;
    }

    throw() {

    }
}