class MovableObject {
    x = 120;
    y = 300;
    img;
    height = 150;
    width = 200;

    // loadImage('img/test.png');
    loadImage(path) {
        this.img = new Image(); // this.img = document.getElementById("image"); <img id="image">
        this.img.src = path;
    }

    moveRight() {
        console.log("move right");
    }

    moveLeft() {
    }
}