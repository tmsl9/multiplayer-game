import Explosion from './Explosion.js'
import Bullet from "./Bullet.js";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, type, id) {
        var img = 'z' + type
        
        super(scene, x, y, img);

        this.img = img;
        this.scene.add.existing(this);

        //enable physics to sprite
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

        this.numBullets = 5;

        this.bulletsMaxsize = 10;

        this.bullets = this.scene.physics.add.group({
            maxSize: this.bulletsMaxsize,
            classType: Bullet
        });

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

        //executes animation
        this.play('down'+this.img);

    }

    removeFromScreen() {
        new Explosion(this.scene, this.x, this.y);
        this.x = -200;
        this.setVelocity(0, 0);
    }

    spawn(id) {
        this.life=100;
        this.id = id;
        this.visible = true;
        this.active = true;
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
            let bullet  = this.bullets.getFirstDead(true, this.x, this.y, this.numBullets < this.bulletsMaxsize ? ++this.numBullets : this.numBullets)
            if (bullet) {
                this.power=this.rangedDamage;
                bullet.fire(pl.x, pl.y);
                bullet.active = true;
                bullet.visible = true;
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

    meeleeAttack(time, player){
        if (this.timeToMeelee < time) {
            player.life -= this.meeleDamage
            this.timeToMeelee = time + this.enemyTimerDelay;
            return true
        }
        return false
    }

    bonusEnemy(player,player2){

    }

    dead() {
        new Explosion(this.scene, this.x, this.y);

        //prevents new collision
        this.x = -100;
        this.y = -100;
    }


}