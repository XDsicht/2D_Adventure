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
    ];

    IMAGES_HURT = [
        'img/4.boss/6.hurt/Hurt_000.png',
        'img/4.boss/6.hurt/Hurt_001.png',
        'img/4.boss/6.hurt/Hurt_002.png',
        'img/4.boss/6.hurt/Hurt_003.png',
        'img/4.boss/6.hurt/Hurt_004.png',
        'img/4.boss/6.hurt/Hurt_005.png',
        'img/4.boss/6.hurt/Hurt_006.png',
        'img/4.boss/6.hurt/Hurt_007.png',
        'img/4.boss/6.hurt/Hurt_008.png',
        'img/4.boss/6.hurt/Hurt_009.png',
    ];

    IMAGES_DEAD = [
        'img/4.boss/7.dead/Dead_000.png',
        'img/4.boss/7.dead/Dead_001.png',
        'img/4.boss/7.dead/Dead_002.png',
        'img/4.boss/7.dead/Dead_003.png',
        'img/4.boss/7.dead/Dead_004.png',
        'img/4.boss/7.dead/Dead_005.png',
        'img/4.boss/7.dead/Dead_006.png',
        'img/4.boss/7.dead/Dead_007.png',
        'img/4.boss/7.dead/Dead_008.png',
        'img/4.boss/7.dead/Dead_009.png',
    ];

    IMAGES_ATTACKING = [
        'img/4.boss/5.attack/Attack_000.png',
        'img/4.boss/5.attack/Attack_001.png',
        'img/4.boss/5.attack/Attack_002.png',
        'img/4.boss/5.attack/Attack_003.png',
        'img/4.boss/5.attack/Attack_004.png',
        'img/4.boss/5.attack/Attack_005.png',
        'img/4.boss/5.attack/Attack_006.png',
        'img/4.boss/5.attack/Attack_007.png',
        'img/4.boss/5.attack/Attack_008.png',
        'img/4.boss/5.attack/Attack_009.png',
    ];

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