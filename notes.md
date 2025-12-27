TODO:

<!-- - fix death animation --> done 
<!-- - fix attack animation --> done 
<!-- - fix shooting direction of arrow if otherDirection --> done 
<!-- - only use number of arrows in quiver --> done 

<!-- - add bouncing effect for character on enemies while jumping --> done
<!-- - let enemies turn around --> done
<!-- - let endboss walk as soon as character shows up --> done
- let endboss turn around if character is behind him

<!-- - fix hit animation of character --> done 
<!-- - fix attack animation of character: --> done 
  <!-- - don't restart attack when D double pressed --> done 

- fix colliding functions for:
  <!-- - arrows with enemies --> done 
  <!-- - character with enemies while jumping --> done 

  - character with enemies while colliding?
  - character with endboss while colliding?

  - add second set of enemies

<!-- - add death animations for enemies --> done 

- and death animation for endboss

<!-- - add hurt animations to enemies --> done 

- add hurt animations to endboss
- add hit animations for enemies and endboss

<!-- - add hit logic for enemies --> done 

- add hit logic for endboss
- add game restart logic
- make canvas responsive

<!-- geschossen wird, wenn das Objekt erstellt wird, d.h.: 1. Array mit Arrows füllen 2. Shoot ausführen bei Tastendruck -->

Attack Logic of Florian
currentImage = 0; resetten, damit die Animation wieder zurückgsetzt wird
Methode schreiben, dass Attacking D immer gedrückt bleibt
setTimeout, dass Attacking false wird
activateAttack() {
if (!this.attacked) {
this.currentImage = 0;
let DIsPressed = setInterval(() => {
this.attacked = true;
this.world.keyboard.D = true;
}, 100)

setTimeout(() => {

clearInterval(DIsPressed)
this.attacked = false;
this.world.keyboard.D = false;
this.world.shootNormalBubble();
}, 500)
}

}
setInterval(() => {
if (this.isDead()) {
this.playAnimation(this.IMAGES_DEAD);
} else if (this.isHurt()) {
this.playAnimation(this.IMAGES_HURT);
} else if (this.isAboveGround()) {
this.characterJumping = false;
this.playAnimation(this.IMAGES_JUMPING);
if (this.currentImage === this.IMAGES_JUMPING.length - 1 || !this.isAboveGround()) {
this.loadImage("img/2.character/1.idle/Warrior_03\_\_IDLE_000.png");
}
} else if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
this.playAnimation(this.IMAGES_WALKING);
} else if (this.isAttacking && !this.alreadyAttacking) {
this.alreadyAttacking = true;
this.currentImage = 0;
this.playAnimation(this.IMAGES_ATTACKING);

setTimeout(() => {
this.isAttacking = false;
this.releaseArrow = true;
this.alreadyAttacking = false;
console.log(this.releaseArrow);
}, 1000)

} else {
// this.playAnimation(this.IMAGES_IDLE);
}
}, 1000 / 10); // 100

another possible fix for shooting with D:
setTimeout(() => {
this.isAttacking = false;
this.releaseArrow = true;
console.log(this.releaseArrow);
}, 1000);
