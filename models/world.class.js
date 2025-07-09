class World {

    character = new Character();
    enemies = [
        new Troll(),
        new Troll(),
        new Troll()
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
        this.ctx.drawImage(this.character.img, this.character.x, this.character.y, this.character.height, this.character.width);
        this.enemies.forEach(enemy => {
            this.ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.height, enemy.width);
        });

        // draw wird immer wieder aufgerufen, damit die Animationen laufen
        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        });
    }
}