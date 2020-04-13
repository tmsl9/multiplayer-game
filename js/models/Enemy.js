import Explosion from './Explosion.js'

export default class Enemy extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, id) {
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
                key: 'upz', //animation identifier
                //frames to play in animation 
                //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                frames: this.scene.anims.generateFrameNumbers("z1", { start: 3, end: 3 })
            });
            this.scene.anims.create({
                key: 'downz', //animation identifier
                //frames to play in animation 
                //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                frames: this.scene.anims.generateFrameNumbers("z1", { start: 0, end: 0 })
            });
            this.scene.anims.create({
                key: 'leftz', //animation identifier
                //frames to play in animation 
                //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                frames: this.scene.anims.generateFrameNumbers("z1", { start: 1, end: 1 })
            });
            this.scene.anims.create({
                key: 'rightz', //animation identifier
                //frames to play in animation 
                //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                frames: this.scene.anims.generateFrameNumbers("z1", { start: 2, end: 2 })
            });
            }else if(id==2){
            //creates animation from spritesheet
            //https://photonstorm.github.io/phaser3-docs/Phaser.Scene.html#anims__anchor
            //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html
            this.scene.anims.create({
                key: 'upz2', //animation identifier
                //frames to play in animation 
                //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                frames: this.scene.anims.generateFrameNumbers("z2", { start: 3, end: 3 })
            });
            this.scene.anims.create({
                key: 'downz2', //animation identifier
                //frames to play in animation 
                //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                frames: this.scene.anims.generateFrameNumbers("z2", { start: 0, end: 0 })
            });
            this.scene.anims.create({
                key: 'leftz2', //animation identifier
                //frames to play in animation 
                //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                frames: this.scene.anims.generateFrameNumbers("z2", { start: 1, end: 1 })
            });
            this.scene.anims.create({
                key: 'rightz2', //animation identifier
                //frames to play in animation 
                //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                frames: this.scene.anims.generateFrameNumbers("z2", { start: 2, end: 2 })
            });
            }else{
                //creates animation from spritesheet
                //https://photonstorm.github.io/phaser3-docs/Phaser.Scene.html#anims__anchor
                //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html
                this.scene.anims.create({
                    key: 'upz3', //animation identifier
                    //frames to play in animation 
                    //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                    frames: this.scene.anims.generateFrameNumbers("z3", { start: 3, end: 3 })
                });
                this.scene.anims.create({
                    key: 'downz3', //animation identifier
                    //frames to play in animation 
                    //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                    frames: this.scene.anims.generateFrameNumbers("z3", { start: 0, end: 0 })
                });
                this.scene.anims.create({
                    key: 'leftz3', //animation identifier
                    //frames to play in animation 
                    //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                    frames: this.scene.anims.generateFrameNumbers("z3", { start: 1, end: 1 })
                });
                this.scene.anims.create({
                    key: 'rightz3', //animation identifier
                    //frames to play in animation 
                    //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
                    frames: this.scene.anims.generateFrameNumbers("z3", { start: 2, end: 2 })
                });
                }
    
            //executes animation
            if(id==1){
                this.play('downz');
            }else if(id==2){
                this.play('downz2');
            }else{
                this.play('downz3');
            }

        //executes animation
        this.play('downz');

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