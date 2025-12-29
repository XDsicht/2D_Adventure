class DrawableObject {
    img;
    imageCache = {};
    currentImage = 0;

    // loadImage('img/test.png');
    loadImage(path) {
        this.img = new Image(); // this.img = document.getElementById("image"); <img id="image">
        this.img.src = path;
    }

    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    drawFrame(ctx) {
        if (this instanceof Character || this instanceof Troll || this instanceof Endboss) {
            ctx.beginPath();
            ctx.lineWidth = '5';
            ctx.strokeStyle = 'blue';
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.stroke();
        }
    }


    drawOffset(ctx) {
        if (this instanceof Character || this instanceof Troll || this instanceof Endboss) {
            ctx.beginPath();
            ctx.lineWidth = '4';
            ctx.strokeStyle = 'red';
            ctx.rect(this.x + this.offset.left, this.y + this.offset.top, this.width - this.offset.left - this.offset.right, this.height - this.offset.top - this.offset.bottom);
            ctx.stroke();
        }
    }

    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            img.style = 'transform: scale(-1)';
            this.imageCache[path] = img;
        });
    }

    resetCurrentImage() {
        this.currentImage = 0;
    }
}