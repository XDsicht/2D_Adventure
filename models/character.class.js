class Character extends MovableObject {
  height = 200;
  width = 250;
  speed = 10;
  y = 85;
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
        this.otherDirection = false;
        this.x += this.speed;
      }
      if (this.world.keyboard.LEFT && this.x > 0) {
        this.otherDirection = true;
        this.x -= this.speed;

      }
      this.world.camera_x = -this.x + 50; // Kamera folgt dem Character
      console.log("this.speedY", this.speedY);

      if (this.world.keyboard.UP && !this.isAboveGround()) {
        this.speedY = 20;
      }
    }, 1000 / 60);


    setInterval(() => {
      if (this.isAboveGround()) {
        this.playAnimation(this.IMAGES_JUMPING);
      } else {

        if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
          // WALK ANIMATION
          this.playAnimation(this.IMAGES_WALKING);
        }
      }
    }, 40);
  }


  jump() { }
}