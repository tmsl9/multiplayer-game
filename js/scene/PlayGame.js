import Bird from "../models/Bird.js";
import EnemiesGroup from "../models/EnemiesGroup.js";

export default class playGame extends Phaser.Scene {
    constructor() {
        super("PlayGame");
    }

    init(data){
        console.log("PlayGame scene: ", data)

        this.socket = data.socket
        this.id = data.id
    }

    create() {
        console.log("Starting game");

        const width = this.game.config.width;
        const height = this.game.config.height;

        this.add.image(0, 0, "bg").setDisplayOrigin(0, 0).setDisplaySize(width, height);

        this.cursors = this.input.keyboard.createCursorKeys()
        
        this.birds = this.physics.add.group({
            maxSize: 2,
            classType: Bird
        });
        this.bird = new Bird(this, 200, 400, 1)//this.birds.getFirstDead(true, 200, 400, 1);/////
        this.bird2 = new Bird(this, 400, 400, 2)//this.birds.getFirstDead(true, 400, 400, 2);/////
        this.socket.on('newPositions',(data)=>{
            console.log(data[0].id, data[0].x, data[0].y)
            console.log(data[1].id, data[1].x, data[1].y)
            this.bird.x = data[0].x
            this.bird.y = data[0].y
            this.bird2.x = data[1].x
            this.bird2.y = data[1].y
            //this.birds.children.iterate(function (bird) {
                /*for(var i = 0 ; i < data.length; i++){
                    //console.log(bird.id, data[i].id)
                    if (this.bird.id = data[i].id) {
                        //console.log(data[i].id, data[i].x, data[i].y)
                        this.bird.x = data[i].x
                        this.bird.y = data[i].y
                    }else if (this.bird2.id = data[i].id) {
                        //console.log(data[i].id, data[i].x, data[i].y)
                        this.bird2.x = data[i].x
                        this.bird2.y = data[i].y
                    }
                }*/
            //}, this);
        });
    }

    update(time, delta) {
        if (this.cursors.up.isDown) {
            this.socket.emit('keyPress',{inputId:'up',state:true});
        }
        if (this.cursors.down.isDown) {
            this.socket.emit('keyPress',{inputId:'down',state:true});
        }
        if (this.cursors.left.isDown) {/////funciona se mandarmos vetor com teclas a false ou true
            this.socket.emit('keyPress',{inputId:'left',state:true});
        }
        if (this.cursors.right.isDown) {
            this.socket.emit('keyPress',{inputId:'right',state:true});
        }

        if (this.cursors.up.isUp) {
            this.socket.emit('keyPress',{inputId:'up',state:false});
        }
        if (this.cursors.down.isUp) {
            this.socket.emit('keyPress',{inputId:'down',state:false});
        }
        if (this.cursors.left.isUp) {/////funciona se mandarmos vetor com teclas a false ou true
            this.socket.emit('keyPress',{inputId:'left',state:false});
        }
        if (this.cursors.right.isUp) {
            this.socket.emit('keyPress',{inputId:'right',state:false});
        }
        
    }

}