/**
 * The rules for what happens when two things in the level touch.
 */
class CollisionResolver {
  /**
   * @param {World} world - The world whose objects these rules apply to.
   */
  constructor(world) {
    this.world = world;
  }

  /**
   * Applies whatever damage was queued this tick and updates the health bar. Every source of damage is applied here, so this is also where a jump is marked as having cost her health, whether that came from touching an enemy or from one landing a swing on her in mid-air.
   */
  applyDamageFromEnemies() {
    if (this.world.character.pendingDamage > 0) {
      if (this.world.character.isAboveGround()) {
        this.world.character.hasBeenHurtThisJump = true;
      }
      this.world.character.applyAccumulatedDamage();
      this.world.healthBar.setPercentage(this.world.character.energy);
    }
  }

  /**
   * Runs the slower collision checks: enemy attacks, contact damage on the ground and pickups. Mid-air contact runs in the fast loop instead.
   */
  checkCollisions() {
    this.checkEnemyWalkingCollisions(this.world.level.enemies);
    this.checkCharacterWalkingCollisions();
    this.checkCollisionsWithCollectibles(this.world.level.arrows, this.world.quiver);
    this.checkCollisionsWithCollectibles(this.world.level.coins, this.world.coinBar);
  }

  /**
   * Lets enemies start an attack when the character is in reach.
   *
   * @param {MovableObject[]} enemies - Every enemy in the level.
   */
  checkEnemyWalkingCollisions(enemies) {
    enemies.forEach((enemy) => {
      let timeSinceLastAttack = new Date().getTime() - enemy.lastAttackTime;
      this.handleTrollWalkingCollision(enemy, timeSinceLastAttack);
      this.handleEndbossWalkingCollision(enemy, timeSinceLastAttack);
    });
  }

  /**
   * Starts a troll's attack if it is close, idle and off cooldown.
   *
   * @param {MovableObject} enemy - Candidate enemy; ignored unless it is a troll.
   * @param {number} timeSinceLastAttack - Milliseconds since this enemy last attacked.
   */
  handleTrollWalkingCollision(enemy, timeSinceLastAttack) {
    if ((enemy instanceof Troll_1 || enemy instanceof Troll_2) && !this.world.character.isHurt()) {
      if (this.world.character.isWithinStrikeZone(enemy) && !this.world.character.isWalking && !enemy.isAttacking && !enemy.dead && timeSinceLastAttack > 1000) {
        enemy.isAttacking = true;
        enemy.lastAttackTime = new Date().getTime();
        enemy.resetCurrentImage();
      }
    }
  }

  /**
   * Starts the endboss's attack under the same conditions as a troll's, but on a shorter cooldown so the fight stays pressured.
   *
   * @param {MovableObject} enemy - Candidate enemy; ignored unless it is the endboss.
   * @param {number} timeSinceLastAttack - Milliseconds since the boss last attacked.
   */
  handleEndbossWalkingCollision(enemy, timeSinceLastAttack) {
    if (enemy instanceof Endboss && !this.world.character.isHurt()) {
      if (this.world.character.isWithinStrikeZone(enemy) && !this.world.character.isWalking && !enemy.isAttacking && !enemy.dead && timeSinceLastAttack > 800) {
        enemy.isAttacking = true;
        enemy.lastAttackTime = new Date().getTime();
        enemy.resetCurrentImage();
      }
    }
  }

  /**
   * Kills a troll the character lands on top of, and bounces the character off.
   */
  checkCharacterJumpingCollisions() {
    this.world.level.enemies.forEach((enemy) => {
      if (this.canStomp(enemy)) {
        this.world.character.bounce();
        enemy.energy = 0;
        enemy.checkIfEnemyIsDead();
        enemy.isAttacking = false;
      }
    });
  }

  /**
   * Decides whether a stomp should land.
   *
   * @param {MovableObject} enemy - The enemy being landed on.
   * @returns {boolean} - True when this stomp kills.
   */
  canStomp(enemy) {
    if (enemy instanceof Endboss) return false;
    let character = this.world.character;
    return (
      character.speedY < 0 &&
      character.isAboveGround() &&
      this.isInStompZone(enemy) &&
      this.isStompingBody(enemy) &&
      !character.isHurt() &&
      !character.hasBeenHurtThisJump &&
      !character.dead &&
      !enemy.dead
    );
  }

  /**
   * Reports whether the character is over the enemy's body rather than its sprite's empty edges.
   *
   * @param {MovableObject} enemy - The enemy being landed on.
   * @returns {boolean} - True when the character is centred over the body.
   */
  isStompingBody(enemy) {
    let characterCenterX = this.world.character.x + this.world.character.width / 2;
    let stompOffset = enemy.getStompOffset();
    return characterCenterX > enemy.x + stompOffset.left && characterCenterX < enemy.x + enemy.width - stompOffset.right;
  }

  /**
   * Reports whether character's feet are in the band just below the top of the head, the only height at which a landing kills.
   *
   * @param {MovableObject} enemy - The enemy being landed on.
   * @returns {boolean} - True while character's feet are inside the stomp zone.
   */
  isInStompZone(enemy) {
    let feetY = this.world.character.getFeetY();
    let stompY = enemy.getStompY();
    return feetY > stompY && feetY <= stompY + enemy.stompDepth;
  }

  /**
   * Reports whether character's feet are below the stomp zone, where touching the enemy hurts instead of killing it.
   *
   * @param {MovableObject} enemy - The enemy being touched.
   * @returns {boolean} - True once character's feet are deeper than the stomp zone.
   */
  isBelowStompZone(enemy) {
    return this.world.character.getFeetY() > enemy.getStompY() + enemy.stompDepth;
  }

  /**
   * Deals contact damage when the character walks into an enemy, once per contact.
   */
  checkCharacterWalkingCollisions() {
    this.world.level.enemies.forEach((enemy) => {
      if (this.checkWalkingCollisionStatus(enemy)) {
        this.world.character.addPendingDamage(enemy, 20);
        this.world.character.lastAttacker = enemy;
        enemy.hasDealtDamage = true;
      }
      this.releaseDamageLatch(enemy);
    });
  }

  /**
   * Lets an enemy deal contact damage again once character is clear of it.
   *
   * @param {MovableObject} enemy - The enemy whose latch is being released.
   */
  releaseDamageLatch(enemy) {
    if (!this.world.character.isColliding(enemy) && enemy.hasDealtDamage && !enemy.isAttacking) {
      enemy.hasDealtDamage = false;
    }
  }

  /**
   * Deals contact damage while the character is airborne, so jumping through an enemy or dropping in beside it costs health.
   */
  checkAirborneContact() {
    this.world.level.enemies.forEach((enemy) => {
      if (enemy.dead) return;
      if (this.isTouchingInMidAir(enemy)) {
        this.world.character.addPendingDamage(enemy, 20);
        this.world.character.lastAttacker = enemy;
        enemy.hasDealtDamage = true;
      }
    });
  }

  /**
   * Decides whether an overlap in mid-air should cost character health, on the way up as well as down.
   *
   * @param {MovableObject} enemy - The enemy character is overlapping.
   * @returns {boolean} - True when the overlap should deal contact damage.
   */
  isTouchingInMidAir(enemy) {
    let character = this.world.character;
    return (
      character.isAboveGround() &&
      character.isColliding(enemy) &&
      this.isInHurtRange(enemy) &&
      !character.isHurt() &&
      !character.hasBeenHurtThisJump
    );
  }

  /**
   * Reports whether a touch at character's current height hurts.
   *
   * @param {MovableObject} enemy - The enemy character is overlapping.
   * @returns {boolean} - True when a touch at this height hurts.
   */
  isInHurtRange(enemy) {
    if (enemy instanceof Endboss) return true;
    return this.isBelowStompZone(enemy);
  }

  /**
   * Decides whether walking into this enemy should deal damage.
   *
   * @param {MovableObject} enemy - The enemy in contact.
   * @returns {boolean} - True when all conditions for a contact hit are met.
   */
  checkWalkingCollisionStatus(enemy) {
    return (
      this.world.character.isColliding(enemy) &&
      this.world.character.isWalking &&
      !this.world.character.characterJumping &&
      !this.world.character.isHurt() &&
      !enemy.dead &&
      !enemy.isAttacking &&
      !enemy.hasDealtDamage
    );
  }

  /**
   * Collects an item and fills its bar, unless that bar is already full.
   *
   * @param {MovableObject[]} array - The collectibles still in the level.
   * @param {StatusBar} bar - The bar this kind of item fills.
   */
  checkCollisionsWithCollectibles(array, bar) {
    array.forEach((item) => {
      if (this.world.character.isColliding(item)) {
        if (!bar.checkBarPercentage()) {
          array.splice(array.indexOf(item), 1);
          bar.fillBar();
          if (item.collectSound) item.playOwnSound(item.collectSound);
        }
        if (item instanceof Arrow && this.world.quiver.percentage <= 100 && this.world.arrowInventory <= 5) {
          this.world.addAmmunition();
        }
      }
    });
  }

  /**
   * Resolves arrow hits.
   */
  checkCollisionOfArrows() {
    this.world.level.throwableObjects.slice().forEach((arrow) => {
      let enemy = this.findHitEnemy(arrow);
      if (enemy) {
        this.hitEnemyWithArrow(enemy, arrow);
      }
    });
  }

  /**
   * Picks which enemy an arrow hits when it overlaps more than one.
   *
   * @param {ThrowableObject} arrow - The arrow in flight.
   * @returns {MovableObject|undefined} - The enemy hit, or undefined if none.
   */
  findHitEnemy(arrow) {
    let hits = this.world.level.enemies.filter((enemy) => this.canArrowHit(enemy, arrow));
    if (arrow.otherDirection) {
      hits.sort((a, b) => b.x - a.x);
    } else {
      hits.sort((a, b) => a.x - b.x);
    }
    return hits[0];
  }

  /**
   * Reports whether this enemy is a legal target.
   *
   * @param {MovableObject} enemy - Candidate target.
   * @param {ThrowableObject} arrow - The arrow in flight.
   * @returns {boolean} - True when the arrow may hit this enemy.
   */
  canArrowHit(enemy, arrow) {
    if (enemy.dead) return false;
    if (!enemy.inFrame()) return false;
    if (!this.checkEndbossActive(enemy)) return false;
    return this.isArrowOnTarget(enemy, arrow);
  }

  /**
   * Reports whether an arrow has reached the enemy's body, measured against the projectile hit box rather than the collision box. The collision box is fitted to the body's widest extent so a stomp lands anywhere on it, but an arrow flies at one height, where the body is narrower for most of the walk cycle.
   *
   * @param {MovableObject} enemy - The target.
   * @param {ThrowableObject} arrow - The arrow in flight.
   * @returns {boolean} - True when the arrow overlaps the hit box.
   */
  isArrowOnTarget(enemy, arrow) {
    let hit = enemy.getHitOffset();
    let box = enemy.getCurrentOffset();
    return (
      arrow.x + arrow.width > enemy.x + hit.left &&
      arrow.x < enemy.x + enemy.width - hit.right &&
      arrow.y + arrow.height > enemy.y + box.top &&
      arrow.y < enemy.y + enemy.height - box.bottom
    );
  }

  /**
   * Lands the hit: impact sound, damage, and the arrow is consumed.
   *
   * @param {MovableObject} enemy - The enemy hit.
   * @param {ThrowableObject} arrow - The arrow, removed from the level here.
   */
  hitEnemyWithArrow(enemy, arrow) {
    playSound(enemy.enemySounds.isHitSound, gameSoundsVolume);
    enemy.hit();
    this.updateEndbossHealthBar(enemy);
    let index = this.world.level.throwableObjects.indexOf(arrow);
    if (index > -1) this.world.level.throwableObjects.splice(index, 1);
  }

  /**
   * Syncs the boss's bar after a hit, ignoring hits on trolls.
   *
   * @param {MovableObject} enemy - The enemy that was just hit.
   */
  updateEndbossHealthBar(enemy) {
    if (enemy instanceof Endboss) {
      this.world.endbossHealthBar.setPercentage(enemy.energy * 5);
    }
  }

  /**
   * Reports whether an enemy may be targeted yet.
   *
   * @param {MovableObject} enemy - The enemy to test.
   * @returns {boolean} - True unless this is the dormant endboss.
   */
  checkEndbossActive(enemy) {
    if (enemy instanceof Endboss) {
      if (!enemy.activated) return false;
    }
    return true;
  }
}
