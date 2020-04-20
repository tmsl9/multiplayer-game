export default class Bullet extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, type) {
        super(scene, x, y, "bullet" + type);

        this.scene.add.existing(this);

        this.scene.physics.world.enable(this);

        this.id;

        this.type = type
        //this.power = 10;
        this.power = 0;
        this.baseVelocity = 350;
        this.fireRate = 350;
    }

    fire(x, y, type) {
        this.type = type
        this.typeBullet()
        const dx = x - this.x;
        const dy = y - this.y;
        const alpha = Math.atan2(dy, dx);
        const vx = this.baseVelocity * Math.cos(alpha);
        const vy = this.baseVelocity * Math.sin(alpha);
        const angle = alpha * 180 / Math.PI
        this.setAngle(angle)
        this.setVelocityX(vx);
        this.setVelocityY(vy);
        this.setActive(true);
        this.setVisible(true);
    }
    
    typeBullet(){
        this.setTexture("bullet" + this.type)
        switch(this.type){
            case 1:
                this.power = 30
                this.baseVelocity = 350
                this.fireRate = 350
                break
            case 2:
                this.power = 10
                this.baseVelocity = 500
                this.fireRate = 350
                break
            case 3:
                this.power = 10
                this.baseVelocity = 350
                this.fireRate = 150
                break
        }
    }

    removeFromScreen() {
        this.x = -100;
        this.setVelocity(0, 0);
    }

    isOutsideCanvas() {
        const width = this.scene.game.config.width;
        const height = this.scene.game.config.height;

        return this.x > width || this.y > height || this.x < 0 || this.y < 0;
    }
}