class Troll extends MovableObject {
    height = 270;
    width = 270;
    y = 194;
    otherDirection = true;
    IMAGES_WALKING = [
        'img/3.enemy/2.walk/Troll_03_1_WALK_000.png',
        'img/3.enemy/2.walk/Troll_03_1_WALK_001.png',
        'img/3.enemy/2.walk/Troll_03_1_WALK_002.png',
        'img/3.enemy/2.walk/Troll_03_1_WALK_003.png',
        'img/3.enemy/2.walk/Troll_03_1_WALK_004.png',
        'img/3.enemy/2.walk/Troll_03_1_WALK_005.png',
        'img/3.enemy/2.walk/Troll_03_1_WALK_006.png',
        'img/3.enemy/2.walk/Troll_03_1_WALK_007.png',
        'img/3.enemy/2.walk/Troll_03_1_WALK_008.png',
        'img/3.enemy/2.walk/Troll_03_1_WALK_009.png',
    ];

    constructor() {
        super().loadImage('img/3.enemy/1.idle/Troll_03_1_IDLE_000.png');
        this.loadImages(this.IMAGES_WALKING);
        this.moveLeft();
        this.x = 200 + Math.random() * 500;
        this.speed = 0.15 + Math.random() * 0.25;
        this.animate();
    }

    animate() {
        setInterval(() => {
            this.playAnimation(this.IMAGES_WALKING);
        }, 100);
    }
}