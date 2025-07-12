class BackgroundObject extends MovableObject {
    height = 720;
    width = -480;
    constructor(imagePath, x, y) {
        super().loadImage(imagePath);
        this.x = x;
        this.y = y;
    }
}