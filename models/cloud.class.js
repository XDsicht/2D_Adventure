class Cloud extends MovableObject {
  y = 30;
  height = 120;
  width = 120;

  constructor() {
    super().loadImage("img/5.elements/clouds/1.png");
    this.x = 200 + Math.random() * 500;
    this.animate();
  }

  animate() {
    setInterval(() => this.moveLeft(), 1000 / 60);
  }

}
