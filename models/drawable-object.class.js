class DrawableObject {
  img;
  imageCache = {};
  currentImage = 0;
  paused = false;

  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  loadImages(arr) {
    arr.forEach((path) => {
      let img = new Image();
      img.src = path;
      img.style = "transform: scale(-1)";
      this.imageCache[path] = img;
    });
  }

  resetCurrentImage() {
    this.currentImage = 0;
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }
}
