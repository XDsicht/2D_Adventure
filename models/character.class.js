class Character extends MovableObject {
  height = 200;
  width = 250;
  speed = 10;
  y = 250;
  x = 120;

  offset = {
    top: 35,
    left: 100,
    right: 78,
    bottom: 20
  };

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
  ];

  IMAGES_HURT = [
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
  ];

  IMAGES_DEAD = [
    'img/2.character/7.dead/Warrior_03__DIE_000.png',
    'img/2.character/7.dead/Warrior_03__DIE_001.png',
    'img/2.character/7.dead/Warrior_03__DIE_002.png',
    'img/2.character/7.dead/Warrior_03__DIE_003.png',
    'img/2.character/7.dead/Warrior_03__DIE_004.png',
    'img/2.character/7.dead/Warrior_03__DIE_005.png',
    'img/2.character/7.dead/Warrior_03__DIE_006.png',
    'img/2.character/7.dead/Warrior_03__DIE_007.png',
    'img/2.character/7.dead/Warrior_03__DIE_008.png',
    'img/2.character/7.dead/Warrior_03__DIE_009.png',
  ];

  IMAGES_ATTACKING = [
    'img/2.character/5.attack/Warrior_03__ATTACK_000.png',
    'img/2.character/5.attack/Warrior_03__ATTACK_001.png',
    'img/2.character/5.attack/Warrior_03__ATTACK_002.png',
    'img/2.character/5.attack/Warrior_03__ATTACK_003.png',
    'img/2.character/5.attack/Warrior_03__ATTACK_004.png',
    'img/2.character/5.attack/Warrior_03__ATTACK_005.png',
    'img/2.character/5.attack/Warrior_03__ATTACK_006.png',
    'img/2.character/5.attack/Warrior_03__ATTACK_007.png',
    'img/2.character/5.attack/Warrior_03__ATTACK_008.png',
    'img/2.character/5.attack/Warrior_03__ATTACK_009.png',
  ];

  world; // variable, die es ermöglicht, dass wir über den Character auf die Welt zugreifen können

  constructor() {
    super().loadImage("img/2.character/1.idle/Warrior_03__IDLE_000.png");
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_ATTACKING);
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
        this.currentImage = 0;
        this.jump();
      }
      // if (this.y === 250 && !(this.world.keyboard.RIGHT || this.world.keyboard.LEFT) && !this.isDead()) {
      //   this.currentImage = 0;
      // } ist für counter reset der jump animation
    }, 1000 / 60);


    setInterval(() => {

      if (this.isDead()) {
        this.playAnimation(this.IMAGES_DEAD);
      } else if (this.isHurt()) {
        this.playAnimation(this.IMAGES_HURT);
      } else if (this.isAboveGround()) {
        this.characterJumping = false;
        this.playAnimation(this.IMAGES_JUMPING);
        if (this.currentImage === this.IMAGES_JUMPING.length - 1) {

          this.loadImage("img/2.character/1.idle/Warrior_03__IDLE_000.png");
          console.log("reset animation");
        }
      } else {
        if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
          this.playAnimation(this.IMAGES_WALKING);
        }
      }
    }, 1000 / 10);

    setInterval(() => {
      // TODO: Check point of origin of arrow and speed of attack animation
      if (this.world.keyboard.D) {
        this.playAnimation(this.IMAGES_ATTACKING);
      }
    }, 100 / 10);
  }
}


// currentImage = 0; resetten, damit die Animation wieder zurückgsetzt wird