import Explosion from './Explosion.js'
import Bullet from "./Bullet.js";

export default class Zombie extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, type, id) {
        var img = 'z' + type
        
        super(scene, x, y, img);

        this.scene = scene
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
        this.zombieTimerDelay = 2000;
        this.typeBullet = "z"

        this.timeToUpdatePositions = 0
        this.delayPositions = 300
        
        if(this.type == 1){
            this.bullet = new Bullet(this.scene, -500, -500, this.typeBullet).setActive(false)
            this.bullet.id = 1
        }else{
            this.baseVelocity = 50
        }

        this.updateAnims()

        this.pos = this.downAnim

        this.play(this.pos, 0);
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
        if(this.type == 1){
            this.baseVelocity = 5
        }else{
            this.baseVelocity = 50
        }
    }

    updateAnims(){
        this.upAnim = 'up' + this.img
        this.downAnim = 'down' + this.img
        this.leftAnim = 'left' + this.img
        this.rightAnim = 'right' + this.img
        
        if(!this.scene.anims.exists(this.upAnim)){
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
                key: this.rightAnim,
                frameRate: 8,
                frames: this.scene.anims.generateFrameNumbers(this.img, { start: 6, end: 8 })
            });
        }
    }

    isOutsideCanvas() {
        const width = this.scene.game.config.width;
        const height = this.scene.game.config.height;

        return this.x > width || this.y > height || this.x < 0 || this.y < 0;
    }

    update(time, socket){
       this.bulletOutsideCanvas()
       this.updatePositionsSocket(time, socket)
    }

    updatePositionsSocket(time, socket){
        if(this.timeToUpdatePositions < time){
            socket.emit('zombiePosition', {id:this.id, x:this.x, y:this.y})
            this.timeToUpdatePositions = time + this.delayPositions
        }
    }

    move(pl, socket){
        const dx = pl.x - this.x;
        const dy = pl.y - this.y;
        const alpha = Math.atan2(dy, dx);
        const vx = this.baseVelocity * Math.cos(alpha);
        const vy = this.baseVelocity * Math.sin(alpha);
        if(Math.abs(vx) > Math.abs(vy)){
            vx < 0 ? this.playAnim(this.leftAnim) : this.playAnim(this.rightAnim)
        }else{
            vy < 0 ? this.playAnim(this.upAnim) : this.playAnim(this.downAnim)
        }
        this.setVelocityX(vx);
        this.setVelocityY(vy);
        socket.emit('zombiePosition', {id: this.id, x: this.x, y: this.y})
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

    bulletOutsideCanvas(){
        if (this.bullet.isOutsideCanvas()) {
            this.removeBullet()
        }
    }

    removeBullet(){
        this.bullet.setActive(false)
        this.bullet.setVisible(false)
        this.bullet.removeFromScreen();
    }

    attack(time, players){
        if(this.type == 1 || this.type == 3){
            this.rangedAttack(time, players);
        }
        if(this.type == 2 || this.type == 3){
            this.meeleeAttack(players);
        }
    }
    
    rangedAttack(time, players){
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
            
            this.bullet.x = this.x
            this.bullet.y = this.y
            this.bullet.fire(pl.x, pl.y, this.typeBullet);
        
            this.timeToShoot = time + this.fireRate;

            if (this.fireSound) {
                this.fireSound.play();
            }
        }
    }

    meeleeAttack(time, myPlayer){
        if (this.timeToMeelee < time) {
            myPlayer.life -= this.meeleDamage
            this.timeToMeelee = time + this.zombieTimerDelay;
            return true
        }
        return false
    }

    bonusZombie(myPlayer, otherPlayer){

    }

    dead() {
        new Explosion(this.scene, this.x, this.y);
        this.life = 100
        //prevents new collision
        this.x = -100;
        this.y = -100;
    }
}