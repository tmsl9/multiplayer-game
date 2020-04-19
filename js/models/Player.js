import Explosion from "./Explosion.js";
import BulletsGroup from "./BulletsGroup.js";
import shop from "../scene/Shop.js";

export default class Player extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, id) {
        var img = "player" + id;

        super(scene, x, y, img);

        this.id = id

        this.img = img
        
        this.scene = scene

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

        this.bullets = new BulletsGroup(this.scene.physics.world, this.scene)

        this.bulletsMaxsize = this.bullets.maxSize;
           
        this.typeBullets = 0

        this.numBullets = 0;

        this.timeToShoot = 0;

        this.upAnim = 'up' + this.img
        this.downAnim = 'down' + this.img
        this.leftAnim = 'left' + this.img
        this.rightAnim = 'right' + this.img

        this.scene.anims.create({
            key: this.upAnim,
            frameRate: 8,
            frames: this.scene.anims.generateFrameNumbers(this.img, { start: 9, end: 11 })
        });
        this.scene.anims.create({
            key: this.downAnim,
            frameRate: 8,
            frames: this.scene.anims.generateFrameNumbers(this.img, { start: 0, end: 2 })
        });
        this.scene.anims.create({
            key: this.leftAnim,
            frameRate: 8,
            frames: this.scene.anims.generateFrameNumbers(this.img, { start: 3, end: 5 })
        });
        this.scene.anims.create({
            key:  this.rightAnim,
            frameRate: 8,
            frames: this.scene.anims.generateFrameNumbers(this.img, { start: 6, end: 8 })
        });
        
        this.pos = this.downAnim

        this.play(this.pos)

        this.shopNum = 0
        this.timeToShop = 0
        this.delayShop = 1000
    }

    update(time, data) {
        var id = data.id
        this.socket = data.socket
        var cursors = this.defCursors(data)
        this.time = time
        if(this.id == id){
            this.setVelocity(0)
            if (cursors.up.isDown && this.y > this.frame.halfHeight + 6) {///se mudar pra 7 fica um espacinho de sobra
                this.playAnim(this.upAnim)
                this.setVelocityY(-this.velocity);
                this.socket.emit('keyPress',{input:'xy', x:this.x, y:this.y, pos:this.pos});
            }
            if (cursors.down.isDown && this.y < this.sceneHeight - this.frame.halfHeight - 6) {
                this.playAnim(this.downAnim)
                this.setVelocityY(this.velocity);
                this.socket.emit('keyPress',{input:'xy', x:this.x, y:this.y, pos:this.pos});
            }
            if (cursors.left.isDown && this.x > this.frame.halfWidth + 6) {/////funciona se mandarmos vetor com teclas a false ou true
                this.playAnim(this.leftAnim)
                this.setVelocityX(-this.velocity);
                this.socket.emit('keyPress',{input:'xy', x:this.x, y:this.y, pos:this.pos});
            }
            if (cursors.right.isDown && this.x < this.sceneWidth - this.frame.halfWidth - 6) {
                this.playAnim(this.rightAnim)
                this.setVelocityX(this.velocity);
                this.socket.emit('keyPress',{input:'xy', x:this.x, y:this.y, pos:this.pos});
            }

            this.scene.input.on("pointerdown", this.fire, this)
            
            if (cursors.up.isUp && cursors.down.isUp) {
                this.setVelocityY(0);
            }
            if (cursors.left.isUp && cursors.right.isUp) {
                this.setVelocityX(0);
            }

            if(cursors.shop.isDown && this.timeToShop < this.time){
                if(!this.scene.scene.isActive("Shop" + this.shopNum)){
                    this.shopNum++
                    console.log(this.id, this.shopNum)
                    this.timeToShop = this.time + this.delayShop
                    this.scene.scene.add("Shop"+this.shopNum, new shop("Shop"+this.shopNum,this), true)
                }else{
                    this.scene.scene.stop("Shop" + this.shopNum)
                    this.timeToShop = this.time + this.delayShop
                }
            }
        }

        this.bullets.children.iterate(function (bullet) {
            if (bullet.isOutsideCanvas()) {
                this.bullets.killAndHide(bullet);
            }
        }, this);
    }

    playAnim(posAnim){
        this.pos = posAnim
        if(!this.anims.isPlaying){
            this.play(this.pos)
        }
        if(this.anims.isPlaying && !(this.anims.currentAnim.key === this.pos)){
            this.play(this.pos)
        }
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
                bullet.active = false
                bullet.visible = false
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
            let bullet = this.bullets.getFirstDead(true, this.x, this.y, this.typeBullet)
            
            if (bullet) {
                bullet.fire(mouseX, mouseY, this.typeBullets)
            
                this.timeToShoot = this.time + bullet.fireRate;

                if (this.bullets.children.size > this.bulletsMaxsize) {
                    //console.log("Group size failed")
                }

                if (this.fireSound) {
                    this.fireSound.play();
                }

                this.socket.emit('keyPress',{input:'fight', state:true, mouseX: mouseX, mouseY: mouseY, idBullet: bullet.id});
            }
        }
    }

    fire2(x, y, idBullet){
        this.bullets.children.iterate(function(bullet){
            if(bullet.id == idBullet){
                bullet.x = this.x
                bullet.y = this.y
                bullet.fire(x, y, this.typeBullets)////testar
            }
        }, this)
    
        if (this.fireSound) {
            this.fireSound.play();
        }
    }

    earnMoney(type){
        if(type == 3){
            this.money += 30
        }else{
            this.money += 10
        }
    }

    buyPowerUp(n){
        this.scene.moneyLabel.setText(this.money)
        if(n != 4){
            this.typeBullets = n
            this.socket.emit("typeBullets", {typeBullets: n})
        }else{
            this.life + 50 <= 100 ? this.life += 50 : this.life = 100
            this.scene.myLifeLabel.setText("Player " + this.id + ": " + this.life)
            this.socket.emit("life", {life:this.life})
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
    
    finish(){
        if(this.scene.scene.isActive("Shop" + this.shopNum)){
            this.scene.scene.stop("Shop" + this.shopNum)
        }
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