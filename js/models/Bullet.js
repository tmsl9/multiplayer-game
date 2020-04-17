export default class Bullet extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, type) {
        super(scene, x, y, "bullet" + type);

        this.scene.add.existing(this);

        this.scene.physics.world.enable(this);

        this.id;

        this.type = type
        this.power = 10;
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
        this.active = true;
        this.visible = true;
    }
    
    typeBullet(){
        /*if(this.type > 0){//bala do tipo seguinte fica mantém a melhoria do anterior
            this.setTexture("bullet" + this.type)
            this.power += 40
        }
        if(this.type > 1){
            this.baseVelocity += 50
        }
        if(this.type > 2){
            this.fireRate -= 100
        }*/

        this.setTexture("bullet" + this.type)///cada tipo tem uma melhoria
        switch(this.type){
            case 1:
                this.power = 50
                break
            case 2:
                this.baseVelocity = 500
                break
            case 3:
                this.fireRate = 200
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