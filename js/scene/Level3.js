import Coin from "../models/Coin.js";

export default class level3 extends Phaser.Scene {
    constructor() {
        super("Level3");
    }

    init(data){
        //console.log("Level2 scene: ", data)
        this.data = data
        this.socket = data.socket
        this.id = data.id
        this.volume = data.volume
        this.players = data.players
        this.myPlayer = data.myPlayer
        this.otherPlayer = data.otherPlayer
    }

    preload(){
        this.load.image("tiles", "assets/tile-map.png");
        this.load.tilemapTiledJSON("map3", "assets/Map3.json");
    }
/////////type 3 not shootting
/////////mage not shooting
    create() {
        console.log("Starting game");
        
        this.map = this.make.tilemap({ key: "map3" });
        const tileset = this.map.addTilesetImage("tile-map", "tiles");
        this.back = this.map.createStaticLayer("map", tileset, 0, 0);
        this.win = this.map.createStaticLayer("winwin", tileset, -500, -500);
        this.back.setCollisionByProperty({ "collides": true }, true);
        
        this.players.children.iterate(function(player){
            player.x = player.id * 200
            player.y = 400
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

        let fireSound = this.sound.add("fire", {
            volume: this.volume
        });

        this.players.children.iterate(function (player) {
            //player.fireSound = fireSound;
        }, this);

        this.cursors = this.defCursors()

        this.physics.add.collider(this.players, this.back)

        this.physics.add.overlap(this.myPlayer, this.otherPlayer.bullets, this.myPlayerOtherPlayerBulletsCollision, null, this)//eu levar com bala

        this.players.children.iterate(function(player){
            this.playersBulletsBackCollision(player)
            player.fireSound = fireSound
        }, this);//colisao balas com arvores, e som

        //recomeçar o jogo quando servidor desligar e voltar a ligar, mas nao funciona bem por causa do servidor
        /*this.socket.on('id', (data)=>{
            this.scene.stop()
            this.scene.start("Play")
        })*/

        this.socket.on('playerAction', (data)=>{ this.playerActions(data) });

        this.socket.on('life', (data)=>{ this.otherPlayerLife(data) })//se o outro player tiver sido atingido, eu atualizo a vida dele
        
        this.socket.on('typeBullets', (data) =>{ this.otherPlayerTypeBullets(data) })
    }
    ///tem bugs que nao deixam o personagem mexer-se mas o anim corre na mesma
    ///as vezes da erro e o dinheiro começa a disparar e o power tem mais de 50, e mata logo o zombie
    update(time) {
        this.players.children.iterate(function (player) {
            if(player.life > 0){
                player.update(time, this.data)
            }else{
                this.objective.x = 0
                this.objective.y = 0
                player.dead()
                this.myPlayer.finish()
                this.otherPlayer.finish()
                this.scene.stop();
                this.themeSound.stop();
                this.socket.emit('Finish')
                this.scene.start('Finish', {id: this.id, socket: this.socket, loserID: player.id})
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
        var life = this.otherPlayer.life < 0 ? 0 : this.otherPlayer.life
        this.updateLifeLabel(this.otherPlayer.id);
    }

    otherPlayerTypeBullets(data){
        this.otherPlayer.typeBullets = data.typeBullets
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
}