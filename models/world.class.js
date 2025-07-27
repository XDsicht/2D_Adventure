class World {
  character = new Character();
  enemies = [new Troll(), new Troll(), new Troll()];
  clouds = [new Cloud(), new Cloud(), new Cloud()];
  backgroundObjects = [
    new BackgroundObject("img/5.elements/background/1.png", -720),
    new BackgroundObject("img/5.elements/background/2.png", -720),
    new BackgroundObject("img/5.elements/background/3.png", -720),
    new BackgroundObject("img/5.elements/background/4.png", -720),
    new BackgroundObject("img/5.elements/background/5.png", -720),
    new BackgroundObject("img/5.elements/background/1.png", 0),
    new BackgroundObject("img/5.elements/background/2.png", 0),
    new BackgroundObject("img/5.elements/background/3.png", 0),
    new BackgroundObject("img/5.elements/background/4.png", 0),
    new BackgroundObject("img/5.elements/background/5.png", 0),
    new BackgroundObject("img/5.elements/background/1.png", 720),
    new BackgroundObject("img/5.elements/background/2.png", 720),
    new BackgroundObject("img/5.elements/background/3.png", 720),
    new BackgroundObject("img/5.elements/background/4.png", 720),
    new BackgroundObject("img/5.elements/background/5.png", 720),
    new BackgroundObject("img/5.elements/background/1.png", 1440),
    new BackgroundObject("img/5.elements/background/2.png", 1440),
    new BackgroundObject("img/5.elements/background/3.png", 1440),
    new BackgroundObject("img/5.elements/background/4.png", 1440),
    new BackgroundObject("img/5.elements/background/5.png", 1440),
    new BackgroundObject("img/5.elements/background/1.png", 2160),
    new BackgroundObject("img/5.elements/background/2.png", 2160),
    new BackgroundObject("img/5.elements/background/3.png", 2160),
    new BackgroundObject("img/5.elements/background/4.png", 2160),
    new BackgroundObject("img/5.elements/background/5.png", 2160),
  ];
  canvas;
  ctx;
  keyboard;
  camera_x = 0;


  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.draw();
    this.setWorld();
  }

  setWorld() {
    this.character.world = this;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Canvas leeren
    this.ctx.translate(this.camera_x, 0); // Kamera verschieben
    this.addObjectsToMap(this.backgroundObjects);
    this.addToMap(this.character);
    this.addObjectsToMap(this.clouds);
    this.addObjectsToMap(this.enemies);
    this.ctx.translate(-this.camera_x, 0); // Kamera zurücksetzen

    // draw wird immer wieder aufgerufen, damit die Animationen laufen
    let self = this;
    requestAnimationFrame(function () {
      self.draw();
    });
  }

  addObjectsToMap(objects) {
    objects.forEach((obj) => {
      this.addToMap(obj);
    });
  }

  addToMap(mo) {
    if (mo.otherDirection) {
      this.ctx.save(); // Save the current state of the canvas
      this.ctx.translate(mo.width, 0); // Translate to flip the image
      this.ctx.scale(-1, 1); // Flip horizontally
      mo.x = mo.x * -1; // Adjust the x position for flipped image
    }
    this.ctx.drawImage(mo.img, mo.x, mo.y, mo.width, mo.height);
    if (mo.otherDirection) {
      mo.x = mo.x * -1; // Adjust the x position for flipped image
      this.ctx.restore(); // Restore the original state of the canvas
    }
  }
}
