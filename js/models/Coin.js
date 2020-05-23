export default class Coin extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y){
        super(scene, x, y, "coin");
        scene.add.existing(this);

        this.scene.anims.create({
            key: 'coin',
            frames: this.scene.anims.generateFrameNumbers('coin', {  start: 0, end: 5 }),
            frameRate: 6,
            repeat: 0
        });

        this.on("animationcomplete", ()=>{//listen to when an animation is complete, then run stays at frame 0
            this.setFrame(0)
        })
        
        this.setScale(0.1)
    }

    playAnim(){
        this.play("coin")
    }
    
}