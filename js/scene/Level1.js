import ZombiesGroup from "../models/ZombiesGroup.js";
import PlayersGroup from "../models/PlayersGroup.js";
import Coin from "../models/Coin.js";

export default class level1 extends Phaser.Scene {
    constructor() {
        super("Level1");
    }

    init(data){
        //console.log("Level1 scene: ", data)
        this.data = data
        this.socket = data.socket
        this.id = data.id
        this.volume = data.volume
        //console.log("volume",this.volume)
    }

    preload(){
        this.load.image("tiles", "assets/tile-map.png");
        this.load.tilemapTiledJSON("map1", "assets/Map1.json");
    }

    create() {
        console.log("Starting game");
        
        this.map = this.make.tilemap({ key: "map1" });
        const tileset = this.map.addTilesetImage("tile-map", "tiles");
        this.map.createStaticLayer("back", tileset, 0, 0);
        this.front = this.map.createStaticLayer("front", tileset, 0, 0);
        this.front.setCollisionByProperty({ "collides": true }, true);
        
        this.players = new PlayersGroup(this.physics.world, this, this.id)
        this.myPlayer = this.players.me
        this.otherPlayer = this.players.other
        
        this.zombies = new ZombiesGroup(this.physics.world, this)

        var textConfig = {font: "30px Cambria", fill: "#ffffff"}
        var lifeLabel1 = this.add.text(20, 20, "Player 1: 100", textConfig);
        var lifeLabel2 = this.add.text(this.game.config.width - 195, 20, "Player 2: 100", textConfig);
        this.myLifeLabel = this.id == 1 ? lifeLabel1 : lifeLabel2
        this.othersLifeLabel = this.id == 1 ? lifeLabel2 : lifeLabel1

        this.coin = new Coin(this, 30, 75, 0)

        this.moneyLabel = this.add.text(45, 58, this.myPlayer.money, textConfig);

        this.currentTime;

        this.themeSound = this.sound.add("theme", { volume: this.volume });

        //this.themeSound.play();

        let fireSound = this.sound.add("fire", {
            volume: this.volume
        });

        this.players.children.iterate(function (player) {
            //player.fireSound = fireSound;
        }, this);

        this.cursors = this.defCursors()

        this.physics.add.collider(this.players, this.front)

        this.zombies.children.iterate(function (zombie) {
            if(zombie.type != 3){
                this.physics.add.collider(this.zombies, this.front)
            }
        }, this);

        this.physics.add.overlap(this.myPlayer, this.zombies, this.myPlayerZombiesCollision, null, this)///colisão inimigos e eu

        this.physics.add.overlap(this.myPlayer, this.otherPlayer.bullets, this.myPlayerOtherPlayerBulletsCollision, null, this)//eu levar com bala

        this.players.children.iterate(this.playersBulletsFrontCollision, this);//colisao balas com arvores

        this.zombies.children.iterate(function (zombie) {
            this.zombiesBulletsFrontCollision(zombie)//balas inimigos com arvores
            this.myPlayerZombiesBulletsCollision(zombie)
        }, this);

        this.physics.add.overlap(this.zombies, this.myPlayer.bullets, this.zombiesMyPlayerBulletsCollision, null, this)

        //recomeçar o jogo quando servidor desligar e voltar a ligar, mas nao funciona bem por causa do servidor
        /*this.socket.on('id', (data)=>{
            this.scene.stop()
            this.scene.start("Play")
        })*/
        
        this.socket.on('zombiePositionCollider', (data) =>{ this.zombiePositionWhenCollides(data) })

        this.socket.on('playerAction', (data)=>{ this.playerActions(data) });

        this.socket.on('life', (data)=>{ this.otherPlayerLife(data) })//se o outro player tiver sido atingido, eu atualizo a vida dele
        
        this.socket.on('typeBullets', (data) =>{ this.otherPlayerTypeBullets(data) })

        this.socket.on('createZombie', (data) =>{ this.createZombie(data) })

        this.socket.on('moveZombie', (data) =>{ this.moveZombie(data) })

        this.socket.on('zombieShoot', (data) =>{ this.zombieMeleeAttack(data) })

        this.socket.on('lifeZombie', (data) =>{ this.zombieLife(data) })
    }
    ///tem bugs que nao deixam o personagem mexer-se mas o anim corre na mesma
    ///as vezes da erro e o dinheiro começa a disparar e o power tem mais de 50, e mata logo o zombie
    update(time) {
        this.currentTime = time
        this.players.children.iterate(function (player) {
            if(player.life > 0){
                player.update(time, this.data)
            }else{
                player.dead()
                this.myPlayer.finish()
                this.otherPlayer.finish()
                this.scene.stop();
                this.themeSound.stop();
                this.socket.emit('Finish')
                this.scene.start('Finish', {id: this.id, socket: this.socket, loserID: player.id})
            }
        }, this);
        
        this.zombies.children.iterate(function (zombie) {
            zombie.update(time, this.players);
            if(zombie.life <= 0){
                zombie.dead();
                this.zombies.killAndHide(zombie);
            }
        }, this);
    }
    
    defCursors(){
        return {
            up: this.input.keyboard.addKey(this.data.cursors.up.keyCode),
            down: this.input.keyboard.addKey(this.data.cursors.down.keyCode),
            left: this.input.keyboard.addKey(this.data.cursors.left.keyCode),
            right: this.input.keyboard.addKey(this.data.cursors.right.keyCode),
            fight: this.input.keyboard.addKey(this.data.cursors.fight.keyCode),
            shop: this.input.keyboard.addKey(this.data.cursors.shop.keyCode)
        }
    }

    myPlayerZombiesCollision(myPlayer, zombie){
        if(zombie.type != 1){
            if(zombie.meeleeAttack(this.currentTime, myPlayer)){
                
                var life = myPlayer.life < 0 ? 0 : myPlayer.life
                this.myLifeLabel.setText("Player " + myPlayer.id + ": " + life)

                this.socket.emit('life', {id:myPlayer.id, life:myPlayer.life})
            }
            this.socket.emit('zombiePosition', {id: zombie.id, x: zombie.x, y: zombie.y, collider: true})
        }
    }

    myPlayerOtherPlayerBulletsCollision(myPlayer, bullet){
        var idBullet = bullet.id

        this.otherPlayer.removeBullet(bullet.id);
        
        myPlayer.life -= bullet.power;

        var life = myPlayer.life < 0 ? 0 : myPlayer.life
        this.myLifeLabel.setText("Player " + myPlayer.id + ": " + life)
        
        this.socket.emit('life', {id:myPlayer.id, life:myPlayer.life, idBullet:idBullet})
    }

    playersBulletsFrontCollision(player) {
        this.physics.add.collider(player.bullets, this.front, (bullet, front) =>{
            player.removeBullet(bullet.id)
        })
    }

    zombiesBulletsFrontCollision(zombie){
        if(zombie.type == 1){
            this.physics.add.collider(zombie.bullet, this.front, (bullet, front) =>{
                zombie.removeBullet();
            })
        }
    }

    myPlayerZombiesBulletsCollision(zombie){
        if(zombie.type == 1){
            this.physics.add.collider(this.myPlayer, zombie.bullet, (myPlayer, bullet) => {//eu levar com bala

                zombie.removeBullet();
                
                myPlayer.life -= bullet.power;
            
                var life = myPlayer.life < 0 ? 0 : myPlayer.life
                this.myLifeLabel.setText("Player " + myPlayer.id + ": " + life)///quando um dos players ficar com menos de 0 de vida, mudar para 0

                this.socket.emit('life', {idZombie:zombie.id, idBullet:bullet.id, life:myPlayer.life})
            });
        }
    }

    zombiesMyPlayerBulletsCollision(zombie, bullet){
        this.myPlayer.removeBullet(bullet.id);

        zombie.life -= bullet.power;

        if(zombie.life <= 0){
            this.myPlayer.earnMoney(zombie.type)
            this.coin.playAnim()
            this.moneyLabel.setText(this.myPlayer.money)
        }
        
        this.socket.emit('lifezombie', {idzombie:zombie.id, idBullet:bullet.id, life:zombie.life})
    }

    playerActions(data){
        if(data.mouseX && data.mouseY && data.idBullet){
            this.otherPlayer.fire2(data.mouseX, data.mouseY, data.idBullet)
        }else{
            this.otherPlayer.x = data.x
            this.otherPlayer.y = data.y
            this.otherPlayer.playAnim(data.pos)
        }
    }

    otherPlayerLife(data){
        this.otherPlayer.life = data.life
        if(data.idZombie){//se o outro jogador sofrer dano do inimigo
            this.zombies.children.iterate(function (zombie) {
                if(zombie.id==data.idZombie){
                    zombie.removeBullet()
                }
            }, this);
        }else if(data.idBullet){//se o outro jogador sofrer dano de mim
            this.myPlayer.removeBullet(data.idBullet)
        }
        var life = this.otherPlayer.life < 0 ? 0 : this.otherPlayer.life
        this.othersLifeLabel.setText("Player " + this.otherPlayer.id + ": " + life)
    }

    otherPlayerTypeBullets(data){
        this.otherPlayer.typeBullets = data.typeBullets
    }

    zombiePositionWhenCollides(data){
        this.zombies.children.iterate(function (zombie) {
            if(zombie.id == data.id){
                zombie.x = data.x
                zombie.y = data.y
            }
        }, this);
    }

    createZombie(data){
        let zombie = this.zombies.getFirstDead(true, data.x, data.y, data.type, data.idZombie);
        if(zombie){
            zombie.spawn(data.idZombie, data.type)
        }
    }

    moveZombie(data){
        this.zombies.children.iterate(function (zombie) {
            if(zombie.id == data.idZombie){
                if(data.idPlayer){
                    this.players.children.iterate(function (player) {
                        if(player.id == data.idPlayer){
                            zombie.move(player, this.socket)
                        }
                    }, this)
                }else{
                    zombie.setVelocity(0);
                }
            }
        }, this)
    }

    zombieMeleeAttack(data){
        this.zombies.children.iterate(function (zombie) {
            if(zombie.id == data.id){
                zombie.attack(data.time, this.players)
            }
        }, this)
    }

    zombieLife(data){
        this.zombies.children.iterate(function (zombie) {
            if(zombie.id == data.idZombie){
                zombie.life = data.life;
                this.otherPlayer.removeBullet(data.idBullet);
            }
        }, this)
    }
}///aumentar numero de inimigos, senao fica muito facil