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
  throwableObjects = [];



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
      this.checkShootArrow();
    }, 100);
  }

  checkCollisions() {
    this.level.enemies.forEach((enemy) => {
      if (this.character.isColliding(enemy)) {
        this.character.hit();
        this.healthBar.setPercentage(this.character.energy);
        // console.log("Character hit, energy:", this.character.energy);
      }
    });
  }

  checkShootArrow() {
    if (this.keyboard.D) {
      let arrow = new ThrowableObject(this.character.x + this.character.width / 3, this.character.y + this.character.height / 3);
      this.level.throwableObjects.push(arrow);
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Canvas leeren
    this.ctx.translate(this.camera_x, 0); // Kamera verschieben // nochmal anschauen und verstehen!!!!
    this.addObjectsToMap(this.level.backgroundObjects);

    this.ctx.translate(-this.camera_x, 0); // camera back
    this.addObjectsToMap(this.level.clouds);
    this.addObjectsToMap(this.level.throwableObjects);
    // ------ Space for fixed objects ----- //
    this.addToMap(this.healthBar);
    this.addToMap(this.quiver);
    this.addToMap(this.coinBar);
    this.ctx.translate(this.camera_x, 0); // camera forward
    this.addObjectsToMap(this.level.coins);
    this.addObjectsToMap(this.level.arrows);
    this.addToMap(this.character);
    this.addObjectsToMap(this.level.enemies);
    this.ctx.translate(-this.camera_x, 0); // Kamera zurücksetzen

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
    mo.drawOffset(this.ctx);
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
