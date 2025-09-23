class Arrow extends MovableObject {
    y = 420;
    width = 36;
    height = 38;
    angle = 105;

    IMAGE = 'img/5.elements/throwables/arrows/arrow.png';

    constructor() {
        super().loadImage(this.IMAGE);
        this.x = 300 + Math.random() * 2000;
    }
}