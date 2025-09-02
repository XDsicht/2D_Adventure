class Arrow extends MovableObject {
    IMAGE = 'img/5.elements/throwables/arrows/arrow.png';

    constructor() {
        super().loadImage(this.IMAGE);
    }

    drawThrowableObject(mo) {
        this.ctx.save();
        this.ctx.translate(mo.x + mo.width / 2, mo.y + mo.height / 2);
        this.ctx.rotate(mo.angle);
        this.ctx.drawImage(mo.img, -mo.width / 2, -mo.height / 2, mo.width, mo.height);
        this.ctx.restore();
    }
}