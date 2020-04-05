import Bird from "../models/Bird.js";
import Enemy from "../models/Enemy.js";

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
        
        const width = this.game.config.width;
        const height = this.game.config.height;

        this.map = this.make.tilemap({ key: "map1" });
        const tileset = this.map.addTilesetImage("tile-map", "tiles");
        this.map.createStaticLayer("back", tileset, 0, 0);
        const front = this.map.createStaticLayer("front", tileset, 0, 0);
    
        front.setCollisionByProperty({ "collides": true }, true);
        
        this.cursors = this.input.keyboard.createCursorKeys()
        
        this.birds = this.physics.add.group({
            maxSize: 2,
            classType: Bird
        });
        //this.bird = new Bird(this, 200, 400, 1)
        //this.bird2 = new Bird(this, 400, 400, 2)

        this.birds.getFirstDead(true, 200, 400, 1);
        this.birds.getFirstDead(true, 400, 400, 2);
        this.enemy = new Enemy(this, 450, 370);
        this.enemy.setVelocityX(-200);
        this.physics.add.collider(this.enemy, front);
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
            //console.log(data[0].id, data[0].x, data[0].y)
            //console.log(data[1].id, data[1].x, data[1].y)
            //for(var i = 0; i < data.length; i++){//para mais de 2 jogadores
                //this.birds.children.iterate(function (bird) {
                    //if (bird.id == data[i].id) {
                        if(data[0].x > 0 + this.bird2.frame.width && data[0].x < this.game.config.width - this.bird2.frame.width){
                            this.bird2.x = data[0].x
                        }
                        if(data[0].y > 0 + this.bird2.frame.height && data[0].y < this.game.config.height - this.bird2.frame.height){
                            this.bird2.y = data[0].y
                        }
                        if(data[0].space){
                            this.bird2.fire(this.time.now)
                        }
                    //}
                //}, this);
            //}
        });

        this.themeSound = this.sound.add("theme", { volume: 0.1 });

        this.themeSound.play();

        let fireSound = this.sound.add("fire", {
            volume: 0.1
        });

        this.birds.children.iterate(function (bird) {
            bird.fireSound = fireSound;
            this.physics.add.collider(bird, front);
        }, this);
        
        this.birds.children.iterate(function (birdBullets) {
            this.birds.children.iterate(function (bird) {
                if(birdBullets.id != bird.id){
                    this.physics.add.overlap(bird, birdBullets.bullets, (bird, bullet) => {
                    
                        birdBullets.bullets.killAndHide(bullet);

                        //prevent collision with multiple enemies by removing the bullet from screen and stoping it
                        bullet.removeFromScreen();

                        bird.life -= bullet.power;
                        
                        //update the score text
                        if(bird.id == 1){
                            this.lifeLabel1.setText("Player 1: " + bird.life)
                        }else{
                            this.lifeLabel2.setText("Player 2: " + bird.life)
                        }
                    });
                }
            }, this);
        }, this);
    }

    update(time) {
        if (this.cursors.up.isDown) {
            this.bird.setVelocityY(-this.bird.velocity);
            this.socket.emit('keyPress',{input:'xy', x:this.bird.x, y:this.bird.y});
        }
        if (this.cursors.down.isDown) {
            this.bird.setVelocityY(this.bird.velocity);
            this.socket.emit('keyPress',{input:'xy', x:this.bird.x, y:this.bird.y});
        }
        if (this.cursors.left.isDown) {/////funciona se mandarmos vetor com teclas a false ou true
            this.bird.setVelocityX(-this.bird.velocity);
            this.socket.emit('keyPress',{input:'xy', x:this.bird.x, y:this.bird.y});
        }
        if (this.cursors.right.isDown) {
            this.bird.setVelocityX(this.bird.velocity);
            this.socket.emit('keyPress',{input:'xy', x:this.bird.x, y:this.bird.y});
        }
        if (this.cursors.space.isDown) {
            this.bird.fire(time);
            this.socket.emit('keyPress',{input:'space',state:true});
        }





        /////////////////////////////////
        if (this.cursors.up.isUp && this.cursors.down.isUp) {
            this.bird.setVelocityY(0);
            this.socket.emit('keyPress',{input:'xy', x:this.bird.x, y:this.bird.y});
        }
        if (this.cursors.left.isUp && this.cursors.right.isUp) {/////funciona se mandarmos vetor com teclas a false ou true
            this.bird.setVelocityX(0);
            this.socket.emit('keyPress',{input:'xy', x:this.bird.x, y:this.bird.y});
        }
        if (this.cursors.space.isUp) {
            this.socket.emit('keyPress',{input:'space',state:false});
        }

        this.birds.children.iterate(function (bird) {
            if(bird.life > 0){
                bird.update()
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