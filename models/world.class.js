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
  /**
   * The rules that decide what overlapping objects do to each other.
   */
  collisions;

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
    this.collisions = new CollisionResolver(this);
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
   * The methods pause() and resume() freeze and unfreeze the world, including the character, enemies and the draw loop. 
   */
  pause() {
    this.paused = true;
    cancelAnimationFrame(this.animationFrameId);
    this.character.pause();
    this.level.enemies.forEach((enemy) => enemy.pause());
    this.level.coins.forEach((coin) => coin.pause());
    this.level.throwableObjects.forEach((arrow) => arrow.pause());
  }

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
        this.collisions.checkCollisions();
        this.collisions.applyDamageFromEnemies();
        this.character.resetDamageAccumulation();
        this.checkShootArrow();
        this.removeDeadEnemies();
        this.removeGroundedArrows();
      }, 100),
    );
  }

  /**
   * Forty times a second: arrow hits, stomps and mid-air contact.
   */
  runFastCollisionLoop() {
    registerInterval(
      setInterval(() => {
        if (this.paused) return;
        this.collisions.checkCollisionOfArrows();
        this.collisions.checkCharacterJumpingCollisions();
        this.collisions.checkAirborneContact();
      }, 25),
    );
  }

  /**
   * Drops arrows that have hit the ground.
   */
  removeGroundedArrows() {
    this.level.throwableObjects = this.level.throwableObjects.filter((arrow) => arrow.isAboveGround());
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
    }
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
      return (this.camera_x = -this.character.x + this.cameraOffset);
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
   * 
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
    let cameraShift = Math.round(this.camera_x);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.translate(cameraShift, 0);
    this.addStaticObjectsToGame();
    this.addMovingObjectsToGame();
    this.ctx.translate(-cameraShift, 0);
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
