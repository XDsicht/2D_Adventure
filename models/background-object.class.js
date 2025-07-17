class BackgroundObject extends MovableObject {
  height = 480;
  width = 720;
  constructor(imagePath, x) {
    super().loadImage(imagePath);
    this.x = x;
    this.y = 480 - this.height; // Angabe der y-Position nicht notwendig, da Canvas-Höhe 480 ist
  }
}
