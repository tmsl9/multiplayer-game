export default class Bullet extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, type) {

        var img = type == "z" ? "bullet" + type : "bullet"
        
        super(scene, x, y, img);

        this.scene.add.existing(this);

        this.scene.physics.world.enable(this);

        this.id;
        
        this.baseVelocity = 350;
        
        this.power = 10
    }

    fire(x, y, type) {
        this.updateBullet(type)
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
    
    updateBullet(type){
        this.setTexture(type == "z" ? "bulletz" : "bullet")
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