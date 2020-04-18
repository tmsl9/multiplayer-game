export default class MeleeAttack extends Phaser.Physics.Arcade.Sprite {

    constructor(scene,x,y){
        super(scene,x,y,"playerMelee");
        scene.add.existing(this);

        this.meleeAttack=this.scene.anims.create({
            key: 'playerMelee', //animation identifier
            //frames to play in animation 
            //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
            frames: this.scene.anims.generateFrameNumbers('playerMelee', { start: 0, end: 24 }),
            frameRate: 60,
            repeat: 0 //animation repetition (-1 = infinity)
        });

        this.setScale(0.3)

        this.play("playerMelee");
    }
}