export default class Explosion extends Phaser.Physics.Arcade.Sprite {

    constructor(scene,x,y){
        super(scene,x,y,"explosion");
        scene.add.existing(this);

        this.explosion=this.scene.anims.create({
            key: 'explosion',
            frames: this.scene.anims.generateFrameNumbers('explosion', { start: 0, end: 20 }),
            frameRate: 30,
            repeat: 0
        });

        this.setScale(0.2)
        
        this.play("explosion");
    }
}