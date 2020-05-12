export default class play extends Phaser.Scene {
    constructor() {
        super("Play");
    }
    
    init(data){
        console.log("Play scene")
        this.data = data
        this.socket = data.socket
        this.id = data.id
    }

    create() {
        this.add.image(0, 0, "bg").setDisplayOrigin(0, 0).setDisplaySize(640, 640);
        this.playButton = this.add.text(280, 270, 'Play', { fill: '#000' , fontSize: "25px"})
            .setInteractive()
            .on('pointerdown', () => {
                if(this.clickLeft){
                    this.scene.stop()
                    this.scene.start("WaitingOpponent", this.data)
                }
            })
            .on('pointerover', () => this.playButton.setStyle({ fill: '#800000'}))
            .on('pointerout', () => this.playButton.setStyle({ fill: '#000'}));

        this.menuButton = this.add.text(280, 300, 'Menu', { fill: '#000' , fontSize: "25px"})
            .setInteractive()
            .on('pointerdown', () => {
                if(this.clickLeft){
                    this.scene.stop()
                    this.scene.start("Menu", this.data)
                }
            })
            .on('pointerover', () => this.menuButton.setStyle({ fill: '#800000'}))
            .on('pointerout', () => this.menuButton.setStyle({ fill: '#000'}));
    }

    clickLeft(pointer){
        return pointer.leftButtonDown()
    }
}