class Endboss extends MovableObject {
    height = 360;
    width = 340;
    y = 102;
    otherDirection = true;


    IMAGES_WALKING = [
        'img/4.boss/2.walk/Walk_000.png',
        'img/4.boss/2.walk/Walk_001.png',
        'img/4.boss/2.walk/Walk_002.png',
        'img/4.boss/2.walk/Walk_003.png',
        'img/4.boss/2.walk/Walk_004.png',
        'img/4.boss/2.walk/Walk_005.png',
        'img/4.boss/2.walk/Walk_006.png',
        'img/4.boss/2.walk/Walk_007.png',
        'img/4.boss/2.walk/Walk_008.png',
        'img/4.boss/2.walk/Walk_009.png',
    ]

    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.x = 2500
        this.animate();
    }

    animate() {
        setInterval(() => {
            this.playAnimation(this.IMAGES_WALKING);
        }, 100);
    }
}