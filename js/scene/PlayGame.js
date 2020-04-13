import player from "../models/Player.js";
import Enemy from "../models/Enemy.js";

export default class playGame extends Phaser.Scene {
    constructor() {
        super("PlayGame");
    }

    init(data){
        //console.log("PlayGame scene: ", data)
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
        //console.log("Starting game");
        
        this.map = this.make.tilemap({ key: "map1" });
        const tileset = this.map.addTilesetImage("tile-map", "tiles");
        this.map.createStaticLayer("back", tileset, 0, 0);
        const front = this.map.createStaticLayer("front", tileset, 0, 0);
    
        front.setCollisionByProperty({ "collides": true }, true);
        
        this.players = this.physics.add.group({
            maxSize: 2,
            classType: player
        });

        this.enemies = this.physics.add.group({
            maxSize: 10,
            classType: Enemy
        });

        
        //this.player = new player(this, 200, 400, 1)
        //this.player2 = new player(this, 400, 400, 2)

        this.players.getFirstDead(true, 200, 400, 1);
        this.players.getFirstDead(true, 400, 400, 2);

        this.player;
        this.player2;
        this.players.children.iterate(function (player) {
            if(player.id == this.id){
                this.player = player;
            }else{
                this.player2 = player;
            }
        }, this);

        this.lifeLabel1 = this.add.text(20, 20, "Player 1: 100", {
            font: "30px Cambria",
            fill: "#ffffff"
        });

        this.lifeLabel2 = this.add.text(this.game.config.width - 200, 20, "Player 2: 100", {
            font: "30px Cambria",
            fill: "#ffffff"
        });

        this.socket.on('enemyPositionCollider', (data) =>{
            this.enemies.children.iterate(function (enemy) {
                if(enemy.id == data.id){
                    enemy.x = data.x
                    enemy.y = data.y
                }
            }, this);
        })

        this.physics.add.overlap(this.player, this.enemies, (player, enemy) =>{///colisão inimigos e eu
            if(enemy.meeleeAttack(this.time.now, player)){
                if(player.id == 1){
                    this.lifeLabel1.setText("Player 1: " + player.life)
                }else{
                    this.lifeLabel2.setText("Player 2: " + player.life)
                }
                this.socket.emit('life', {id:player.id, life:player.life})
            }/////ver se o enemy bate nas arvores
            this.socket.emit('enemyPosition', {id: enemy.id, x: enemy.x, y: enemy.y, collider: true})
        });

        this.socket.on('newPositions',(data)=>{
            this.player2.x = data.x
            this.player2.y = data.y
            //console.log(data.pos)
            this.player2.play(data.pos)
            if(data.fight){
                this.player2.fire(data.time)
            }
        });

        this.themeSound = this.sound.add("theme", { volume: this.volume });

        //this.themeSound.play();

        let fireSound = this.sound.add("fire", {
            volume: this.volume
        });

        this.players.children.iterate(function (player) {
            //player.fireSound = fireSound;
        }, this);

        this.physics.add.collider(this.players, front)
        
        this.physics.add.overlap(this.player, this.player2.bullets, (player, bullet) => {//eu levar com bala
        
            var idBullet = bullet.id

            this.player2.removeBullet(bullet.id);
            
            player.life -= bullet.power;
            
            //update the score text
            if(player.id == 1){
                this.lifeLabel1.setText("Player 1: " + player.life)
            }else{
                this.lifeLabel2.setText("Player 2: " + player.life)
            }
            this.socket.emit('life', {id:player.id, life:player.life, idBullet:idBullet})// o outro player mexe-se ahahha

        });

        this.players.children.iterate(function (player) {//colisao balas com arvores
            this.physics.add.collider(player.bullets, front, (bullet, front) =>{
                player.removeBullet(bullet.id)
            })
        }, this);

        this.enemies.children.iterate(function (enemy) {//colisao balas com arvores
            this.physics.add.collider(enemy.bullets, front, (bullet, front) =>{
                enemy.removeBullet(bullet);//console.log("olaaaaaaaaa")
            })
        }, this);

        //recomeçar o jogo quando servidor desligar e voltar a ligar, mas nao funciona bem por causa do servidor
        /*this.socket.on('id', (data)=>{
            this.scene.stop()
            this.scene.start("Play")
        })*/
        
        this.socket.on('life', (data)=>{//se o outro player tiver sido atingido, eu atualizo a vida dele
            this.player2.life = data.life
            if(data.idBullet){
                this.player.removeBullet(data.idBullet)
            }
            if(this.player2.id == 1){
                this.lifeLabel1.setText("Player 1: " + this.player2.life)
            }else{
                this.lifeLabel2.setText("Player 2: " + this.player2.life)
            }
        })

        this.socket.on('createEnemy', (data) =>{
            let enemy = this.enemies.getFirstDead(true, data.x, data.y, data.type, data.idEnemy);
            if(enemy){
                enemy.spawn()
            }
        })

        this.physics.add.collider(this.enemies, front)

        this.socket.on('moveEnemy', (data) =>{
            this.enemies.children.iterate(function (enemy) {
                if(enemy.id == data.idEnemy){
                    this.players.children.iterate(function (player) {
                        if(player.id == data.idPlayer){
                            enemy.move(player, this.socket)
                        }
                    }, this)
                }
            }, this)
        })

        this.socket.on('enemyShoot', (data) =>{
            this.enemies.children.iterate(function (enemy) {
                if(enemy.id == data.id){
                    enemy.attack(data.time, this.players)
                }
            }, this)
        })

        this.cursors = this.defCursors()
    }

    update(time) {

        /*if(this.cursors.shop.isDown){
            this.scene.launch("menu", this.data)
        }*/
        
        this.players.children.iterate(function (player) {
            if(player.life > 0){
                player.update(time, this.data)
            }else{
                player.dead()
                //stops this scene
                this.scene.stop();

                this.themeSound.stop();

                this.socket.emit('Finish')

                //starts the game over scene and passes the actual score to render at that scene
                this.scene.start('Finish', {id: this.id, socket: this.socket, loserID: player.id})
            }
        }, this);

        this.enemies.children.iterate(function (enemies) {

          enemies.update(time,this.players);
        
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
    

}