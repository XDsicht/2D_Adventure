class Quiver extends StatusBar {
    x = 80;
    y = 70;

    IMAGES = [
        'img/6.bars/2.quiver/0.png',
        'img/6.bars/2.quiver/20.png',
        'img/6.bars/2.quiver/40.png',
        'img/6.bars/2.quiver/60.png',
        'img/6.bars/2.quiver/80.png',
        'img/6.bars/2.quiver/100.png',
        'img/6.bars/2.quiver/quiver.png'
    ]

    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.setPercentage(0);
    }

    drawIcon(ctx, iconImg) {
        ctx.drawImage(iconImg, this.x, this.y, 55, 55);
    }

    drawQuiver(mo, ctx, iconImg) {
        ctx.save();
        ctx.translate(mo.x - 12, -56);
        ctx.rotate(38 * Math.PI / 180);
        this.drawIcon(ctx, iconImg);
        ctx.restore();
    }
}