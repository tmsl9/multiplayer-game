import Explosion from './Explosion.js'

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
        this.hp = 100;
        this.rangedDamage=20;
        this.meeleDamage=10;
        this.baseVelocity=5;
        this.fireRate=4000;
        this.timeToShoot = 0;
        this.timeToMeelee = 0;
        this.enemyTimerDelay = 2000;

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
    update(time,players){
       this.rangedAttack(players, time);/////attack fazer no server
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

    removeBullet(bullet){
        this.bullets.killAndHide(bullet);
        bullet.removeFromScreen();
    }

    attack(time, players){
        if(this.type==1){
            this.rangedAttack(players,time);
        }else if(this.type==2){
            this.meeleeAttack(players);
        }else if(this.type==3){
            this.bonusEnemy(players);
        }
    }

    rangedAttack(players,time){
        ////console.log(this.timeToShoot, "----", time)
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
            let bullet  = this.bullets.getFirstDead(true, this.x, this.y, 0)
            if (bullet) {
                this.power=this.rangedDamage;
                bullet.fire(pl);
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


}