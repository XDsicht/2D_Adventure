class Troll_2 extends Enemy {

  IMAGES_IDLE = [
    "img/3.enemies/2.enemy/1.idle/Troll_01_1_IDLE_000.png",
    "img/3.enemies/2.enemy/1.idle/Troll_01_1_IDLE_001.png",
    "img/3.enemies/2.enemy/1.idle/Troll_01_1_IDLE_002.png",
    "img/3.enemies/2.enemy/1.idle/Troll_01_1_IDLE_003.png",
    "img/3.enemies/2.enemy/1.idle/Troll_01_1_IDLE_004.png",
    "img/3.enemies/2.enemy/1.idle/Troll_01_1_IDLE_005.png",
    "img/3.enemies/2.enemy/1.idle/Troll_01_1_IDLE_006.png",
    "img/3.enemies/2.enemy/1.idle/Troll_01_1_IDLE_007.png",
    "img/3.enemies/2.enemy/1.idle/Troll_01_1_IDLE_008.png",
    "img/3.enemies/2.enemy/1.idle/Troll_01_1_IDLE_009.png",
  ];

  IMAGES_WALKING = [
    "img/3.enemies/2.enemy/2.walk/Troll_01_1_WALK_000.png",
    "img/3.enemies/2.enemy/2.walk/Troll_01_1_WALK_001.png",
    "img/3.enemies/2.enemy/2.walk/Troll_01_1_WALK_002.png",
    "img/3.enemies/2.enemy/2.walk/Troll_01_1_WALK_003.png",
    "img/3.enemies/2.enemy/2.walk/Troll_01_1_WALK_004.png",
    "img/3.enemies/2.enemy/2.walk/Troll_01_1_WALK_005.png",
    "img/3.enemies/2.enemy/2.walk/Troll_01_1_WALK_006.png",
    "img/3.enemies/2.enemy/2.walk/Troll_01_1_WALK_007.png",
    "img/3.enemies/2.enemy/2.walk/Troll_01_1_WALK_008.png",
    "img/3.enemies/2.enemy/2.walk/Troll_01_1_WALK_009.png",
  ];

  IMAGES_HURT = [
    "img/3.enemies/2.enemy/6.hurt/Troll_01_1_HURT_000.png",
    "img/3.enemies/2.enemy/6.hurt/Troll_01_1_HURT_001.png",
    "img/3.enemies/2.enemy/6.hurt/Troll_01_1_HURT_002.png",
    "img/3.enemies/2.enemy/6.hurt/Troll_01_1_HURT_003.png",
    "img/3.enemies/2.enemy/6.hurt/Troll_01_1_HURT_004.png",
    "img/3.enemies/2.enemy/6.hurt/Troll_01_1_HURT_005.png",
    "img/3.enemies/2.enemy/6.hurt/Troll_01_1_HURT_006.png",
    "img/3.enemies/2.enemy/6.hurt/Troll_01_1_HURT_007.png",
    "img/3.enemies/2.enemy/6.hurt/Troll_01_1_HURT_008.png",
    "img/3.enemies/2.enemy/6.hurt/Troll_01_1_HURT_009.png",
  ];

  IMAGES_DEAD = [
    "img/3.enemies/2.enemy/7.dead/Troll_01_1_DIE_000.png",
    "img/3.enemies/2.enemy/7.dead/Troll_01_1_DIE_001.png",
    "img/3.enemies/2.enemy/7.dead/Troll_01_1_DIE_002.png",
    "img/3.enemies/2.enemy/7.dead/Troll_01_1_DIE_003.png",
    "img/3.enemies/2.enemy/7.dead/Troll_01_1_DIE_004.png",
    "img/3.enemies/2.enemy/7.dead/Troll_01_1_DIE_005.png",
    "img/3.enemies/2.enemy/7.dead/Troll_01_1_DIE_006.png",
    "img/3.enemies/2.enemy/7.dead/Troll_01_1_DIE_007.png",
    "img/3.enemies/2.enemy/7.dead/Troll_01_1_DIE_008.png",
    "img/3.enemies/2.enemy/7.dead/Troll_01_1_DIE_009.png",
  ];

  IMAGES_ATTACKING = [
    "img/3.enemies/2.enemy/5.attack/Troll_01_1_ATTACK_000.png",
    "img/3.enemies/2.enemy/5.attack/Troll_01_1_ATTACK_001.png",
    "img/3.enemies/2.enemy/5.attack/Troll_01_1_ATTACK_002.png",
    "img/3.enemies/2.enemy/5.attack/Troll_01_1_ATTACK_003.png",
    "img/3.enemies/2.enemy/5.attack/Troll_01_1_ATTACK_004.png",
    "img/3.enemies/2.enemy/5.attack/Troll_01_1_ATTACK_005.png",
    "img/3.enemies/2.enemy/5.attack/Troll_01_1_ATTACK_006.png",
    "img/3.enemies/2.enemy/5.attack/Troll_01_1_ATTACK_007.png",
    "img/3.enemies/2.enemy/5.attack/Troll_01_1_ATTACK_008.png",
    "img/3.enemies/2.enemy/5.attack/Troll_01_1_ATTACK_009.png",
  ];

  constructor() {
    super().loadImage("img/3.enemies/2.enemy/1.idle/Troll_01_1_IDLE_000.png");
    this.loadImages(this.IMAGES_IDLE);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_ATTACKING);
    this.moveLeft();
    this.speed = 0.15 + Math.random() * 0.25;
    this.animate();
  }
}
