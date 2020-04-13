import Explosion from './Explosion.js'
import Bullet from "./Bullet.js";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, type,id) {
        super(scene, x, y, "enemy"); // depois fazer if para escolher 1 dos 3 inimigos

        this.scene.add.existing(this);

        //enable physics to sprite
        this.scene.physics.world.enable(this);

        this.setScale(0.5);
        this.id=id;
        this.type=type;
        this.hp = 100;
        this.rangedDamage=20;
        this.meeleDamage=10;
        this.baseVelocity=5;
        this.fireRate=350;
        this.timeToShoot = 0;
        
        this.bullets = this.scene.physics.add.group({
            maxSize: this.bulletsMaxsize,
            classType: Bullet
        });

        //this.setGravityY(-10);

    }

    removeFromScreen() {
        new Explosion(this.scene, this.x, this.y);
        this.x = -200;
        this.setVelocity(0, 0);
    }

    spawn() {
        this.visible = true;
        this.active = true;
    }

    isOutsideCanvas() {
        const width = this.scene.game.config.width;
        const height = this.scene.game.config.height;

        return this.x > width || this.y > height || this.x < 0 || this.y < 0;
    }
    update(time,birds){
        //console.log("id-",this.id,"x-",this.x,"y-",this.y)
       //this.move(birds);
       //this.attack(time,birds);/////attack fazer no server
       
    }

    move(pl, socket){
        
        const dx = pl.x - this.x;
        const dy = pl.y - this.y;
        const alpha = Math.atan2(dy, dx);
        const vx = this.baseVelocity * Math.cos(alpha);
        const vy = this.baseVelocity * Math.sin(alpha);
        this.setVelocityX(vx);
        this.setVelocityY(vy);
        socket.emit('enemyPosition', {id:this.id, x: this.x, y: this.y})
    }

    killbullets(){
        this.bullets.children.iterate(function (bullet) {
            if (bullet.isOutsideCanvas()) {
                //bullet.active = false;
                this.bullets.killAndHide(bullet);
            }
        }, this);
    }

    attack(time, birds){
        if(this.type==1){
            this.rangedAttack(birds,time);
        }else if(this.type==2){
            this.meeleeAttack(birds);
        }else if(this.type==3){
            this.bonusEnemy(birds);
        }
    }

    rangedAttack(birds,time){
        console.log(this.timeToShoot, "----", time)
        if (this.timeToShoot < time) {
            var pl
            var minor = 100000
            birds.children.iterate(function (bird ) {
            var dist = Phaser.Math.Distance.Between(bird.x, bird.y, this.x, this.y)
            console.log("dist-> ", dist, ", id-> ", bird.id)
            if(dist < minor){
                pl = bird
                minor = dist
            }
        }, this);
            let bullet  = this.bullets.getFirstDead(true, this.x, this.y)
            if (bullet) {
                this.power=this.rangedDamage;
                bullet.fire(pl);
                bullet.active = true;
                bullet.visible = true;
            }

            console.log("pl.id = ", pl.id, "minor: ", minor)
        
            this.timeToShoot = time + this.fireRate;

            if (this.bullets.children.size > this.bulletsMaxsize) {
                console.log("Group size failed")
            }

            if (this.fireSound) {
                this.fireSound.play();
            }
        }
        


    }

    meeleeAttack(player,player2){


    }

    bonusEnemy(player,player2){

    }


}