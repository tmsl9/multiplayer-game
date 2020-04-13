import Player from "../models/Player.js";

export default class shop extends Phaser.Scene {
    constructor() {
        super("Shop");
    }
    
    init(data){
        console.log("Menu: ", data)
        this.data = data
        this.socket = data.socket
        this.id = data.id
    }

    create() {
        console.log("Menu");
        this.volume = 250
        this.min = 200
        this.max = 300
        this.mouseX = this.game.input.mousePointer.x
        this.bird1 = new Player(this, this.min, 400, 1)
        this.bird = new Player(this, this.volume, 400, 1)
        this.bird2 = new Player(this, this.max, 400, 1)
        this.bird.setInteractive()
        this.bird.on('pointerdown', () => {
           
            if(this.mouseX >= this.min && this.mouseX <= this.max){
                this.bird = this.mouseX
            }else{
                this.bird = this.mouseX < this.min ? this.min : this.max
            }
            this.bird.x =  this.mouseX
        })
        console.log(this.mouseX)
        
            //som
            //configurar controlos
               
    }
    listener(){
        console.log(game.input.mousePointer.x)
    }


    
}