class Troll_1 extends Enemy {
  IMAGES_IDLE = troll1Images.idle;
  IMAGES_WALKING = troll1Images.walking;
  IMAGES_HURT = troll1Images.hurt;
  IMAGES_DEAD = troll1Images.dead;
  IMAGES_ATTACKING = troll1Images.attacking;

  constructor() {
    super().loadImage("img/3.enemies/1.enemy/1.idle/Troll_03_1_IDLE_000.png");
    this.loadImages(this.IMAGES_IDLE);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_ATTACKING);
    this.moveLeft();
    this.speed = 0.15 + Math.random() * 0.25;
    this.animate();
    registerGameSound(this.enemySounds.isAttackingSound);
    registerGameSound(this.enemySounds.isWalkingSound);
    registerGameSound(this.enemySounds.isHurtSound);
    registerGameSound(this.enemySounds.isDeadSound);
  }
}
