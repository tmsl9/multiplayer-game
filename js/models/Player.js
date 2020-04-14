import Bullet from "./Bullet.js";
import Explosion from "./Explosion.js";

export default class Player extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, id) {
        var img = "player" + id;

        super(scene, x, y, img);

        this.id = id
        this.img = img
        
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

        this.numBullets = 0;

        this.timeToShoot = 0;

        this.bullets = this.scene.physics.add.group({
            maxSize: this.bulletsMaxsize,
            classType: Bullet
        });

        this.scene.anims.create({
            key: 'up' + this.img,
            frames: this.scene.anims.generateFrameNumbers(this.img, { start: 3, end: 3 })
        });
        this.scene.anims.create({
            key: 'down' + this.img,
            frames: this.scene.anims.generateFrameNumbers(this.img, { start: 0, end: 0 })
        });
        this.scene.anims.create({
            key: 'left' + this.img,
            frames: this.scene.anims.generateFrameNumbers(this.img, { start: 1, end: 1 })
        });
        this.scene.anims.create({
            key: 'right' + this.img,
            frames: this.scene.anims.generateFrameNumbers(this.img, { start: 2, end: 2 })
        });

        this.play('down' + this.img)

    }

    update(time, data) {
        var id = data.id
        this.socket = data.socket
        var cursors = this.defCursors(data)
        this.time = time
        if(this.id == id){
            this.setVelocity(0)
            if (cursors.up.isDown && this.y > this.frame.halfHeight + 6) {///se mudar pra 7 fica um espacinho de sobra
                this.play('up' + this.img)
                this.setVelocityY(-this.velocity);
                this.socket.emit('keyPress',{input:'xy', x:this.x, y:this.y, pos:'up' + this.img});
            }
            if (cursors.down.isDown && this.y < this.sceneHeight - this.frame.halfHeight - 6) {
                this.play('down' + this.img)
                this.setVelocityY(this.velocity);
                this.socket.emit('keyPress',{input:'xy', x:this.x, y:this.y, pos:'down' + this.img});
            }
            if (cursors.left.isDown && this.x > this.frame.halfWidth + 6) {/////funciona se mandarmos vetor com teclas a false ou true
                this.play('left' + this.img)
                this.setVelocityX(-this.velocity);
                this.socket.emit('keyPress',{input:'xy', x:this.x, y:this.y, pos:'left' + this.img});
            }
            if (cursors.right.isDown && this.x < this.sceneWidth - this.frame.halfWidth - 6) {
                this.play('right' + this.img)
                this.setVelocityX(this.velocity);
                this.socket.emit('keyPress',{input:'xy', x:this.x, y:this.y, pos:'right' + this.img});
            }

            this.scene.input.on("pointerdown", this.fire, this)

            
            if (cursors.up.isUp && cursors.down.isUp) {
                this.setVelocityY(0);
                }
            if (cursors.left.isUp && cursors.right.isUp) {
                this.setVelocityX(0);
                }
        }

        this.bullets.children.iterate(function (bullet) {
            if (bullet.isOutsideCanvas()) {
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
                //console.log("bullet removed", idBullet)
                this.bullets.killAndHide(bullet);
                bullet.removeFromScreen();
            }
          }, this);
    }

    fire(pointer){
        var mouseX = Math.floor(pointer.x)
        var mouseY = Math.floor(pointer.y)
        //console.log(mouseX, mouseY)

        if (this.timeToShoot < this.time) {
            let bullet = this.bullets.getFirstDead(true, this.x, this.y, this.numBullets < this.bulletsMaxsize ? ++this.numBullets : this.numBullets)
            
            if (bullet) {
                bullet.fire(mouseX, mouseY)
            }
        
            this.timeToShoot = this.time + this.fireRate;

            if (this.bullets.children.size > this.bulletsMaxsize) {
                //console.log("Group size failed")
            }

            if (this.fireSound) {
                this.fireSound.play();
            }

            this.socket.emit('keyPress',{input:'fight',state:true, mouseX: mouseX, mouseY: mouseY});
        }
    }

    fire2(x, y){
        let bullet  = this.bullets.getFirstDead(true, this.x, this.y, this.numBullets < this.bulletsMaxsize ? ++this.numBullets : this.numBullets)
        
        if (bullet) {
            bullet.fire(x, y)
        }
    
        if (this.fireSound) {
            this.fireSound.play();
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