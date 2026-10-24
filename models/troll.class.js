/**
 * A troll patrolling the desert trail. Both looks share every behaviour and differ only in their sprites.
 */
class Troll extends Enemy {
  /**
   * Loads all properties of the enemies, including the sprite set and its animation frames.
   *
   * @param {Object<string, string[]>} images - The look's sprite set, greyTrollImages or greenTrollImages.
   */
  constructor(images) {
    super().loadImage(images.idle[0]);
    this.IMAGES_IDLE = images.idle;
    this.IMAGES_WALKING = images.walking;
    this.IMAGES_HURT = images.hurt;
    this.IMAGES_DEAD = images.dead;
    this.IMAGES_ATTACKING = images.attacking;
    Object.values(images).forEach((frames) => this.loadImages(frames));
    this.speed = 0.15 + Math.random() * 0.25;
    this.animate();
    this.registerEnemySounds();
  }
}
