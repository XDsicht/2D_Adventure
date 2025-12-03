class World {
  level = level1;
  character = new Character();
  canvas;
  ctx;
  keyboard;
  camera_x = 0;
  healthBar = new HealthBar();
  quiver = new Quiver();
  coinBar = new CoinBar();
  arrowInventory = 0; // Store arrows before shooting

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
  }

  run() {
    setInterval(() => {
      this.checkCollisions();
      this.checkCollisionsOfArrows();
      this.checkShootArrow();
    }, 100);
  }

  checkCollisions() {
    this.level.enemies.forEach((enemy) => {
      if (this.character.isColliding(enemy)) {
        this.character.hit();
        this.healthBar.setPercentage(this.character.energy);
      }
    });
    this.checkCollisionsWithCollectibles(this.level.arrows, this.quiver);
    this.checkCollisionsWithCollectibles(this.level.coins, this.coinBar);
  }

  checkCollisionsWithCollectibles(array, bar) {
    array.forEach((item) => {
      if (this.character.isColliding(item)) {
        if (!bar.checkBarPercentage()) {
          array.splice(array.indexOf(item), 1);
          bar.fillBar();
        }
        if (
          item instanceof Arrow &&
          this.quiver.percentage <= 100 &&
          this.arrowInventory <= 5
        ) {
          this.addAmmunition();
        }
      }
    });
  }

  checkCollisionsOfArrows() {
    this.level.throwableObjects.forEach((arrow) => {
      this.level.enemies.forEach((enemy) => {
        if (arrow.isColliding(enemy)) {
          enemy.hit();
          this.level.throwableObjects.splice(
            this.level.throwableObjects.indexOf(arrow), 1
          );
        }
      });
    });
  }

  addAmmunition() {
    if (this.arrowInventory < 5) {
      this.arrowInventory++; // Simple counter
    }
  }

  checkShootArrow() {
    if (this.character.releaseArrow && this.arrowInventory > 0 && this.character.shotAllowed()) {
      let arrowX;
      if (this.character.otherDirection) {
        arrowX = this.character.x - 24;
      } else {
        arrowX = this.character.x + this.character.width - 21;
      }
      let arrowY = this.character.y + this.character.height - 117;
      let arrow = new ThrowableObject(arrowX, arrowY, this.character.otherDirection);
      arrow.shoot();
      this.level.throwableObjects.push(arrow);
      this.arrowInventory--;
      this.quiver.depleteBar();
      this.character.releaseArrow = false;
      this.character.shootingTime = new Date().getTime();
      let checkIfArrowIsFlying = setInterval(() => {
        if (!this.level.throwableObjects[0].isAboveGround()) {
          this.level.throwableObjects.splice(0, 1);
        }
        // this.checkCollisionsOfArrows();
      }, 150);
      setTimeout(() => {
        clearInterval(checkIfArrowIsFlying);
      }, 1100);
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Canvas leeren
    this.ctx.translate(this.camera_x, 0); // Kamera verschieben // nochmal anschauen und verstehen!!!!
    this.addObjectsToMap(this.level.backgroundObjects);
    this.addObjectsToMap(this.level.clouds);
    this.addObjectsToMap(this.level.throwableObjects);
    // ------ Space for fixed objects ----- //
    this.addObjectsToMap(this.level.coins);
    this.addObjectsToMap(this.level.arrows);
    this.addToMap(this.character);
    this.addObjectsToMap(this.level.enemies);
    this.ctx.translate(-this.camera_x, 0); // Kamera zurücksetzen
    this.addToMap(this.healthBar);
    this.addToMap(this.quiver);
    this.addToMap(this.coinBar);
    // draw wird immer wieder aufgerufen, damit die Animationen laufen
    let self = this;
    requestAnimationFrame(function () {
      self.draw();
    });
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
    // mo.drawOffset(this.ctx);
    if (mo.otherDirection) {
      this.flipImageBack(mo);
    }
  }

  flipImage(mo) {
    this.ctx.save(); // Save the current state of the canvas
    this.ctx.translate(mo.width, 0); // Translate to flip the image
    this.ctx.scale(-1, 1); // Flip horizontally
    mo.x = mo.x * -1; // Adjust the x position for flipped image
  }

  flipImageBack(mo) {
    this.ctx.restore(); // Restore the original state of the canvas
    mo.x = mo.x * -1; // Adjust the x position for flipped image
  }
}
