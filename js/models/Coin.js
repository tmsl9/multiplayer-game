export default class Coin extends Phaser.Physics.Arcade.Sprite {

    constructor(scene,x,y){
        super(scene,x,y,"coin");
        scene.add.existing(this);

        this.coin=this.scene.anims.create({
            key: 'coin', //animation identifier
            //frames to play in animation 
            //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
            frames: this.scene.anims.generateFrameNumbers('coin', {  start: 0, end: 5 }),
            frameRate: 6,
            repeat: -1 //animation repetition (-1 = infinity)
        });

        this.play("coin");
    }
}