class Cloud extends MovableObject {
    y = 30;
    height = 100;
    width = 100;

    constructor() {
        super().loadImage('img/5.elements/clouds/1.png');
        this.x = 200 + Math.random() * 500;
        this.animate();
    }

    animate() {
        setInterval(() => {
            this.x -= 0.15;
        }, 1000 / 60);
    }
}