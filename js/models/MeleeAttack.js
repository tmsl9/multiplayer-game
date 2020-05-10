export default class MeleeAttack extends Phaser.Physics.Arcade.Sprite {

    constructor(scene,x,y){
        super(scene,x,y,"playerMelee");
        scene.add.existing(this);

        this.meleeAttack=this.scene.anims.create({
            key: 'playerMelee',
            frames: this.scene.anims.generateFrameNumbers('playerMelee', { start: 0, end: 24 }),
            frameRate: 60,
            repeat: 0
        });

        this.setScale(0.3)

        this.play("playerMelee");
    }
}