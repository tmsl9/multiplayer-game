import Coin from "../models/Coin.js";
import PlayersGroup from "../models/PlayersGroup.js";

export default class level3 extends Phaser.Scene {
    constructor() {
        super("Level3");
    }

    init(data){
        console.log("Level3 scene")
        this.data = data
        this.socket = data.socket
        this.id = data.id
        this.volume = data.volume
        this.myPlayerlvl1 = data.myPlayer
        this.otherPlayerlvl1 = data.otherPlayer
    }

    preload(){
        this.load.image("tiles", "assets/tile-map.png");
        this.load.tilemapTiledJSON("map3", "assets/Map3.json");
    }

    create() {
        this.map = this.make.tilemap({ key: "map3" });
        const tileset = this.map.addTilesetImage("tile-map", "tiles");
        this.back = this.map.createStaticLayer("map", tileset, 0, 0);
        this.win = this.map.createStaticLayer("winwin", tileset, -500, -500);
        this.back.setCollisionByProperty({ "collides": true }, true);
        
        this.players = new PlayersGroup(this.physics.world, this, this.id)
        this.myPlayer = this.players.me
        this.otherPlayer = this.players.other
        this.myPlayer.updatePlayer(this.myPlayerlvl1.money, this.myPlayerlvl1.life, this.myPlayerlvl1.typeBullets)
        this.otherPlayer.updatePlayer(this.otherPlayerlvl1.money, this.otherPlayerlvl1.life, this.otherPlayerlvl1.typeBullets)

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

        this.updateLifeLabel(this.myPlayer.id)
        this.updateLifeLabel(this.otherPlayer.id)

        this.coin = new Coin(this, 30, 75, 0)

        var textConfig = {font: "30px Cambria", fill: "#ffffff"}

        this.moneyLabel = this.add.text(45, 58, this.myPlayer.money, textConfig);

        this.currentTime;

        this.themeSound = this.sound.add("theme", { loop: true, delay: 0, volume: this.volume });

        this.themeSound.play();

        let fireSound = this.sound.add("fire", {
            volume: this.volume
        });

        this.cursors = this.defCursors()

        this.physics.add.collider(this.players, this.back)

        this.physics.add.overlap(this.myPlayer, this.otherPlayer.bullets, this.myPlayerOtherPlayerBulletsCollision, null, this)//eu levar com bala

        this.players.children.iterate(function(player){
            this.playersBulletsBackCollision(player)
            player.fireSound = fireSound
        }, this);//colisao balas com arvores, e som

        this.socket.on('playerAction', (data)=>{ this.playerActions(data) })

        this.socket.on('life', (data)=>{ this.otherPlayerLife(data) })//se o outro player tiver sido atingido, eu atualizo a vida dele
        
        this.socket.on('typeBullets', (data) =>{ this.otherPlayerTypeBullets(data) })
    }

    update(time) {
        this.players.children.iterate(function (player) {
            if(player.life > 0){
                player.update(time, this.data)
            }else{
                this.win.x = 0
                this.win.y = 0
                player.dead()
                this.myPlayer.finish()
                this.otherPlayer.finish()
                this.scene.stop();
                this.themeSound.stop();
                this.socketOff()
                this.socket.emit('Finish')
                this.data.loser = player.id;
                this.scene.start('Finish', this.data)
            }
        }, this);
    }

    socketOff(){
        this.socket.off('playerAction')
        this.socket.off('life')
        this.socket.off('typeBullets')
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

    myPlayerOtherPlayerBulletsCollision(myPlayer, bullet){
        var idBullet = bullet.id

        this.otherPlayer.removeBullet(bullet.id);
        
        myPlayer.life -= bullet.power;

        this.updateLifeLabel(myPlayer.id);
        
        this.socket.emit('life', {id:myPlayer.id, life:myPlayer.life, idBullet:idBullet})
    }

    playersBulletsBackCollision(player) {
        this.physics.add.collider(player.bullets, this.back, (bullet, back) =>{
            player.removeBullet(bullet.id)
        })///type 1 not moving
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
        if(data.idBullet){//se o outro jogador sofrer dano de mim
            this.myPlayer.removeBullet(data.idBullet)
        }
        this.updateLifeLabel(this.otherPlayer.id);
    }

    otherPlayerTypeBullets(data){
        this.otherPlayer.typeBullets = data.typeBullets
    }

    updateLifeLabel(id){
        if(id == this.myPlayer.id){
            for(var i = 0; i < 10 - this.myPlayer.life / 10 && i < 10; i++){
                this.myLifeLabel[9 - i].setVisible(false);
            }
        }else{
            for(var i = 0; i < 10 - this.otherPlayer.life / 10 && i < 10; i++){
                this.otherLifeLabel[9 - i].setVisible(false);
            }
        }
    }
}