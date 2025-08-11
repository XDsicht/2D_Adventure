class DrawableObject {
    img;
    imageCache = {};
    currentImage = 0;
    x = 120;
    y = 300;
    height = 150;
    width = 200;

    // loadImage('img/test.png');
    loadImage(path) {
        this.img = new Image(); // this.img = document.getElementById("image"); <img id="image">
        this.img.src = path;
    }

    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            img.style = 'transform: scale(-1)';
            this.imageCache[path] = img;
        });
    }
}