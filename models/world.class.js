/**
 * The game world: owns the level, the camera and every rule about how things
 * interact.
 */
class World {
  level = level1;
  character = new Character();
  canvas;
  ctx;
  keyboard;

  /**
   * Horizontal camera shift, applied by translating the canvas before drawing.
   */
  camera_x = 0;

  /**
   * Where the character sits on screen, in pixels from the left edge.
   */
  cameraOffset = 100;

  /** 
   * Where the camera is heading during the boss fight; camera_x eases towards this. 
   */
  targetCameraX = 0;

  /** 
   * Fraction of the remaining distance the camera closes each frame.
   */
  cameraLerpFactor = 0.1;

  /**
   * Distance at which the camera snaps to its target instead of easing further.
   */
  lerpThreshold = 0.4;
  healthBar = new HealthBar();
  quiver = new Quiver();
  coinBar = new CoinBar();
  endbossHealthBar = new EndbossHealthBar();

  /** 
   * Arrows available to shoot, capped at five. The quiver bar shows the same supply. 
   */
  arrowInventory = 0;

  /**
   * Running cursor for troll spawn positions.
   */
  initialObstacleSpawn = 600;
  paused = false;

  /** 
   * Handle for the current draw frame, kept so pausing can cancel it. 
   */
  animationFrameId = null;

  /**
   * Starts the world: first frame, back-references, then the loops.
   *
   * @param {HTMLCanvasElement} canvas - The canvas to draw on.
   * @param {Keyboard} keyboard - The shared input state.
   */
  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.draw();
    this.setWorld();
    this.run();
  }

  /**
   * Gives the character and every enemy a reference back to this world, and places the trolls.
   */
  setWorld() {
    this.character.world = this;
    this.endbossHealthBar.setBounds(this.canvas.width);
    this.level.enemies.forEach((enemy) => {
      enemy.world = this;
      if (enemy instanceof Troll_1 || enemy instanceof Troll_2) {
        enemy.x = enemy.calculateSpawningLocation();
      }
    });
  }

  /** 
   * Freezes the world: stops drawing and pauses every object's own loops. 
   */
  pause() {
    this.paused = true;
    cancelAnimationFrame(this.animationFrameId);
    this.character.pause();
    this.level.enemies.forEach((enemy) => enemy.pause());
    this.level.coins.forEach((coin) => coin.pause());
    this.level.throwableObjects.forEach((arrow) => arrow.pause());
  }

  /**
   * Unfreezes the world and restarts drawing.
   */
  resume() {
    if (!this.paused) return;
    this.paused = false;
    this.character.resume();
    this.level.enemies.forEach((enemy) => enemy.resume());
    this.level.coins.forEach((coin) => coin.resume());
    this.level.throwableObjects.forEach((arrow) => arrow.resume());
    this.draw();
  }

  /** 
   * Starts both game loops. 
   */
  run() {
    this.runMainLoop();
    this.runFastCollisionLoop();
  }

  /** 
   * Ten times a second: damage, shooting, pickups and clearing dead enemies. 
   */
  runMainLoop() {
    registerInterval(
      setInterval(() => {
        if (this.paused) return;
        this.checkCollisions();
        this.applyDamageFromEnemies();
        this.character.resetDamageAccumulation();
        this.checkShootArrow();
        this.removeDeadEnemies();
      }, 100),
    );
  }

  /**
   * Forty times a second: arrow hits and stomps.
   */
  runFastCollisionLoop() {
    registerInterval(
      setInterval(() => {
        if (this.paused) return;
        this.checkCollisionOfArrows();
        this.checkCharacterJumpingCollisions();
      }, 25),
    );
  }

  /** 
   * Applies whatever damage was queued this tick and updates the health bar. 
   */
  applyDamageFromEnemies() {
    if (this.character.pendingDamage > 0) {
      this.character.applyAccumulatedDamage();
      this.healthBar.setPercentage(this.character.energy);
    }
  }

  /** 
   * Runs the slower collision checks: enemy attacks, contact damage and pickups. 
   */
  checkCollisions() {
    this.checkEnemyWalkingCollisions(this.level.enemies);
    this.checkCharacterWalkingCollisions();
    this.checkEndbossCollisionWhileCharacterIsJumping();
    this.checkCollisionsWithCollectibles(this.level.arrows, this.quiver);
    this.checkCollisionsWithCollectibles(this.level.coins, this.coinBar);
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
    if ((enemy instanceof Troll_1 || enemy instanceof Troll_2) && !this.character.isHurt()) {
      if (this.character.isEncounteringObstacle(enemy) && !this.character.isWalking && !enemy.isAttacking && !enemy.dead && timeSinceLastAttack > 1000) {
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
    if (enemy instanceof Endboss && !this.character.isHurt()) {
      if (this.character.isEncounteringEndboss(enemy) && !this.character.isWalking && !enemy.isAttacking && !enemy.dead && timeSinceLastAttack > 800) {
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
    this.level.enemies.forEach((enemy) => {
      if (!(enemy instanceof Endboss)) {
        if (this.character.isCollidingVertically(enemy) && this.isStompingBody(enemy) && this.character.isAboveGround() && !this.character.dead && !enemy.dead) {
          this.character.bounce();
          enemy.energy = 0;
          enemy.checkIfEnemyIsDead();
          enemy.isAttacking = false;
        }
      }
    });
  }

  /**
   * Reports whether the character is over the enemy's body rather than its sprite's empty edges.
   *
   * @param {MovableObject} enemy - The enemy being landed on.
   * @returns {boolean} - True when the character is centred over the body.
   */
  isStompingBody(enemy) {
    let characterCenterX = this.character.x + this.character.width / 2;
    let stompOffset = enemy.getStompOffset();
    return characterCenterX > enemy.x + stompOffset.left && characterCenterX < enemy.x + enemy.width - stompOffset.right;
  }

  /**
   * Deals contact damage when the character walks into an enemy, once per contact.
   */
  checkCharacterWalkingCollisions() {
    this.level.enemies.forEach((enemy) => {
      if (this.checkWalkingCollisionStatus(enemy)) {
        this.character.addPendingDamage(enemy, 20);
        this.character.lastAttacker = enemy;
        enemy.hasDealtDamage = true;
      }
      if (!this.character.isColliding(enemy) && enemy.hasDealtDamage && !enemy.isAttacking) {
        enemy.hasDealtDamage = false;
      }
    });
  }

  /**
   * Deals endboss contact damage while the character is airborne.
   */
  checkEndbossCollisionWhileCharacterIsJumping() {
    this.level.enemies.forEach((enemy) => {
      if (!(enemy instanceof Endboss) || enemy.dead) return;
      if (this.character.isAboveGround() && this.character.isColliding(enemy) && !this.character.isHurt() && !enemy.hasDealtDamage) {
        this.character.addPendingDamage(enemy, 20);
        this.character.lastAttacker = enemy;
        enemy.hasDealtDamage = true;
      }
      if (!this.character.isColliding(enemy) && enemy.hasDealtDamage && !enemy.isAttacking) {
        enemy.hasDealtDamage = false;
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
      this.character.isColliding(enemy) &&
      this.character.isWalking &&
      !this.character.characterJumping &&
      !this.character.isHurt() &&
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
      if (this.character.isColliding(item)) {
        if (!bar.checkBarPercentage()) {
          array.splice(array.indexOf(item), 1);
          bar.fillBar();
        }
        if (item instanceof Arrow && this.quiver.percentage <= 100 && this.arrowInventory <= 5) {
          this.addAmmunition();
        }
      }
    });
  }

  /**
   * Resolves arrow hits.
   */
  checkCollisionOfArrows() {
    this.level.throwableObjects.slice().forEach((arrow) => {
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
    let hits = this.level.enemies.filter((enemy) => this.canArrowHit(enemy, arrow));
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
    this.level.throwableObjects.splice(this.level.throwableObjects.indexOf(arrow), 1);
  }

  /**
   * Syncs the boss's bar after a hit, ignoring hits on trolls.
   *
   * @param {MovableObject} enemy - The enemy that was just hit.
   */
  updateEndbossHealthBar(enemy) {
    if (enemy instanceof Endboss) {
      this.endbossHealthBar.setPercentage(enemy.energy * 5);
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

  /** 
   * Drops corpses from the level once their death animation has finished. 
   */
  removeDeadEnemies() {
    let deadEnemies = this.level.enemies.filter((enemy) => enemy.delete);
    deadEnemies.forEach((enemy) => this.level.enemies.splice(this.level.enemies.indexOf(enemy), 1));
  }

  /** 
   * Adds one arrow, up to five. 
   */
  addAmmunition() {
    if (this.arrowInventory < 5) {
      this.arrowInventory++;
    }
  }

  /**
   * Spawns an arrow once the character's draw animation has finished.
   */
  checkShootArrow() {
    if (this.character.releaseArrow && this.arrowInventory > 0 && this.character.shotAllowed() && !this.character.isAttacking) {
      let arrowX = this.getArrowX();
      let arrowY = this.character.y + this.character.height - 117;
      let arrow = new ThrowableObject(arrowX, arrowY, this.character.currentDirection);
      arrow.shoot();
      this.level.throwableObjects.push(arrow);
      this.reduceQuiver();
      this.character.releaseArrow = false;
      this.character.shootingTime = new Date().getTime();
      this.checkArrowTrajectory();
    }
  }

  /** 
   * Removes arrows that have hit the ground, checking six times a second.
   */
  checkArrowTrajectory() {
    let checkIfArrowIsFlying = registerInterval(
      setInterval(() => {
        if (this.paused) return;
        this.level.throwableObjects.forEach((arrow) => {
          if (!arrow.isAboveGround()) {
            this.level.throwableObjects.splice(0, 1);
          }
        });
      }, 150),
    );
    this.clearFlyingArrow(checkIfArrowIsFlying);
  }

  /**
   * Stops the trajectory check after 1.1 seconds, which outlasts any arrow's flight.
   *
   * @param {number} checkIfArrowIsFlying - Interval id to clear.
   */
  clearFlyingArrow(checkIfArrowIsFlying) {
    registerInterval(
      setTimeout(() => {
        clearInterval(checkIfArrowIsFlying);
      }, 1100),
    );
  }

  /** 
   * Spends one arrow and takes a segment off the quiver bar. 
   */
  reduceQuiver() {
    this.arrowInventory--;
    this.quiver.depleteBar();
  }

  /**
   * Places the arrow at the bow rather than at the sprite's edge.
   *
   * @returns {number} - Spawn x, offset to whichever side the character faces.
   */
  getArrowX() {
    if (this.character.otherDirection) {
      return this.character.x - 24;
    } else {
      return this.character.x + this.character.width - 21;
    }
  }

  /**
   * Positions the camera for this frame.
   */
  updateCamera() {
    let endboss = this.level.enemies.find((enemy) => enemy instanceof Endboss);
    if (endboss) {
      const endbossRightEdge = endboss.baseX + endboss.walkWidth;
      if (!endboss.activated) return (this.camera_x = -this.character.x + this.cameraOffset);
      this.setCameraOffset(endboss, endbossRightEdge);
      this.targetCameraX = -this.character.x + this.cameraOffset;
      const diff = this.targetCameraX - this.camera_x;
      this.floatCamera(diff, this.targetCameraX);
    } else {
      return (this.camera_x = -this.character.x + 100);
    }
  }

  /**
   * Eases the camera towards its target, snapping once close enough.
   *
   * @param {number} diff - Distance still to cover.
   * @param {number} targetCameraX - Where the camera is heading.
   * @returns {number} - The new camera position.
   */
  floatCamera(diff, targetCameraX) {
    if (Math.abs(diff) < this.lerpThreshold) {
      return (this.camera_x = targetCameraX);
    } else {
      return (this.camera_x += diff * this.cameraLerpFactor);
    }
  }

  /**
   * Re-aims the camera depending on where the character stands relative to the boss's walking range.
   * @param {Endboss} endboss - The boss being framed.
   * @param {number} endbossRightEdge - Right end of the boss's walking range.
   */
  setCameraOffset(endboss, endbossRightEdge) {
    if (this.character.x > endbossRightEdge) {
      this.cameraOffset = endboss.walkWidth;
    } else if (this.character.x < endboss.baseX) {
      this.cameraOffset = 100;
    } else if (this.character.isEncounteringEndboss(endboss)) {
      if (this.character.x > endboss.baseX && this.character.x < endbossRightEdge) {
        this.cameraOffset = endboss.walkWidth / 2;
      }
    }
  }

  /**
   * Paints one frame and schedules the next.
   */
  draw() {
    if (this.paused) return;
    this.updateCamera();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.translate(this.camera_x, 0);
    this.addStaticObjectsToGame();
    this.addMovingObjectsToGame();
    this.ctx.translate(-this.camera_x, 0);
    this.addCharacterBarsToGame();
    let self = this;
    this.animationFrameId = requestAnimationFrame(function () {
      self.draw();
    });
  }

  /**
   * Locks the character's facing to the direction the shot was aimed.
   * 
   * @returns {boolean|undefined} - The facing applied, or undefined outside a draw.
   */
  requestCurrentCharacterDirection() {
    if (this.character.isAttacking && !this.character.releaseArrow) {
      return (this.character.otherDirection = this.character.currentDirection);
    }
  }

  /** 
   * Draws the three bars, after the camera translation has been undone. 
   */
  addCharacterBarsToGame() {
    this.addToMap(this.healthBar);
    this.addToMap(this.quiver);
    this.addToMap(this.coinBar);
    this.addEndbossHealthBarToGame();
  }

  /**
   * Advances the slide and draws the boss's bar, once the fight has started.
   */
  addEndbossHealthBarToGame() {
    if (!this.endbossHealthBar.visible) return;
    this.endbossHealthBar.slideStep();
    this.addToMap(this.endbossHealthBar);
  }

  /** 
   * Draws the scenery and collectibles, behind everything that moves. 
   */
  addStaticObjectsToGame() {
    this.addObjectsToMap(this.level.backgroundObjects);
    this.addObjectsToMap(this.level.throwableObjects);
    this.addObjectsToMap(this.level.coins);
    this.addObjectsToMap(this.level.arrows);
  }

  /** 
   * Draws the enemies and the character on top of the scenery. 
   */
  addMovingObjectsToGame() {
    this.requestCurrentCharacterDirection();
    this.addObjectsToMap(this.level.enemies);
    this.addToMap(this.character);
  }

  /**
   * Draws a list of objects.
   *
   * @param {MovableObject[]} objects - What to draw.
   */
  addObjectsToMap(objects) {
    objects.forEach((obj) => {
      if (obj instanceof Arrow || obj instanceof ThrowableObject) {
        obj.drawArrow(this.ctx, obj);
      } else {
        this.addToMap(obj);
      }
    });
  }

  /**
   * Draws one object, mirrored if it faces left.
   *
   * @param {MovableObject} mo - The object to draw.
   */
  addToMap(mo) {
    if (mo.otherDirection) {
      this.flipImage(mo);
    }
    mo.draw(this.ctx);
    if (mo.otherDirection) {
      this.flipImageBack(mo);
    }
  }

  /**
   * Mirrors the canvas so a left-facing sprite can be drawn from its right-facing frames.
   *
   * @param {MovableObject} mo - The object being mirrored.
   */
  flipImage(mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x = mo.x * -1;
  }

  /**
   * Restores the canvas and the object's real x.
   *
   * @param {MovableObject} mo - The object that was mirrored.
   */
  flipImageBack(mo) {
    this.ctx.restore();
    mo.x = mo.x * -1;
  }
}
