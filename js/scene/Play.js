export default class play extends Phaser.Scene {
    constructor() {
        super("Play");
    }
    
    create() {
        console.log("Play");
        this.id = 0
        
        this.socket = io();
        this.socket.on('id',(data)=>{
            var id = data
            console.log("id received:", id)
            this.clickButton = this.add.text(300, 300, 'Click me!', { fill: '#0f0' })
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.stop()
                this.scene.start("WaitingOpponent", {id: id, socket: this.socket})
            })
            .on('pointerover', () => this.clickButton.setStyle({ fill: '#ff0'}))
            .on('pointerout', () => this.clickButton.setStyle({ fill: '#0f0'}));
        });       
    }


    
}