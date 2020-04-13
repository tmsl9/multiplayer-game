import Bullet from "./Bullet.js";
import Explosion from "./Explosion.js";

export default class Player extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, id) {
        super(scene, x, y, "player");

        this.id = id
        
        this.scene.add.existing(this);

        this.scene.physics.world.enable(this);

        this.sceneWidth = this.scene.game.config.width;
        this.sceneHeight = this.scene.game.config.height;

        this.life = 100;
        this.atacklvl = 1;
        this.velocity = 200;
        this.fireRate = 350;
        this.money = 0;

        this.canBeKilled = true;

        this.bulletsMaxsize = 5;

        this.numBullets = 0

        this.timeToShoot = 0;

        

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
            frames: this.scene.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
            frameRate: 1,
            repeat: -1 //animation repetition (-1 = infinity)
        });

        //executes animation
        this.play('flap');

    }

    update(time, data) {
        var id = data.id
        var socket = data. socket
        var cursors = this.defCursors(data)
        if(this.id == id){
            this.setVelocity(0)
            if (cursors.up.isDown && this.y > this.frame.halfHeight + 6) {///se mudar pra 7 fica um espacinho de sobra
                this.setVelocityY(-this.velocity);
                socket.emit('keyPress',{input:'xy', x:this.x, y:this.y});
            }
            if (cursors.down.isDown && this.y < this.sceneHeight - this.frame.halfHeight - 6) {
                this.setVelocityY(this.velocity);
                socket.emit('keyPress',{input:'xy', x:this.x, y:this.y});
            }
            if (cursors.left.isDown && this.x > this.frame.halfWidth + 6) {/////funciona se mandarmos vetor com teclas a false ou true
                this.setVelocityX(-this.velocity);
                socket.emit('keyPress',{input:'xy', x:this.x, y:this.y});
            }
            if (cursors.right.isDown && this.x < this.sceneWidth - this.frame.halfWidth - 6) {
                this.setVelocityX(this.velocity);
                socket.emit('keyPress',{input:'xy', x:this.x, y:this.y});
            }
            if (cursors.fight.isDown) {
                this.fire(id, time);
                socket.emit('keyPress',{input:'fight',state:true});
            }

            /////////////////////////////////pode nao ser preciso pois em cima tem o setVelocity(0)
            if (cursors.up.isUp && cursors.down.isUp) {
                this.setVelocityY(0);
                socket.emit('keyPress',{input:'xy', x:this.x, y:this.y});
            }
            if (cursors.left.isUp && cursors.right.isUp) {/////funciona se mandarmos vetor com teclas a false ou true
                this.setVelocityX(0);
                socket.emit('keyPress',{input:'xy', x:this.x, y:this.y});
            }
            if (cursors.fight.isUp) {
                socket.emit('keyPress',{input:'fight',state:false});
            }
        }

        this.bullets.children.iterate(function (bullet) {
            if (bullet.isOutsideCanvas()) {
                //bullet.active = false;
                this.bullets.killAndHide(bullet);
            }
        }, this);
    }

    defCursors(data){
        return {
            up: this.scene.input.keyboard.addKey(data.cursors.up.keyCode),
            down: this.scene.input.keyboard.addKey(data.cursors.down.keyCode),
            left: this.scene.input.keyboard.addKey(data.cursors.left.keyCode),
            right: this.scene.input.keyboard.addKey(data.cursors.right.keyCode),
            fight: this.scene.input.keyboard.addKey(data.cursors.fight.keyCode),
            shop: this.scene.input.keyboard.addKey(data.cursors.shop.keyCode)
        }
    }

    removeBullet(idBullet){
        this.bullets.children.iterate(function (bullet) {
            if(bullet.id == idBullet){
                console.log("bullet removed", idBullet)
                this.bullets.killAndHide(bullet);
                bullet.removeFromScreen();
            }
          }, this);
    }

    fire(id, time){
        if (this.timeToShoot < time) {
            let bullet  = this.bullets.getFirstDead(true, this.x, this.y, this.numBullets < this.bulletsMaxsize ? ++this.numBullets : this.numBullets)
            console.log("player new bullet", this.numBullets)
            if (bullet) {
                if(this.id == 1){
                    //this.atacklvl=bullet.power*2;
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
     * create an explosion, decrease one life, prevent a new collision and put the player off-screen
     */
    dead() {
        new Explosion(this.scene, this.x, this.y);

        //prevents new collision
        this.x = -100;
        this.y = -100;

    }

    /**
     * replace the player on-screen, change the player color (tint) and re-enable collisions
     */
    /*revive() {

        this.x = 100;
        this.y = 100;

        let i = 0;
        let repetition = 200
        let changeTint = true;*/

        /**
         * timer to change the player's color/tint 
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