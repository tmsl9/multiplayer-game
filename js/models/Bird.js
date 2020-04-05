import Bullet from "./Bullet.js";
import Explosion from "./Explosion.js";

export default class Bird extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, id) {
        super(scene, x, y, "bird");

        this.id = id
        
        this.scene.add.existing(this);

        this.scene.physics.world.enable(this);

        this.life = 100;

        this.canBeKilled = true;

        this.bulletsMaxsize = 5;

        this.fireRate = 350;

        this.timeToShoot = 0;

        this.velocity = 200;

        this.bullets = this.scene.physics.add.group({
            maxSize: this.bulletsMaxsize,
            classType: Bullet
        });


        //creates animation from spritesheet
        //https://photonstorm.github.io/phaser3-docs/Phaser.Scene.html#anims__anchor
        //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html
        this.scene.anims.create({
            key: 'flap', //animation identifier
            //frames to play in animation 
            //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
            frames: this.scene.anims.generateFrameNumbers('bird', { start: 0, end: 2 }),
            frameRate: 1,
            repeat: -1 //animation repetition (-1 = infinity)
        });

        //executes animation
        this.play('flap');

    }

    update() {

        this.bullets.children.iterate(function (bullet) {
            if (bullet.isOutsideCanvas()) {
                //bullet.active = false;
                this.bullets.killAndHide(bullet);
            }
        }, this);
        
    }

    fire(time){
        if (this.timeToShoot < time) {
            let bullet  = this.bullets.getFirstDead(true, this.x, this.y)
            if (bullet) {
                if(this.id == 1){
                    bullet.setVelocityX(bullet.baseVelocity);
                }else{
                    bullet.setVelocityX(-bullet.baseVelocity);
                }
                bullet.active = true;
                bullet.visible = true;
            }
        
            this.timeToShoot = time + this.fireRate;

            if (this.bullets.children.size > this.bulletsMaxsize) {
                console.log("Group size failed")
            }

            if (this.fireSound) {
                this.fireSound.play();
            }
        }
    }

    /**
     * create an explosion, decrease one life, prevent a new collision and put the bird off-screen
     */
    dead() {
        new Explosion(this.scene, this.x, this.y);

        //prevents new collision
        this.x = -100;
        this.y = -100;

    }

    /**
     * replace the bird on-screen, change the bird color (tint) and re-enable collisions
     */
    /*revive() {

        this.x = 100;
        this.y = 100;

        let i = 0;
        let repetition = 200
        let changeTint = true;*/

        /**
         * timer to change the bird's color/tint 
         */
        /*this.scene.time.addEvent({
            repeat: repetition,
            loop: false,
            callback: () => {

                //in the last repetition replace the normal color (tint) and re-enables collision
                if (i >= repetition) {
                    this.tint = 0xFFFFFF
                    this.canBeKilled = true;
                } else {

                    if (changeTint) {
                        this.tint = 0xFF0000
                    } else {
                        this.tint = 0xFFFFFF
                    }
                    if (i % 20 == 0) {
                        changeTint = !changeTint;
                    }

                }
                i++
            }
        });
    }*/


}