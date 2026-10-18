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
   * Applies whatever damage was queued this tick and updates the health bar. 
   */
  applyDamageFromEnemies() {
    if (this.world.character.pendingDamage > 0) {
      this.world.character.applyAccumulatedDamage();
      this.world.healthBar.setPercentage(this.world.character.energy);
    }
  }

  /** 
   * Runs the slower collision checks: enemy attacks, contact damage and pickups. 
   */
  checkCollisions() {
    this.checkEnemyWalkingCollisions(this.world.level.enemies);
    this.checkCharacterWalkingCollisions();
    this.checkAirborneContact();
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
      if (this.world.character.isEncounteringObstacle(enemy) && !this.world.character.isWalking && !enemy.isAttacking && !enemy.dead && timeSinceLastAttack > 1000) {
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
      if (this.world.character.isEncounteringEndboss(enemy) && !this.world.character.isWalking && !enemy.isAttacking && !enemy.dead && timeSinceLastAttack > 800) {
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
   * Decides whether a stomp should land. A hit cancels the kill: an enemy that has already landed a hit on her stays latched until she is back on the ground, so a jump that cost her health cannot also earn the kill.
   *
   * @param {MovableObject} enemy - The enemy being landed on.
   * @returns {boolean} - True when this stomp kills.
   */
  canStomp(enemy) {
    if (enemy instanceof Endboss) return false;
    return (
      this.world.character.isCollidingVertically(enemy) &&
      this.isStompingBody(enemy) &&
      this.world.character.isAboveGround() &&
      !this.world.character.isHurt() &&
      !this.world.character.dead &&
      !enemy.dead &&
      !enemy.hasDealtDamage
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
   * Reports whether a stomp is under way: she is in the air and lined up over this enemy's body, so she is on her way down onto it rather than passing through it. The band is narrow enough that being inside it while airborne means being above the enemy. The boss answers false because it cannot be stomped, so touching it in the air must still hurt.
   *
   * @param {MovableObject} enemy - The enemy being overlapped.
   * @returns {boolean} - True while the character is lined up to stomp it.
   */
  isStompInProgress(enemy) {
    if (enemy instanceof Endboss) return false;
    return this.world.character.isAboveGround() && this.isStompingBody(enemy);
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
   * Lets an enemy deal contact damage again, but only once she is back on the ground and clear of it. Holding the latch through the air matters: her jump arc carries her out of the enemy's box near the apex, and releasing it there would make re-entry on the way down count as a second contact.
   *
   * @param {MovableObject} enemy - The enemy whose latch is being released.
   */
  releaseDamageLatch(enemy) {
    if (!this.world.character.isAboveGround() && !this.world.character.isColliding(enemy) && enemy.hasDealtDamage && !enemy.isAttacking) {
      enemy.hasDealtDamage = false;
    }
  }

  /**
   * Deals contact damage while the character is airborne, so passing through an enemy costs health. A stomp already under way is spared, since she is lined up to land on the enemy rather than running into it.
   */
  checkAirborneContact() {
    this.world.level.enemies.forEach((enemy) => {
      if (enemy.dead || this.isStompInProgress(enemy)) return;
      if (this.world.character.isAboveGround() && this.world.character.isColliding(enemy) && !this.world.character.isHurt() && !enemy.hasDealtDamage) {
        this.world.character.addPendingDamage(enemy, 20);
        this.world.character.lastAttacker = enemy;
        enemy.hasDealtDamage = true;
      }
    });
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
    return arrow.isColliding(enemy);
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
