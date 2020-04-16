import Explosion from './Explosion.js'
import BulletsGroup from "./BulletsGroup.js";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, type, id) {
        var img = 'z' + type
        
        super(scene, x, y, img);

        this.scene = scene//criar metodo com isto
        this.img = img;
        this.scene.add.existing(this);
        
        this.scene.physics.world.enable(this);
        
        this.id=id;
        this.type=type;
        this.life = 100;
        this.rangedDamage=20;
        this.meeleDamage=10;
        this.baseVelocity=5;
        this.fireRate=4000;
        this.timeToShoot = 0;
        this.timeToMeelee = 0;
        this.enemyTimerDelay = 2000;
        this.typeBullet = "z"

        this.numBullets = 5;
        
        this.bullets = new BulletsGroup(this.scene.physics.world, this.scene)

        this.bulletsMaxsize = this.bullets.maxSize + this.numBullets;

        this.updateAnims()

        //executes animation
        this.play('down'+this.img, true);

    }

    removeFromScreen() {
        new Explosion(this.scene, this.x, this.y);
        this.x = -200;
        this.setVelocity(0, 0);
    }

    spawn(id, type) {
        this.life = 100;
        this.id = id;
        this.type = type
        this.img = "z" + this.type
        this.updateAnims()
        this.visible = true;
        this.active = true;
    }

    updateAnims(){
        if(!this.scene.anims.exists('up' + this.img)){
            this.scene.anims.create({
                key: 'up'+this.img,
                frames: this.scene.anims.generateFrameNumbers(this.img, { start: 3, end: 3 })
            });
            this.scene.anims.create({
                key: 'down'+this.img,
                frames: this.scene.anims.generateFrameNumbers(this.img, { start: 0, end: 0 })
            });
            this.scene.anims.create({
                key: 'left'+this.img,
                frames: this.scene.anims.generateFrameNumbers(this.img, { start: 1, end: 1 })
            });
            this.scene.anims.create({
                key: 'right'+this.img,
                frames: this.scene.anims.generateFrameNumbers(this.img, { start: 2, end: 2 })
            });
        }
    }

    isOutsideCanvas() {
        const width = this.scene.game.config.width;
        const height = this.scene.game.config.height;

        return this.x > width || this.y > height || this.x < 0 || this.y < 0;
    }

    update(){
       this.bulletOutsideCanvas()
    }

    move(pl, socket){
        const dx = pl.x - this.x;
        const dy = pl.y - this.y;
        const alpha = Math.atan2(dy, dx);
        const vx = this.baseVelocity * Math.cos(alpha);
        const vy = this.baseVelocity * Math.sin(alpha);
        if(Math.abs(vx) > Math.abs(vy)){
            vx < 0 ? this.play('left'+this.img) : this.play('right'+this.img)
        }else{
            vy > 0 ? this.play('down'+this.img) : this.play('up'+this.img)
        }
        this.setVelocityX(vx);
        this.setVelocityY(vy);
        socket.emit('enemyPosition', {id: this.id, x: this.x, y: this.y})
    }

    bulletOutsideCanvas(){
        this.bullets.children.iterate(function (bullet) {
            if (bullet.isOutsideCanvas()) {
                this.bullets.killAndHide(bullet);
            }
        }, this);
    }

    removeBulletz(idBullet){
        this.bullets.children.iterate(function (bullet) {
            if(bullet.id == idBullet){
                //console.log("bullet removed", idBullet)
                this.bullets.killAndHide(bullet);
                bullet.removeFromScreen();
            }
          }, this);
    }

    attack(time, players){
        if(this.type==1){
            this.rangedAttack(time, players);
        }else if(this.type==2){
            this.meeleeAttack(players);
        }else if(this.type==3){
            this.bonusEnemy(players);
        }
    }
    /**
     * comparar se é o meu jogador que está mais perto se for, so no meu ecra ele vai atras de mim, no outro ecra ele com
     * "enemyPosition" linha 96, o server envia a info envia a info para ele, primeiro ve quem esta mais perto depois guarda
     * numa variavel o id do player que ele tem que ir atras e dps envia a info para o que esta mais longe, no playGame o
     * player mais longe receber a info do x e do y do enemy e atualiza como com o player2
     */
    rangedAttack(time, players){
       //console.log(this.timeToShoot, "----", time)
        if (this.timeToShoot < time) {
            var pl
            var minor = 100000
            players.children.iterate(function (player ) {
                var dist = Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y)
                ////console.log("dist-> ", dist, ", id-> ", player.id)
                if(dist < minor){
                    pl = player
                    minor = dist
                }
            }, this);
            
            let bullet  = this.bullets.getFirstDead(true, this.x, this.y, this.typeBullet)
            if (bullet) {
                bullet.fire(pl.x, pl.y, this.typeBullet);
            }

            //console.log("pl.id = ", pl.id, "minor: ", minor)
        
            this.timeToShoot = time + this.fireRate;

            if (this.bullets.children.size > this.bulletsMaxsize) {
                //console.log("Group size failed")
            }

            if (this.fireSound) {
                this.fireSound.play();
            }
        }
    }

    meeleeAttack(time, myPlayer){
        if (this.timeToMeelee < time) {
            myPlayer.life -= this.meeleDamage
            this.timeToMeelee = time + this.enemyTimerDelay;
            return true
        }
        return false
    }

    bonusEnemy(myPlayer, otherPlayer){

    }

    dead() {
        new Explosion(this.scene, this.x, this.y);

        //prevents new collision
        this.x = -100;
        this.y = -100;
    }


}