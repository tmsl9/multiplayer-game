import ZombiesGroup from "../models/ZombiesGroup.js";
import PlayersGroup from "../models/PlayersGroup.js";
import Coin from "../models/Coin.js";

export default class level1 extends Phaser.Scene {
    constructor() {
        super("Level1");
    }

    init(data){
        console.log("Level1 scene")
        this.data = data
        this.socket = data.socket
        this.id = data.id
        this.volume = data.volume
    }

    preload(){
        this.load.image("tiles", "assets/tile-map.png");
        this.load.tilemapTiledJSON("map1", "assets/Map1.json");
    }

    create() {
        this.map = this.make.tilemap({ key: "map1" });
        const tileset = this.map.addTilesetImage("tile-map", "tiles");
        this.back = this.map.createStaticLayer("back", tileset, 0, 0);
        this.front = this.map.createStaticLayer("front", tileset, 0, 0);
        this.objective = this.map.createStaticLayer("objective", tileset, -500, -500);
        this.front.setCollisionByProperty({ "collides": true }, true);
        
        this.players = new PlayersGroup(this.physics.world, this, this.id)
        this.myPlayer = this.players.me
        this.otherPlayer = this.players.other
        
        this.zombies = new ZombiesGroup(this.physics.world, this)
        this.maxZombies = 1
        this.deadZombies = 0

        this.add.image(320, 10, "barraprogresso")//objective
        this.add.image(70, 20, "barraprogresso").setScale(0.625);//life player 1
        this.add.image(this.game.config.width - 100, 20, "barraprogresso").setScale(0.625);//life player 2
        var life1 = [];
        var life2 = [];
        for(var i = 0; i < 10 ; i++){
            life1[i] = this.add.image(25 + i * 10, 20, "progresso").setScale(0.5, 0.2);
            life2[i] = this.add.image(this.game.config.width - 145 + i * 10, 20, "progresso").setScale(0.5, 0.2);
        }
        this.myLifeLabel = this.id == 1 ? life1 : life2
        this.otherLifeLabel = this.id == 1 ? life2 : life1

        this.coin = new Coin(this, 30, 75, 0)

        var textConfig = {font: "30px Cambria", fill: "#ffffff"}

        this.moneyLabel = this.add.text(45, 58, this.myPlayer.money, textConfig);

        this.currentTime;

        this.themeSound = this.sound.add("theme", { volume: this.volume });

        this.themeSound.play();

        let fireSound = this.sound.add("fire", { volume: this.volume });

        this.cursors = this.defCursors()

        this.physics.add.collider(this.players, this.front)

        this.physics.add.overlap(this.myPlayer, this.zombies, this.myPlayerZombiesCollision, null, this)//colisão inimigos e eu

        this.physics.add.overlap(this.myPlayer, this.otherPlayer.bullets, this.myPlayerOtherPlayerBulletsCollision, null, this)//eu levar com bala

        this.players.children.iterate(function(player){
            this.playersBulletsFrontCollision(player)
            player.fireSound = fireSound
        }, this);//colisao balas com arvores, e som

        this.zombies.children.iterate(function (zombie) {
            if(zombie.type != 3){
                this.physics.add.collider(zombie, this.front)
            }
            this.zombiesBulletsFrontCollision(zombie)//balas inimigos com arvores
            this.myPlayerZombiesBulletsCollision(zombie)
        }, this);

        this.physics.add.overlap(this.zombies, this.myPlayer.bullets, this.zombiesMyPlayerBulletsCollision, null, this)

        //recomeçar o jogo quando servidor desligar e voltar a ligar, mas nao funciona bem por causa do servidor
        /*this.socket.on('id', (data)=>{
            this.scene.stop()
            this.scene.start("Play")
        })*/
        
        this.socket.on('playerAction', (data)=>{ this.playerActions(data) });

        this.socket.on('shop', (data) =>{ this.shopUpdatePositions(data) })

        this.socket.on('receiveUpdatedPositionsShop', (data) =>{ this.receiveUpdatedPositionsShop(data) })
        
        this.socket.on('life', (data)=>{ this.otherPlayerLife(data) })//se o outro player tiver sido atingido, eu atualizo a vida dele
        
        this.socket.on('typeBullets', (data) =>{ this.otherPlayerTypeBullets(data) })

        this.socket.on('createZombie', (data) =>{ this.createZombie(data) })

        this.socket.on('moveZombie', (data) =>{ this.moveZombie(data) })

        this.socket.on('zombieShoot', (data) =>{ this.zombieShoot(data) })

        this.socket.on('lifeZombie', (data) =>{ this.zombieLife(data) })
    }
    ///tem bugs que nao deixam o personagem mexer-se mas o anim corre na mesma
    ///as vezes da erro e o dinheiro começa a disparar e o power tem mais de 50, e mata logo o zombie
    update(time) {
        if(this.deadZombies < this.maxZombies){
            this.currentTime = time
            this.players.children.iterate(function (player) {
                if(player.life > 0){
                    player.update(time, this.data, this.zombies)
                }else{
                    player.dead()
                    this.myPlayer.finish()
                    this.otherPlayer.finish()
                    this.scene.stop();
                    this.themeSound.stop();
                    this.socket.emit('Finish')
                    this.scene.start('Finish', this.data)
                }
            }, this);
            
            this.zombies.children.iterate(function (zombie) {
                zombie.update(time, this.socket);
                if(zombie.life <= 0){
                    zombie.dead();
                    this.zombies.killAndHide(zombie);
                    this.deadZombies++
                    if(this.deadZombies > 0){
                        this.add.image(238.5 + this.deadZombies * 4, 10, "progresso").setScale(0.2, 0.4)
                    }
                }
            }, this);
        }else if(this.deadZombies == this.maxZombies){
            this.objective.x = 0
            this.objective.y = 0
            this.myPlayer.finish()
            this.otherPlayer.finish()
            this.deadZombies++
            this.nextLevel()
        }
    }
    
    nextLevel(){
        var i = 0
        this.time.addEvent({
            repeat: 200,
            loop: false,
            callback: () => {
                if (i >= 200) {
                    this.socket.emit('finishLevel')
                    this.data.myPlayer = this.myPlayer
                    this.data.otherPlayer = this.otherPlayer
                    this.socket.on('readyToText', ()=>{
                        this.socketOff()
                        this.data.nextLevel++
                        this.scene.stop()
                        this.scene.start('NextLevel', this.data)
                    })
                }
                i++
            }
        });
    }

    socketOff(){
        this.socket.off('playerAction')
        this.socket.off('shop')
        this.socket.off('receiveUpdatedPositionsShop')
        this.socket.off('life')
        this.socket.off('typeBullets')
        this.socket.off('createZombie')
        this.socket.off('moveZombie')
        this.socket.off('zombieShoot')
        this.socket.off('lifeZombie')
        this.socket.off('readyToText')
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
                this.updateLifeLabel(myPlayer.id)
                this.socket.emit('life', {life:myPlayer.life})
            }
        }
    }

    myPlayerOtherPlayerBulletsCollision(myPlayer, bullet){
        var idBullet = bullet.id

        this.otherPlayer.removeBullet(bullet.id);
        
        myPlayer.life -= bullet.power;

        this.updateLifeLabel(myPlayer.id)
        
        this.socket.emit('life', {life:myPlayer.life, idBullet:idBullet})
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
            
                this.updateLifeLabel(myPlayer.id)

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
        
        this.socket.emit('lifeZombie', {idZombie:zombie.id, idBullet:bullet.id, life:zombie.life})
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
    
    shopUpdatePositions(){
        var level = this.data.nextLevel
        var data = []
        if(level != 3){
            this.zombies.children.iterate(function (zombie) {
                if(zombie.x > 0){
                    data.push({
                        type: "z",
                        id: zombie.id,
                        x: zombie.x,
                        y:zombie.y
                    })
                }
            }, this);
        }
        this.socket.emit("sendUpdatedPositionsShop", data)
    }

    receiveUpdatedPositionsShop(data){
        for(var i = 0; i < data.length; i++){
            var object = data[i]
            switch(object.type){
                case "p": 
                    this.players.children.iterate(function (player) {
                        if(player.id == object.id){
                            player.shopUpdatePositions(object.x, object.y)
                        }
                    }, this);
                    break;
                default:
                    this.zombies.children.iterate(function (zombie) {
                        if(zombie.id == object.id){
                            zombie.shopUpdatePositions(object.x, object.y)
                        }
                    }, this);
                    break;
            }
        }
    }

    otherPlayerLife(data){
        this.otherPlayer.life = data.life
        if(data.idZombie){//se o outro jogador sofrer dano do inimigo
            this.zombies.children.iterate(function (zombie) {
                if(zombie.id == data.idZombie){
                    zombie.removeBullet()
                }
            }, this);
        }else if(data.idBullet){//se o outro jogador sofrer dano de mim
            this.myPlayer.removeBullet(data.idBullet)
        }
        this.updateLifeLabel(this.otherPlayer.id)
    }

    otherPlayerTypeBullets(data){
        this.otherPlayer.typeBullets = data.typeBullets
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

    zombieShoot(data){
        this.zombies.children.iterate(function (zombie) {
            if(zombie.id == data.id){
                zombie.rangedAttack(data.time, this.players)
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
    
    updateLifeLabel(id){
        if(id==this.id){
            for(var i = 0; i<10 - this.myPlayer.life/10 ; i++){
                this.myLifeLabel[9-i].setVisible(false);
            }
        }else{
            for(var i = 0; i<10 - this.otherPlayer.life/10 ; i++){
                this.otherLifeLabel[9-i].setVisible(false);
            }
        }
    }
}///aumentar numero de inimigos, senao fica muito facil