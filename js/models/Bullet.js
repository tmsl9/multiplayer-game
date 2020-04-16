export default class Bullet extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, id) {
        super(scene, x, y, "bullet");

        this.scene.add.existing(this);

        this.scene.physics.world.enable(this);
        this.id=id;
        this.baseVelocity = 350;
        
        this.power = 10
    }

    updateBullet(id){
        this.id = id
        this.setTexture("bullet" + this.id > 5 ? "z" : this.id)
    }

    fire(x, y, id) {
        this.updateBullet(id)
        const dx = x - this.x;
        const dy = y - this.y;
        const alpha = Math.atan2(dy, dx);
        const vx = this.baseVelocity * Math.cos(alpha);
        const vy = this.baseVelocity * Math.sin(alpha);
        this.setVelocityX(vx);
        this.setVelocityY(vy);
        this.active = true;
        this.visible = true;
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