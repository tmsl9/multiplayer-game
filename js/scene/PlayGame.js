import Bird from "../models/Bird.js";
import Enemy from "../models/Enemy.js";

export default class playGame extends Phaser.Scene {
    constructor() {
        super("PlayGame");
    }

    init(data){
        console.log("PlayGame scene: ", data)
        this.data = data
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
        
        this.birds = this.physics.add.group({
            maxSize: 2,
            classType: Bird
        });
        //this.bird = new Bird(this, 200, 400, 1)
        //this.bird2 = new Bird(this, 400, 400, 2)

        this.birds.getFirstDead(true, 200, 400, 1);
        this.birds.getFirstDead(true, 400, 400, 2);
        this.enemy = new Enemy(this, 400, 370);
        //this.enemy.setVelocityX(-200);
        
        //this.physics.add.collider(this.birds, front);
        this.physics.add.collider(this.birds, front, (enemy, front) =>{
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

        this.bird;
        this.bird2;
        this.birds.children.iterate(function (bird) {
            if(bird.id == this.id){
                this.bird = bird;
            }else{
                this.bird2 = bird;
            }
        }, this);

        this.socket.on('newPositions',(data)=>{
            this.bird2.x = data[0].x
            this.bird2.y = data[0].y
            if(data[0].fight){
                this.bird2.fire(this.time.now)
            }
        });

        this.themeSound = this.sound.add("theme", { volume: 0.1 });

        this.themeSound.play();

        let fireSound = this.sound.add("fire", {
            volume: 0.1
        });

        this.birds.children.iterate(function (bird) {
            bird.fireSound = fireSound;
        }, this);

        this.physics.add.overlap(this.bird2, this.bird.bullets, (bird, bullet) => {
        
            this.bird.bullets.killAndHide(bullet);

            //prevent collision with multiple enemies by removing the bullet from screen and stoping it
            bullet.removeFromScreen();

            bird.life -= bullet.power;
            
            //update the score text
            if(bird.id == 1){
                this.lifeLabel1.setText("Player 1: " + bird.life)
            }else{
                this.lifeLabel2.setText("Player 2: " + bird.life)
            }
            this.socket.emit('life', {id:bird.id, life:bird.life})
        });

        this.socket.on('id', (data)=>{
            this.scene.stop()
            this.scene.start("Play")
        })
        
        this.socket.on('life', (data)=>{///workiiiiing
            if(data.life < this.bird.life){
                this.bird.life = data.life
                if(this.bird.id == 1){
                    this.lifeLabel1.setText("Player 1: " + this.bird.life)
                }else{
                    this.lifeLabel2.setText("Player 2: " + this.bird.life)
                }
            }
        })
    }

    update(time) {
        this.birds.children.iterate(function (bird) {
            if(bird.life > 0){
                bird.update(time, this.data)
            }else{
                bird.dead()
                //stops this scene
                this.scene.stop();

                this.themeSound.stop();

                //starts the game over scene and passes the actual score to render at that scene
                this.scene.start('Finish', {id: this.id, socket: this.socket, loserID: bird.id})
            } 
        }, this);
        
    }
    

}