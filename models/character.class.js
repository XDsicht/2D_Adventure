class Character extends MovableObject {
  height = 200;
  width = 250;
  speed = 10;
  y = 250;

  IMAGES_WALKING = [
    "img/2.character/2.walk/Warrior_03__WALK_000.png",
    "img/2.character/2.walk/Warrior_03__WALK_001.png",
    "img/2.character/2.walk/Warrior_03__WALK_002.png",
    "img/2.character/2.walk/Warrior_03__WALK_003.png",
    "img/2.character/2.walk/Warrior_03__WALK_004.png",
    "img/2.character/2.walk/Warrior_03__WALK_005.png",
    "img/2.character/2.walk/Warrior_03__WALK_006.png",
    "img/2.character/2.walk/Warrior_03__WALK_007.png",
    "img/2.character/2.walk/Warrior_03__WALK_008.png",
    "img/2.character/2.walk/Warrior_03__WALK_009.png",
  ];

  IMAGES_JUMPING = [
    'img/2.character/4.jump/Warrior_03__JUMP_000.png',
    'img/2.character/4.jump/Warrior_03__JUMP_001.png',
    'img/2.character/4.jump/Warrior_03__JUMP_002.png',
    'img/2.character/4.jump/Warrior_03__JUMP_003.png',
    'img/2.character/4.jump/Warrior_03__JUMP_004.png',
    'img/2.character/4.jump/Warrior_03__JUMP_005.png',
    'img/2.character/4.jump/Warrior_03__JUMP_006.png',
    'img/2.character/4.jump/Warrior_03__JUMP_007.png',
    'img/2.character/4.jump/Warrior_03__JUMP_008.png',
    'img/2.character/4.jump/Warrior_03__JUMP_009.png',
  ]

  IMAGES_ISHURT = [
    'img/2.character/6.hurt/Warrior_03__HURT_000.png',
    'img/2.character/6.hurt/Warrior_03__HURT_001.png',
    'img/2.character/6.hurt/Warrior_03__HURT_002.png',
    'img/2.character/6.hurt/Warrior_03__HURT_003.png',
    'img/2.character/6.hurt/Warrior_03__HURT_004.png',
    'img/2.character/6.hurt/Warrior_03__HURT_005.png',
    'img/2.character/6.hurt/Warrior_03__HURT_006.png',
    'img/2.character/6.hurt/Warrior_03__HURT_007.png',
    'img/2.character/6.hurt/Warrior_03__HURT_008.png',
    'img/2.character/6.hurt/Warrior_03__HURT_009.png',
  ]

  world; // variable, die es ermöglicht, dass wir über den Character auf die Welt zugreifen können

  constructor() {
    super().loadImage("img/2.character/1.idle/Warrior_03__IDLE_000.png");
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.animate();
    this.applyGravity();
  }

  animate() {

    setInterval(() => {
      if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
        this.moveRight();
        this.otherDirection = false;
        // this.walking_sound.play();
      }
      if (this.world.keyboard.LEFT && this.x > 0) {
        this.moveLeft();
        this.otherDirection = true;
        // this.walking_sound.play();
      }
      this.world.camera_x = -this.x + 50; // Kamera folgt dem Character

      if (this.world.keyboard.SPACE && !this.isAboveGround()) {
        this.characterJumping = true;
        this.jump();
      }
      if (this.y === 250 && !(this.world.keyboard.RIGHT || this.world.keyboard.LEFT)) {
        this.currentImage = 0;
      }
    }, 1000 / 60);


    setInterval(() => {
      if (this.isAboveGround()) {
        this.characterJumping = false;
        this.playAnimation(this.IMAGES_JUMPING);
      } else {
        if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
          // WALK ANIMATION
          this.playAnimation(this.IMAGES_WALKING);
        }
      }
    }, 1000 / 10);
  }
}

// currentImage = 0; resetten, damit die Animation wieder zurückgsetzt wird