import EnemiesGroup from "../models/EnemiesGroup.js";
import PlayersGroup from "../models/PlayersGroup.js";

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
        console.log("Starting game");
        
        this.map = this.make.tilemap({ key: "map1" });
        const tileset = this.map.addTilesetImage("tile-map", "tiles");
        this.map.createStaticLayer("back", tileset, 0, 0);
        this.front = this.map.createStaticLayer("front", tileset, 0, 0);
        this.front.setCollisionByProperty({ "collides": true }, true);
        
        this.players = new PlayersGroup(this.physics.world, this, this.id)
        this.myPlayer = this.players.me
        this.otherPlayer = this.players.other
        
        this.enemies = new EnemiesGroup(this.physics.world, this)

        var lifeLabel1 = this.add.text(20, 20, "Player 1: 100", {font: "30px Cambria", fill: "#ffffff"});
        var lifeLabel2 = this.add.text(this.game.config.width - 195, 20, "Player 2: 100", {font: "30px Cambria", fill: "#ffffff"});
        this.myLifeLabel = this.id == 1 ? lifeLabel1 : lifeLabel2
        this.othersLifeLabel = this.id == 1 ? lifeLabel2 : lifeLabel1

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

        this.physics.add.collider(this.enemies, this.front)

        this.physics.add.overlap(this.myPlayer, this.enemies, this.myPlayerEnemiesCollision, null, this)///colisão inimigos e eu

        this.physics.add.overlap(this.myPlayer, this.otherPlayer.bullets, this.myPlayerOtherPlayerBulletsCollision, null, this)//eu levar com bala

        this.players.children.iterate(this.playersBulletsFrontCollision, this);//colisao balas com arvores

        this.enemies.children.iterate(function (enemy) {
            this.enemiesBulletsFrontCollision(enemy)//balas inimigos com arvores
            this.myPlayerEnemiesBulletsCollision(enemy)
        }, this);

        this.physics.add.overlap(this.enemies, this.myPlayer.bullets, this.enemiesMyPlayerBulletsCollision, null, this)

        //recomeçar o jogo quando servidor desligar e voltar a ligar, mas nao funciona bem por causa do servidor
        /*this.socket.on('id', (data)=>{
            this.scene.stop()
            this.scene.start("Play")
        })*/
        
        this.socket.on('enemyPositionCollider', (data) =>{
            this.enemyPositionWhenCollides(data)
        })

        this.socket.on('playerAction', (data)=>{
            this.playerActions(data)
        });

        this.socket.on('life', (data)=>{//se o outro player tiver sido atingido, eu atualizo a vida dele
            this.otherPlayerLife(data)    
        })
        
        this.socket.on('createEnemy', (data) =>{
            this.createEnemy(data)
        })

        this.socket.on('moveEnemy', (data) =>{
            this.moveEnemy(data)
        })

        this.socket.on('enemyShoot', (data) =>{
            this.enemyMeleeAttack(data)
        })

        this.socket.on('lifeEnemy', (data) =>{
            this.enemyLife(data)
        })
    }

    update(time) {
        this.currentTime = time
        this.players.children.iterate(function (player) {
            if(player.life > 0){
                player.update(time, this.data)
            }else{
                player.dead()
                this.scene.stop();
                this.themeSound.stop();
                this.socket.emit('Finish')
                this.scene.start('Finish', {id: this.id, socket: this.socket, loserID: player.id})
            }
        }, this);

        this.enemies.children.iterate(function (enemy) {
            enemy.update(time, this.players);
            if(enemy.life <= 0){
                enemy.dead();
                this.enemies.killAndHide(enemy);
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

    myPlayerEnemiesCollision(myPlayer, enemy){
        if(enemy.meeleeAttack(this.currentTime, myPlayer)){
            
            this.myLifeLabel.setText("Player " + myPlayer.id + ": " + myPlayer.life)

            this.socket.emit('life', {id:myPlayer.id, life:myPlayer.life})
        }
        this.socket.emit('enemyPosition', {id: enemy.id, x: enemy.x, y: enemy.y, collider: true})
    }

    myPlayerOtherPlayerBulletsCollision(myPlayer, bullet){
        var idBullet = bullet.id

        this.otherPlayer.removeBullet(bullet.id);
        
        myPlayer.life -= bullet.power;
        
        this.myLifeLabel.setText("Player " + myPlayer.id + ": " + myPlayer.life)
        
        this.socket.emit('life', {id:myPlayer.id, life:myPlayer.life, idBullet:idBullet})
    }

    playersBulletsFrontCollision(player) {
        this.physics.add.collider(player.bullets, this.front, (bullet, front) =>{
            player.removeBullet(bullet.id)
        })
    }

    enemiesBulletsFrontCollision(enemy){
        this.physics.add.collider(enemy.bullets, this.front, (bulletz, front) =>{
            enemy.removeBulletz(bulletz.id);
        })
    }

    myPlayerEnemiesBulletsCollision(enemy){
        this.physics.add.collider(this.myPlayer, enemy.bullets, (myPlayer, bullet) => {//eu levar com bala
    
            enemy.removeBulletz(bullet.id);
            
            myPlayer.life -= bullet.power;
        
            this.myLifeLabel.setText("Player " + myPlayer.id + ": " + myPlayer.life)

            this.socket.emit('life', {idEnemy:enemy.id, idBullet:bullet.id, life:myPlayer.life})// o outro player mexe-se ahahha
        });
    }

    enemiesMyPlayerBulletsCollision(enemy, bullet){
        this.myPlayer.removeBullet(bullet.id);

        enemy.life -= bullet.power;
        
        this.socket.emit('lifeEnemy', {idEnemy:enemy.id, idBullet:bullet.id, life:enemy.life})
    }

    playerActions(data){
        if(data.mouseX && data.mouseY && data.idBullet){
            this.otherPlayer.fire2(data.mouseX, data.mouseY, data.idBullet)
        }else{
            this.otherPlayer.x = data.x
            this.otherPlayer.y = data.y
            this.otherPlayer.play(data.pos)
        }
    }

    otherPlayerLife(data){
        this.otherPlayer.life = data.life
        if(data.idBullet && data.idEnemy){//se o outro jogador sofrer dano do inimigo
            this.enemies.children.iterate(function (enemy) {
                if(enemy.id==data.idEnemy){
                    enemy.removeBulletz(data.idBullet)
                }
            }, this);
        }else if(data.idBullet){//se o outro jogador sofrer dano de mim
            this.myPlayer.removeBullet(data.idBullet)
        }
        this.othersLifeLabel.setText("Player " + this.otherPlayer.id + ": " + this.otherPlayer.life)
    }

    enemyPositionWhenCollides(data){
        this.enemies.children.iterate(function (enemy) {
            if(enemy.id == data.id){
                enemy.x = data.x
                enemy.y = data.y
            }
        }, this);
    }

    createEnemy(data){
        let enemy = this.enemies.getFirstDead(true, data.x, data.y, data.type, data.idEnemy);
        if(enemy){
            enemy.spawn(data.idEnemy, data.type)
        }
    }

    moveEnemy(data){
        this.enemies.children.iterate(function (enemy) {
            if(enemy.id == data.idEnemy){
                if(data.idPlayer){
                    this.players.children.iterate(function (player) {
                        if(player.id == data.idPlayer){
                            enemy.move(player, this.socket)
                        }
                    }, this)
                }else{
                    enemy.setVelocity(0);
                }
            }
        }, this)
    }

    enemyMeleeAttack(data){
        this.enemies.children.iterate(function (enemy) {
            if(enemy.id == data.id){
                enemy.attack(data.time, this.players)
            }
        }, this)
    }

    enemyLife(data){
        this.enemies.children.iterate(function (enemy) {
            if(enemy.id == data.idEnemy){
                enemy.life = data.life;
                this.otherPlayer.removeBullet(data.idBullet);
            }
        }, this)
    }
}