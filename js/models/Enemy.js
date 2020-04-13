import Explosion from './Explosion.js'

export default class Enemy extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {

        var img;

        if(id==1){
            img = "z1";
        }else if(id==2){
            img = "z2";
        }else{
            img = "z3";
        }
        
        super(scene, x, y, img);

        this.imag = img;

        this.scene.add.existing(this);

        //enable physics to sprite
        this.scene.physics.world.enable(this);

        this.setScale(1);

        //this.setGravityY(-10);

        if(id==1){
            //creates animation from spritesheet
            //https://photonstorm.github.io/phaser3-docs/Phaser.Scene.html#anims__anchor
            //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html
            this.scene.anims.create({
                key: 'up', //animation identifier
                //frames to play in animation 
                //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                frames: this.scene.anims.generateFrameNumbers("z1", { start: 3, end: 3 })
            });
            this.scene.anims.create({
                key: 'down', //animation identifier
                //frames to play in animation 
                //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                frames: this.scene.anims.generateFrameNumbers("z1", { start: 0, end: 0 })
            });
            this.scene.anims.create({
                key: 'left', //animation identifier
                //frames to play in animation 
                //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                frames: this.scene.anims.generateFrameNumbers("z1", { start: 1, end: 1 })
            });
            this.scene.anims.create({
                key: 'right', //animation identifier
                //frames to play in animation 
                //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                frames: this.scene.anims.generateFrameNumbers("z1", { start: 2, end: 2 })
            });
            }else if(id==2){
            //creates animation from spritesheet
            //https://photonstorm.github.io/phaser3-docs/Phaser.Scene.html#anims__anchor
            //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html
            this.scene.anims.create({
                key: 'up2', //animation identifier
                //frames to play in animation 
                //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                frames: this.scene.anims.generateFrameNumbers("z2", { start: 3, end: 3 })
            });
            this.scene.anims.create({
                key: 'down2', //animation identifier
                //frames to play in animation 
                //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                frames: this.scene.anims.generateFrameNumbers("z2", { start: 0, end: 0 })
            });
            this.scene.anims.create({
                key: 'left2', //animation identifier
                //frames to play in animation 
                //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                frames: this.scene.anims.generateFrameNumbers("z2", { start: 1, end: 1 })
            });
            this.scene.anims.create({
                key: 'right2', //animation identifier
                //frames to play in animation 
                //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                frames: this.scene.anims.generateFrameNumbers("z2", { start: 2, end: 2 })
            });
            }else{
                //creates animation from spritesheet
                //https://photonstorm.github.io/phaser3-docs/Phaser.Scene.html#anims__anchor
                //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html
                this.scene.anims.create({
                    key: 'up3', //animation identifier
                    //frames to play in animation 
                    //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                    frames: this.scene.anims.generateFrameNumbers("z3", { start: 3, end: 3 })
                });
                this.scene.anims.create({
                    key: 'down3', //animation identifier
                    //frames to play in animation 
                    //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                    frames: this.scene.anims.generateFrameNumbers("z3", { start: 0, end: 0 })
                });
                this.scene.anims.create({
                    key: 'left3', //animation identifier
                    //frames to play in animation 
                    //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                    frames: this.scene.anims.generateFrameNumbers("z3", { start: 1, end: 1 })
                });
                this.scene.anims.create({
                    key: 'right3', //animation identifier
                    //frames to play in animation 
                    //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                    frames: this.scene.anims.generateFrameNumbers("z3", { start: 2, end: 2 })
                });
                }
    
            //executes animation
            if(id==1){
                this.play('down');
            }else if(id==2){
                this.play('down2');
            }else{
                this.play('down3');
            }
    

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