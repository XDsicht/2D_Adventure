class Character extends MovableObject {
  height = 200;
  width = 250;
  speed = 10;
  y = 245;
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
  world; // variable, die es ermöglicht, dass wir über den Character auf die Welt zugreifen können

  constructor() {
    super().loadImage("img/2.character/1.idle/Warrior_03__IDLE_000.png");
    this.loadImages(this.IMAGES_WALKING);
    this.animate();
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
    }, 1000 / 60);


    setInterval(() => {
      if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
        // WALK ANIMATION
        let i = this.currentImage % this.IMAGES_WALKING.length;
        let path = this.IMAGES_WALKING[i];
        this.img = this.imageCache[path];
        this.currentImage++;
      }
    }, 40);
  }
  jump() { }
}
