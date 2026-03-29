class World {
  level = level1;
  character = new Character();
  canvas;
  ctx;
  keyboard;
  camera_x = 0;
  cameraOffset = 100;
  targetCameraX = 0;
  cameraLerpFactor = 0.1;
  lerpThreshold = 0.4;
  healthBar = new HealthBar();
  quiver = new Quiver();
  coinBar = new CoinBar();
  arrowInventory = 0;
  initialObstacleSpawn = 600;

  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.draw();
    this.setWorld();
    this.run();
  }

  setWorld() {
    this.character.world = this;
    this.level.enemies.forEach((enemy) => {
      enemy.world = this;
      if (enemy instanceof Troll_1 || enemy instanceof Troll_2) {
        enemy.x = enemy.calculateSpawningLocation();
      }
    });
  }

  run() {
    registerInterval(
      setInterval(() => {
        this.checkCollisions();
        this.applyDamageFromEnemies();
        this.character.resetDamageAccumulation();
        this.checkCollisionOfArrows();
        this.checkShootArrow();
        this.removeDeadEnemies();
      }, 100),
    );
  }

  applyDamageFromEnemies() {
    if (this.character.pendingDamage > 0) {
      this.character.applyAccumulatedDamage();
      this.healthBar.setPercentage(this.character.energy);
    }
  }

  checkCollisions() {
    this.checkEnemyWalkingCollisions(this.level.enemies);
    this.checkCharacterJumpingCollisions();
    this.checkCharacterWalkingCollisions();
    this.checkCollisionsWithCollectibles(this.level.arrows, this.quiver);
    this.checkCollisionsWithCollectibles(this.level.coins, this.coinBar);
  }

  checkEnemyWalkingCollisions(enemies) {
    enemies.forEach((enemy) => {
      let timeSinceLastAttack = new Date().getTime() - enemy.lastAttackTime;
      this.handleTrollWalkingCollision(enemy, timeSinceLastAttack);
      this.handleEndbossWalkingCollision(enemy, timeSinceLastAttack);
    });
  }

  handleTrollWalkingCollision(enemy, timeSinceLastAttack) {
    if ((enemy instanceof Troll_1 || enemy instanceof Troll_2) && !this.character.isHurt()) {
      if (this.character.isEncounteringObstacle(enemy) && !this.character.isWalking && !enemy.isAttacking && !enemy.dead && timeSinceLastAttack > 1000) {
        enemy.isAttacking = true;
        enemy.lastAttackTime = new Date().getTime();
        enemy.resetCurrentImage();
      }
    }
  }

  handleEndbossWalkingCollision(enemy, timeSinceLastAttack) {
    if (enemy instanceof Endboss && !this.character.isHurt()) {
      if (this.character.isEncounteringEndboss(enemy) && !this.character.isWalking && !enemy.isAttacking && !enemy.dead && timeSinceLastAttack > 800) {
        enemy.isAttacking = true;
        enemy.lastAttackTime = new Date().getTime();
        enemy.resetCurrentImage();
      }
    }
  }

  checkCharacterJumpingCollisions() {
    this.level.enemies.forEach((enemy) => {
      if (!(enemy instanceof Endboss)) {
        if (this.character.isCollidingVertically(enemy) && this.character.isAboveGround() && !this.character.dead && !enemy.dead) {
          this.character.bounce();
          enemy.isDead();
          enemy.resetCurrentImage();
          enemy.dead = true;
          enemy.isAttacking = false;
        }
      }
    });
  }

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

  checkCollisionOfArrows() {
    this.level.throwableObjects.forEach((arrow) => {
      this.level.enemies.forEach((enemy) => {
        if (!enemy.inFrame()) return;
        if (!this.quiverNotEmpty()) return;
        if (this.checkArrowCollision(enemy, arrow)) return;
      });
    });
  }

  checkArrowCollision(enemy, arrow) {
    if (arrow.isColliding(enemy) && !enemy.dead) {
      if (!this.checkEndbossActive(enemy)) return true;
      enemy.enemySounds.isHitSound.play();
      enemy.hit();
      this.level.throwableObjects.splice(this.level.throwableObjects.indexOf(arrow), 1);
      return true;
    }
  }

  checkEndbossActive(enemy) {
    if (enemy instanceof Endboss) {
      if (!enemy.activated) return false;
    }
    return true;
  }

  quiverNotEmpty() {
    if (this.level.throwableObjects.length == 0) return false;
    return true;
  }

  removeDeadEnemies() {
    let deadEnemies = this.level.enemies.filter((enemy) => enemy.delete);
    deadEnemies.forEach((enemy) => this.level.enemies.splice(this.level.enemies.indexOf(enemy), 1));
  }

  addAmmunition() {
    if (this.arrowInventory < 5) {
      this.arrowInventory++;
    }
  }

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

  checkArrowTrajectory() {
    let checkIfArrowIsFlying = registerInterval(
      setInterval(() => {
        this.level.throwableObjects.forEach((arrow) => {
          if (!arrow.isAboveGround()) {
            this.level.throwableObjects.splice(0, 1);
          }
        });
      }, 150),
    );
    this.clearFlyingArrow(checkIfArrowIsFlying);
  }

  clearFlyingArrow(checkIfArrowIsFlying) {
    registerInterval(
      setTimeout(() => {
        clearInterval(checkIfArrowIsFlying);
      }, 1100),
    );
  }

  reduceQuiver() {
    this.arrowInventory--;
    this.quiver.depleteBar();
  }

  getArrowX() {
    if (this.character.otherDirection) {
      return this.character.x - 24;
    } else {
      return this.character.x + this.character.width - 21;
    }
  }

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

  floatCamera(diff, targetCameraX) {
    if (Math.abs(diff) < this.lerpThreshold) {
      return (this.camera_x = targetCameraX);
    } else {
      return (this.camera_x += diff * this.cameraLerpFactor);
    }
  }

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

  draw() {
    this.updateCamera();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.translate(this.camera_x, 0);
    this.addStaticObjectsToGame();
    this.addMovingObjectsToGame();
    this.ctx.translate(-this.camera_x, 0);
    this.addCharacterBarsToGame();
    let self = this;
    requestAnimationFrame(function () {
      self.draw();
    });
  }

  requestCurrentCharacterDirection() {
    if (this.character.isAttacking && !this.character.releaseArrow) {
      return this.character.otherDirection = this.character.currentDirection;
    }
  }

  addCharacterBarsToGame() {
    this.addToMap(this.healthBar);
    this.addToMap(this.quiver);
    this.addToMap(this.coinBar);
  }

  addStaticObjectsToGame() {
    this.addObjectsToMap(this.level.backgroundObjects);
    this.addObjectsToMap(this.level.clouds);
    this.addObjectsToMap(this.level.throwableObjects);
    this.addObjectsToMap(this.level.coins);
    this.addObjectsToMap(this.level.arrows);
  }

  addMovingObjectsToGame() {
    this.requestCurrentCharacterDirection();
    this.addObjectsToMap(this.level.enemies);
    this.addToMap(this.character);
  }

  addObjectsToMap(objects) {
    objects.forEach((obj) => {
      if (obj instanceof Arrow || obj instanceof ThrowableObject) {
        obj.drawArrow(this.ctx, obj);
      } else {
        this.addToMap(obj);
      }
    });
  }

  addToMap(mo) {
    if (mo.otherDirection) {
      this.flipImage(mo);
    }
    mo.draw(this.ctx);
    mo.drawFrame(this.ctx);
    mo.drawOffset(this.ctx);
    if (mo.otherDirection) {
      this.flipImageBack(mo);
    }
  }

  flipImage(mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x = mo.x * -1;
  }

  flipImageBack(mo) {
    this.ctx.restore();
    mo.x = mo.x * -1;
  }
}
