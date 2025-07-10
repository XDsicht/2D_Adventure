class Cloud extends MovableObject {

    height = 75;
    width = 75;

    constructor() {
        super().loadImage('img/5.elements/clouds/1.png');
        this.x = 200 + Math.random() * 500;
        this.y = 30 + Math.random() * 110;
    }
}