import Enemy from "../models/Enemy.js";
import Player from "../models/Player.js";

export default class playGame extends Phaser.Scene {
    constructor() {
        super("PlayGame");
    }

    init(data){
        console.log("PlayGame scene: ", data)
        this.data = data
        this.socket = data.socket
        this.id = data.id
        this.volume = data.volume
        console.log("volume",this.volume)
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
        const front = this.map.createStaticLayer("front", tileset, 0, 0);
    
        front.setCollisionByProperty({ "collides": true }, true);
        
        this.birds = this.physics.add.group({
            maxSize: 2,
            classType: Player
        });

        this.enemies = this.physics.add.group({
            maxSize: 10,
            classType: Enemy
        });

        
        //this.bird = new Bird(this, 200, 400, 1)
        //this.bird2 = new Bird(this, 400, 400, 2)

        this.birds.getFirstDead(true, 200, 400, 1);
        this.birds.getFirstDead(true, 400, 400, 2);

        this.bird;
        this.bird2;
        this.birds.children.iterate(function (bird) {
            if(bird.id == this.id){
                this.bird = bird;
            }else{
                this.bird2 = bird;
            }
        }, this);

        //this.physics.add.collider(this.birds, front);
        this.physics.add.collider(this.birds, front, (bird, front) =>{
            this.add.text(300, 300, "collide", {
                font: "30px Cambria",
                fill: "#f3f3f3"
            });
        });

        

        /*this.lifeLabels = this.physics.add.group({
            maxSize: 2,
            classType: Phaser.GameObjects.Text
        });

        this.lifeLabels.getFirst(this, 20, 20, "Player 1: 100", {
            font: "30px Cambria",
            fill: "#ffffff"
        });

        this.lifeLabels.getLast(this, this.game.config.width - 20, 20, "Player 2: 100", {
            font: "30px Cambria",
            fill: "#ffffff"
        });*/

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

        this.physics.add.overlap(this.bird, this.enemies, (bird, enemy) =>{///colisão inimigos e eu
            if(enemy.meeleeAttack(this.time.now, bird)){
                if(bird.id == 1){
                    this.lifeLabel1.setText("Player 1: " + bird.life)
                }else{
                    this.lifeLabel2.setText("Player 2: " + bird.life)
                }
                this.socket.emit('life', {id:bird.id, life:bird.life})
            }/////ver se o enemy bate nas arvores
            this.socket.emit('enemyPosition', {id: enemy.id, x: enemy.x, y: enemy.y, collider: true})
        });

        this.socket.on('newPositions',(data)=>{
            this.bird2.x = data[0].x
            this.bird2.y = data[0].y
            if(data[0].fight){
                this.bird2.fire(this.id, this.time.now)
            }
        });

        this.themeSound = this.sound.add("theme", { volume: this.volume });

        //this.themeSound.play();

        let fireSound = this.sound.add("fire", {
            volume: this.volume
        });

        this.birds.children.iterate(function (bird) {
            //bird.fireSound = fireSound;
        }, this);

        this.physics.add.overlap(this.bird, this.bird2.bullets, (bird, bullet) => {//eu levar com bala
        
            var idBullet = bullet.id

            this.bird2.removeBullet(bullet.id);
            
            bird.life -= bullet.power;
            
            //update the score text
            if(player1.id == 1){
                this.lifeLabel1.setText("Player 1: " + player1.life)
            }else{
                this.lifeLabel2.setText("Player 2: " + player1.life)
            }
            this.socket.emit('life', {id:bird.id, life:bird.life, idBullet:idBullet})// o outro bird mexe-se ahahha

        });

        //recomeçar o jogo quando servidor desligar e voltar a ligar, mas nao funciona bem por causa do servidor
        /*this.socket.on('id', (data)=>{
            this.scene.stop()
            this.scene.start("Play")
        })*/
        
        this.socket.on('life', (data)=>{//se o outro player tiver sido atingido, eu atualizo a vida dele
            this.bird2.life = data.life
            if(data.idBullet){
                this.bird.removeBullet(data.idBullet)
            }
            if(this.bird2.id == 1){
                this.lifeLabel1.setText("Player 1: " + this.bird2.life)
            }else{
                this.lifeLabel2.setText("Player 2: " + this.bird2.life)
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
                    this.birds.children.iterate(function (bird) {
                        if(bird.id == data.idPlayer){
                            enemy.move(bird, this.socket)
                        }
                    }, this)
                }
            }, this)
        })

        this.cursors = this.defCursors()
    }

    update(time) {

        /*if(this.cursors.shop.isDown){
            this.scene.launch("menu", this.data)
        }*/
        
        this.birds.children.iterate(function (bird) {
            if(bird.life > 0){
                bird.update(time, this.data)
            }else{
                player1.dead()
                //stops this scene
                this.scene.stop();

                this.themeSound.stop();

                this.socket.emit('Finish')

                //starts the game over scene and passes the actual score to render at that scene
                this.scene.start('Finish', {id: this.id, socket: this.socket, loserID: bird.id})
            }
        }, this);

        this.enemies.children.iterate(function (enemies) {

          enemies.update(time,this.birds);
        
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