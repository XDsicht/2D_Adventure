class MovableObject {
  x = 120;
  y = 300;
  img;
  height = 150;
  width = 200;
  imageCache = {};
  // loadImage('img/test.png');
  loadImage(path) {
    this.img = new Image(); // this.img = document.getElementById("image"); <img id="image">
    this.img.src = path;
  }

  loadImages(arr) {
    arr.forEach((path) => {
      let img = new Image();
      img.src = path;
      this.imageCache[path] = img;
    });
  }

  moveRight() {
    console.log("move right");
  }

  moveLeft() {}
}
