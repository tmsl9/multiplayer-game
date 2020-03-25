export default class Explosion extends Phaser.Physics.Arcade.Sprite {

    constructor(scene,x,y){
        super(scene,x,y,"explosion");
        scene.add.existing(this);

        this.explosion=this.scene.anims.create({
            key: 'explosion', //animation identifier
            //frames to play in animation 
            //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
            frames: this.scene.anims.generateFrameNumbers('explosion', { start: 0, end: 31 }),
            frameRate: 60,
            repeat: 0 //animation repetition (-1 = infinity)
        });

        this.play("explosion");
    }
}