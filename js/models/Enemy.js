import Explosion from './Explosion.js'

export default class Enemy extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
        var img = "z1";
        
        super(scene, x, y, img);

        this.imag = img;

        this.scene.add.existing(this);

        //enable physics to sprite
        this.scene.physics.world.enable(this);

        this.setScale(1);

        //this.setGravityY(-10);

        this.scene.anims.create({
            key: 'uup', //animation identifier
            //frames to play in animation 
            //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
            frames: this.scene.anims.generateFrameNumbers(this.imag, { start: 3, end: 3 })
        });
        this.scene.anims.create({
            key: 'ddown', //animation identifier
            //frames to play in animation 
            //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
            frames: this.scene.anims.generateFrameNumbers(this.imag, { start: 0, end: 0 })
        });
        this.scene.anims.create({
            key: 'lleft', //animation identifier
            //frames to play in animation 
            //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
            frames: this.scene.anims.generateFrameNumbers(this.imag, { start: 1, end: 1 })
        });
        this.scene.anims.create({
            key: 'rright', //animation identifier
            //frames to play in animation 
            //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
            frames: this.scene.anims.generateFrameNumbers(this.imag, { start: 2, end: 2 })
        });

        //executes animation
        this.play('ddown');

    }

    removeFromScreen() {
        new Explosion(this.scene, this.x, this.y);
        this.x = -200;
        this.setVelocity(0, 0);
    }

    spawn() {
        this.visible = true;
        this.active = true;
        this.setVelocityX(-100);
    }

    isOutsideCanvas() {
        const width = this.scene.game.config.width;
        const height = this.scene.game.config.height;

        return this.x > width || this.y > height || this.x < 0 || this.y < 0;
    }

}