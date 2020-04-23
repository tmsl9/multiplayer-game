import ZombiesGroup from "../models/ZombiesGroup.js";
import PlayersGroup from "../models/PlayersGroup.js";
import Coin from "../models/Coin.js";
import Mage from "../models/Mage.js";

export default class level2 extends Phaser.Scene {
    constructor() {
        super("Level2");
    }
    
    init(data){
        console.log("Level2 scene: ", data)
        this.data = data
        this.socket = data.socket
        this.id = data.id
        this.volume = data.volume
        this.myPlayerlvl1 = data.myPlayer
        this.otherPlayerlvl1 = data.otherPlayer
    }
//////////when player or zombie or mage have the some velocity x and y update walking anims
    preload(){/////when mage life == 0 or less make dead()
        this.load.image("tiles", "assets/tile-map.png");
        this.load.tilemapTiledJSON("map2", "assets/Map2.json");
    }
////develop server when someone lost stop sending info to client
    create() {
        console.log("Starting game");
        
        this.map = this.make.tilemap({ key: "map2" });
        const tileset = this.map.addTilesetImage("tile-map", "tiles");
        this.back = this.map.createStaticLayer("back", tileset, 0, 0);
        this.objective = this.map.createStaticLayer("win", tileset, 0, 0);
        this.back.setCollisionByProperty({ "collides": true }, true);
        
        this.players = new PlayersGroup(this.physics.world, this, this.id)
        this.myPlayer = this.players.me
        this.otherPlayer = this.players.other
        this.myPlayer.updatePlayer(this.myPlayerlvl1.money, this.myPlayerlvl1.life, this.myPlayerlvl1.typeBullets)
        this.otherPlayer.updatePlayer(this.otherPlayerlvl1.money, this.otherPlayerlvl1.life, this.otherPlayerlvl1.typeBullets)

        this.zombies = new ZombiesGroup(this.physics.world, this)

        this.mage = new Mage(this, 300, 200)

        this.players.children.iterate(function(player){
            player.x = player.id * 200
            player.y = 400
            player.scene = this
        }, this)

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

        //this.themeSound.play();

        let fireSound = this.sound.add("fire", { volume: this.volume });

        this.cursors = this.defCursors()

        this.physics.add.collider(this.players, this.back)

        this.physics.add.overlap(this.myPlayer, this.zombies, this.myPlayerZombiesCollision, null, this)//colisão inimigos e eu

        this.physics.add.overlap(this.myPlayer, this.otherPlayer.bullets, this.myPlayerOtherPlayerBulletsCollision, null, this)//eu levar com bala

        this.players.children.iterate(function(player){
            this.playersBulletsBackCollision(player)
            //player.fireSound = fireSound
        }, this);//colisao balas com arvores, e som

        this.zombies.children.iterate(function (zombie) {
            if(zombie.type != 3){
                this.physics.add.collider(zombie, this.back)
            }
            this.zombiesBulletsBackCollision(zombie)//balas inimigos com arvores
            this.myPlayerZombiesBulletsCollision(zombie)
        }, this);///////////////////////when mage dies all wrong on myPlayer, ok on otherPlayer

        this.physics.add.overlap(this.zombies, this.myPlayer.bullets, this.zombiesMyPlayerBulletsCollision, null, this)

        this.physics.add.collider(this.mage, this.back)

        this.physics.add.overlap(this.myPlayer, this.mage, this.myPlayerMageCollision, null, this)//colisão inimigos e eu

        this.mageBulletsBackCollision()

        this.myPlayerMageBulletsCollision()

        this.physics.add.overlap(this.mage, this.myPlayer.bullets, this.mageMyPlayerBulletsCollision, null, this)
        
        //recomeçar o jogo quando servidor desligar e voltar a ligar, mas nao funciona bem por causa do servidor
        /*this.socket.on('id', (data)=>{
            this.scene.stop()
            this.scene.start("Play")
        })*/

        this.socket.on('playerAction', (data)=>{ this.playerActions(data) });

        this.socket.on('life', (data)=>{ this.otherPlayerLife(data) })//se o outro player tiver sido atingido, eu atualizo a vida dele
        
        this.socket.on('typeBullets', (data) =>{ this.otherPlayerTypeBullets(data) })

        this.socket.on('createZombie', (data) =>{ this.createZombie(data) })

        this.socket.on('moveZombie', (data) =>{ this.moveZombie(data) })

        this.socket.on('zombieShoot', (data) =>{ this.zombieShoot(data) })

        this.socket.on('lifeZombie', (data) =>{ this.zombieLife(data) })

        this.socket.on('moveMage', (data) =>{ this.moveMage(data) })

        this.socket.on('mageShoot', (data) =>{ this.mageShoot(data) })

        this.socket.on('lifeMage', (data) =>{ this.mageLife(data) })
    }
    ///tem bugs que nao deixam o personagem mexer-se mas o anim corre na mesma
    ///as vezes da erro e o dinheiro começa a disparar e o power tem mais de 50, e mata logo o zombie
    update(time) {
        if(this.mage.life > 0){
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
            
            this.mage.update()
        }else{
            this.objective.x = 0
            this.objective.y = 0
            this.myPlayer.finish()
            this.otherPlayer.finish()
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
                    this.data.nextLevel++//increments level
                    this.socket.on('readyToText', ()=>{
                        this.socketOff()
                        this.scene.start('NextLevel', this.data)
                        this.scene.destroy();
                    })
                }
                i++
            }
        });
    }

    socketOff(){
        this.socket.off('zombiePositionCollider')
        this.socket.off('playerAction')
        this.socket.off('life')
        this.socket.off('typeBullets')
        this.socket.off('createZombie')
        this.socket.off('moveZombie')
        this.socket.off('zombieShoot')
        this.socket.off('lifeZombie')
        this.socket.off('moveMage')
        this.socket.off('mageShoot')
        this.socket.off('lifeMage')
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
        }////////do lifelabel of mage, and taking him life
    }///////////////make mage venoum attack

    myPlayerOtherPlayerBulletsCollision(myPlayer, bullet){
        var idBullet = bullet.id

        this.otherPlayer.removeBullet(bullet.id);
        
        myPlayer.life -= bullet.power;

        this.updateLifeLabel(myPlayer.id)
        
        this.socket.emit('life', {life:myPlayer.life, idBullet:idBullet})
    }

    playersBulletsBackCollision(player) {
        this.physics.add.collider(player.bullets, this.back, (bullet, back) =>{
            player.removeBullet(bullet.id)
        })
    }

    zombiesBulletsBackCollision(zombie){
        if(zombie.type == 1){
            this.physics.add.collider(zombie.bullet, this.back, () =>{
                zombie.removeBullet();
            })
        }
    }

    myPlayerZombiesBulletsCollision(zombie){
        if(zombie.type == 1){
            this.physics.add.collider(this.myPlayer, zombie.bullet, (myPlayer, bullet) => {//eu levar com bala

                zombie.removeBullet();
                
                myPlayer.life -= bullet.power;
            
                this.updateLifeLabel(myPlayer.id)///quando um dos players ficar com menos de 0 de vida, mudar para 0

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

    myPlayerMageCollision(myPlayer, mage){
        if(mage.meeleeAttack(this.currentTime, myPlayer)){
            this.updateLifeLabel(myPlayer.id)
            this.socket.emit('life', {life:myPlayer.life})
        }
    }

    mageBulletsBackCollision(){
        this.physics.add.collider(this.mage.bullet, this.back, () =>{
            this.mage.removeBullet();
        })
    }

    myPlayerMageBulletsCollision(){
        this.physics.add.collider(this.myPlayer, this.mage.bullet, (myPlayer, bullet) => {//eu levar com bala

            this.mage.removeBullet();
            
            myPlayer.life -= bullet.power;
        ///////not working, and other player life too, doesnt remove bullet
            this.updateLifeLabel(myPlayer.id)///quando um dos players ficar com menos de 0 de vida, mudar para 0

            this.socket.emit('life', {mage:true, life:myPlayer.life})//problem server
        });
    }

    mageMyPlayerBulletsCollision(zombie, bullet){
        this.myPlayer.removeBullet(bullet.id);

        zombie.life -= bullet.power;

        if(zombie.life <= 0){
            this.myPlayer.earnMoney(zombie.type)
            this.coin.playAnim()
            this.moneyLabel.setText(this.myPlayer.money)
        }
        
        this.socket.emit('lifeMage', {idBullet:bullet.id, life:this.mage.life})
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
//////////mage bullets collision with player, and with map; server zombies with type 1 dist not working, they sometimes dont move
    otherPlayerLife(data){//////mage shoot all wrong, late; mage not collides with map; zombie dist wrong; mage melee attack nor working
        this.otherPlayer.life = data.life
        if(data.idZombie){//se o outro jogador sofrer dano do inimigo
            this.zombies.children.iterate(function (zombie) {
                if(zombie.id==data.idZombie){
                    zombie.removeBullet()
                }
            }, this);
        }else if(data.mage){
            this.mage.removeBullet()
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

    moveMage(data){
        this.players.children.iterate(function (player) {
            if(player.id == data.idPlayer){
                this.mage.move(player, this.socket)
            }
        }, this)
    }
    ////////player 1 is pushing player 2

    mageShoot(data){
        this.mage.rangedAttack(data.time, this.players)
    }
////////////mage doesnt do near attack
    mageLife(data){
        this.mage.life = data.life;
        //this.add.image(238.5 + this.deadZombies * 4, 10, "progresso").setScale(0.2, 0.4)
        this.otherPlayer.removeBullet(data.idBullet);
    }

    updateLifeLabel(id){
        if(id == this.id){
            for(var i = 0; i < 10 - this.myPlayer.life / 10 ; i++){
                this.myLifeLabel[9 - i].setVisible(false);
            }
        }else{
            for(var i = 0; i < 10 - this.otherPlayer.life / 10 ; i++){
                this.otherLifeLabel[9 - i].setVisible(false);
            }
        }
    }

    /*updateLifeLabelMage(){///change on create(), put all light green
        for(var i = 0; i < 10 - this.myPlayer.life / 10 ; i++){
            this.myLifeLabel[9 - i].setVisible(false);
        }
    }*/
}///aumentar numero de inimigos, senao fica muito facil