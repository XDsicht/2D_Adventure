/**
 * The second of the two troll types patrolling the desert trail.
 *
 * Identical to Troll_1 in every respect except its sprite art, inheriting all
 * movement, attack and damage behaviour from Enemy. Level 1 spawns three of
 * each, and World.setWorld() assigns their start positions afterwards through
 * calculateSpawningLocation().
 */
class Troll_2 extends Enemy {
  IMAGES_IDLE = troll2Images.idle;
  IMAGES_WALKING = troll2Images.walking;
  IMAGES_HURT = troll2Images.hurt;
  IMAGES_DEAD = troll2Images.dead;
  IMAGES_ATTACKING = troll2Images.attacking;

  /**
   * Preloads every animation, gives the troll a random walking speed between
   * 0.15 and 0.40 so the group does not move in lockstep, then starts its
   * animation loops and registers its sounds for muting and volume control.
   */
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
    registerGameSound(this.enemySounds.isAttackingSound);
    registerGameSound(this.enemySounds.isWalkingSound);
    registerGameSound(this.enemySounds.isHurtSound);
    registerGameSound(this.enemySounds.isDeadSound);
  }
}
