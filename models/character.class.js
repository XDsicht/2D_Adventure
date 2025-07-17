class Character extends MovableObject {
    height = 200;
    width = 250;
    y = 251;
    constructor() {
        super().loadImage('img/2.character/1.idle/Warrior_03__IDLE_000.png');
        this.loadImages([
            'img/2.character/2.walk/Warrior_03__WALK_000.png',
            'img/2.character/2.walk/Warrior_03__WALK_001.png',
            'img/2.character/2.walk/Warrior_03__WALK_002.png',
            'img/2.character/2.walk/Warrior_03__WALK_003.png',
            'img/2.character/2.walk/Warrior_03__WALK_004.png',
            'img/2.character/2.walk/Warrior_03__WALK_005.png',
            'img/2.character/2.walk/Warrior_03__WALK_006.png',
            'img/2.character/2.walk/Warrior_03__WALK_007.png',
            'img/2.character/2.walk/Warrior_03__WALK_008.png',
            'img/2.character/2.walk/Warrior_03__WALK_009.png',
        ])
    }
    jump() {
    }
}