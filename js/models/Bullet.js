export default class Bullet extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, id) {
        super(scene, x, y, id == 0 ? "bulletz" : "bullet");

        this.scene.add.existing(this);
        this.scene.physics.world.enable(this);
        this.id=id;

        this.type = 0;
        this.power = 10;
        this.baseVelocity = 350;
        this.fireRate = 350;
    }

    fire(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        const alpha = Math.atan2(dy, dx);
        const vx = this.baseVelocity * Math.cos(alpha);
        const vy = this.baseVelocity * Math.sin(alpha);
        const angle = alpha * 180 / Math.PI
        this.setVelocityX(vx);
        this.setVelocityY(vy);
        this.setAngle(angle)
        this.active = true;
        this.visible = true;
    }

    characteristics(type){
        this.type = type
        console.log("type", this.type)
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

        this.setTexture(this.type != 0 ? "bullet" + this.type : "bullet")///cada tipo tem uma melhoria
        switch(this.type){
            case 1:
                console.log("1")
                this.power += 40
                break
            case 2:
                console.log("2")
                this.baseVelocity += 50
                break
            case 3:
                console.log("3")
                this.fireRate -= 100
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