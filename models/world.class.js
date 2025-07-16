class World {

    character = new Character();
    enemies = [
        new Troll(),
        new Troll(),
        new Troll()
    ];
    clouds = [
        new Cloud(),
        new Cloud(),
        new Cloud(),
    ];
    backgroundObjects = [
        new BackgroundObject('img/5.elements/background/1.png', 0),
        new BackgroundObject('img/5.elements/background/2.png', 0),
        new BackgroundObject('img/5.elements/background/3.png', 0),
        new BackgroundObject('img/5.elements/background/4.png', 0),
        new BackgroundObject('img/5.elements/background/5.png', 0),
    ];
    canvas;
    ctx;

    constructor(canvas) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.draw();
    }



    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Canvas leeren
        this.addObjectsToMap(this.backgroundObjects);
        this.addToMap(this.character);
        this.addObjectsToMap(this.clouds);
        this.addObjectsToMap(this.enemies);

        // draw wird immer wieder aufgerufen, damit die Animationen laufen
        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        });

    }

    addObjectsToMap(objects) {
        objects.forEach(obj => {
            this.addToMap(obj);
        });
    }

    addToMap(mo) {
        this.ctx.drawImage(mo.img, mo.x, mo.y, mo.width, mo.height,);
    }
}