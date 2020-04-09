import Bullet from "./Bullet.js";
import Explosion from "./Explosion.js";

export default class Player extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, id) {
        console.log("Id",id)
        
        var img;

        if(id==1){
            img = "player1";
        }else{
            img = "player2";
        }

        console.log(img)

        super(scene, x, y,img);

        this.imag = img;

        this.id = id
        
        this.scene.add.existing(this);

        this.scene.physics.world.enable(this);

        this.sceneWidth = this.scene.game.config.width;
        this.sceneHeight = this.scene.game.config.height;

        this.life = 100;

        this.canBeKilled = true;

        this.bulletsMaxsize = 5;

        this.fireRate = 350;

        this.timeToShoot = 0;

        this.velocity = 200;

        this.pos = "down";

        this.bullets = this.scene.physics.add.group({
            maxSize: this.bulletsMaxsize,
            classType: Bullet
        });

        //creates animation from spritesheet
        //https://photonstorm.github.io/phaser3-docs/Phaser.Scene.html#anims__anchor
        //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html
        this.scene.anims.create({
            key: 'up', //animation identifier
            //frames to play in animation 
            //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
            frames: this.scene.anims.generateFrameNumbers(this.imag, { start: 3, end: 3 })
        });
        this.scene.anims.create({
            key: 'down', //animation identifier
            //frames to play in animation 
            //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
            frames: this.scene.anims.generateFrameNumbers(this.imag, { start: 0, end: 0 })
        });
        this.scene.anims.create({
            key: 'left', //animation identifier
            //frames to play in animation 
            //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
            frames: this.scene.anims.generateFrameNumbers(this.imag, { start: 1, end: 1 })
        });
        this.scene.anims.create({
            key: 'right', //animation identifier
            //frames to play in animation 
            //https://photonstorm.github.io/phaser3-docs/Phaser.Animations.AnimationManager.html#generateFrameNumbers__anchor
            frames: this.scene.anims.generateFrameNumbers(this.imag, { start: 2, end: 2 })
        });

        //executes animation
        this.play('down');

    }

    update(time, cursors, socket, id, player2) {
        if(this.id == id){
            this.setVelocity(0)
            if (cursors.up.isDown && this.y > this.frame.halfHeight + 6) {///se mudar pra 7 fica um espacinho de sobra
                this.play('up');
                this.setVelocityY(-this.velocity);
                this.pos="up";
                socket.emit('keyPress',{input:'xy', x:this.x, y:this.y, pos:"up"});
            }
            if (cursors.down.isDown && this.y < this.sceneHeight - this.frame.halfHeight - 6) {
                this.play('down');
                this.setVelocityY(this.velocity);
                this.pos="down";
                socket.emit('keyPress',{input:'xy', x:this.x, y:this.y, pos:"down"});
            }
            if (cursors.left.isDown && this.x > this.frame.halfWidth + 6) {/////funciona se mandarmos vetor com teclas a false ou true
                this.play('left');
                this.setVelocityX(-this.velocity);
                this.pos="left";
                socket.emit('keyPress',{input:'xy', x:this.x, y:this.y, pos:"left"});
            }
            if (cursors.right.isDown && this.x < this.sceneWidth - this.frame.halfWidth - 6) {
                this.play('right');
                this.setVelocityX(this.velocity);
                this.pos="right";
                socket.emit('keyPress',{input:'xy', x:this.x, y:this.y, pos:"right"});
            }
            if (cursors.space.isDown) {
                this.fire(time);
                socket.emit('keyPress',{input:'space',state:true});
            }

            /////////////////////////////////pode nao ser preciso pois em cima tem o setVelocity(0)
            if (cursors.up.isUp && cursors.down.isUp) {
                this.setVelocityY(0);
                socket.emit('keyPress',{input:'xy', x:this.x, y:this.y, pos:this.pos});
            }
            if (cursors.left.isUp && cursors.right.isUp) {/////funciona se mandarmos vetor com teclas a false ou true
                this.setVelocityX(0);
                socket.emit('keyPress',{input:'xy', x:this.x, y:this.y, pos:this.pos});
            }
            if (cursors.space.isUp) {
                socket.emit('keyPress',{input:'space',state:false});
            }
        }

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