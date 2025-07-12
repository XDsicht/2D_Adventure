class Cloud extends MovableObject {

    height = 100;
    width = 100;

    constructor() {
        super().loadImage('img/5.elements/clouds/1.png');
        this.x = 200 + Math.random() * 500;
        this.y = 30 + Math.random() * 110;
    }
}