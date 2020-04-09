import Enemy from "../models/Enemy.js";
import Player from "../models/Player.js";

export default class playGame extends Phaser.Scene {
    constructor() {
        super("PlayGame");
    }

    init(data){
        console.log("PlayGame scene: ", data)

        this.socket = data.socket
        this.id = data.id
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
        
        this.cursors = this.input.keyboard.createCursorKeys()
        
        this.players = this.physics.add.group({
            maxSize: 2,
            classType: Player
        });

        //this.player1 = new player1(this, 200, 400, 1)
        //this.player2 = new player1(this, 400, 400, 2)

        this.players.getFirstDead(true, 200, 400, 1);
        this.players.getFirstDead(true, 400, 400, 2);
        this.enemy = new Enemy(this, 400, 370);
        //this.enemy.setVelocityX(-200);
        
        //this.physics.add.collider(this.players, front);
        


        this.physics.add.collider(this.players, front, (enemy, front) =>{
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

        this.player1;
        this.player2;

        this.players.children.iterate(function (player1) {
            if(player1.id == this.id){
                this.player1 = player1;
            }else{
                this.player2 = player1;
            }
        }, this);

        this.socket.on('newPositions',(data)=>{
            this.player2.x = data.x
            this.player2.y = data.y
            this.player2.play(data.pos)
            if(data.space){
                this.player2.fire(this.time.now)
            }
        });

        this.themeSound = this.sound.add("theme", { volume: 0.1 });

        //this.themeSound.play();

        let fireSound = this.sound.add("fire", {
            volume: 0.1
        });

        this.players.children.iterate(function (player1) {
            player1.fireSound = fireSound;
        }, this);

        this.physics.add.overlap(this.player2, this.player1.bullets, (player1, bullet) => {
        
            this.player1.bullets.killAndHide(bullet);

            //prevent collision with multiple enemies by removing the bullet from screen and stoping it
            bullet.removeFromScreen();

            player1.life -= bullet.power;
            
            //update the score text
            if(player1.id == 1){
                this.lifeLabel1.setText("Player 1: " + player1.life)
            }else{
                this.lifeLabel2.setText("Player 2: " + player1.life)
            }
            this.socket.emit('life', {id:player1.id, life:player1.life})
        });

        this.socket.on('id', (data)=>{
            this.scene.stop()
            this.scene.start("Play")
        })
        
        this.socket.on('life', (data)=>{///workiiiiing
            if(data.life < this.player1.life){
                this.player1.life = data.life
                if(this.player1.id == 1){
                    this.lifeLabel1.setText("Player 1: " + this.player1.life)
                }else{
                    this.lifeLabel2.setText("Player 2: " + this.player1.life)
                }
            }
        })
    }

    update(time) {
        this.players.children.iterate(function (player1) {
            if(player1.life > 0){
                player1.update(time, this.cursors, this.socket, this.id, this.player2)
            }else{
                player1.dead()
                //stops this scene
                this.scene.stop();

                this.themeSound.stop();

                //starts the game over scene and passes the actual score to render at that scene
                this.scene.start('Finish', {id: this.id, socket: this.socket, loserID: player1.id})
            } 
        }, this);
        
    }
    

}