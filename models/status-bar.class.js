class StatusBar extends DrawableObject {
    width = 200;
    height = 60;
    percentage = 100;
    x = 25;

    constructor() {
        super(); // initialisiert die Funktionen des übergeordneten Objekts
    }

    setPercentage(percentage) {
        this.percentage = percentage; // => 0...5
        // let imageIndex = parseInt(percentage / 20);
        // let path = this.IMAGES[imageIndex];
        let path = this.IMAGES[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }

    resolveImageIndex() {
        if (this.percentage == 100) {
            return 5;
        } else if (this.percentage >= 80) {
            return 4;
        } else if (this.percentage >= 60) {
            return 3;
        } else if (this.percentage >= 40) {
            return 2;
        } else if (this.percentage >= 20) {
            return 1;
        } else {
            return 0;
        }
    }

    fillBar() {
        this.percentage += 20;
        if (this.percentage > 100) {
            this.percentage = 100;
        }
        this.setPercentage(this.percentage);
    }

    depleteBar() {
        this.percentage -= 20;
        if (this.percentage < 0) {
            this.percentage = 0;
        }
        this.setPercentage(this.percentage);
    }

    checkBarPercentage() {
        if (this.percentage === 100) {
            return true;
        }
    }
}