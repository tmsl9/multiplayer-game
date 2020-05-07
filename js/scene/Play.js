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
        this.playButton = this.add.text(280, 300, 'Play', { fill: '#fff' })
            .setInteractive()
            .on('pointerdown', () => {
                if(this.clickLeft){
                    this.scene.stop()
                    this.scene.start("WaitingOpponent", this.data)
                }
            })
            .on('pointerover', () => this.playButton.setStyle({ fill: '#ffa82e'}))
            .on('pointerout', () => this.playButton.setStyle({ fill: '#fff'}));

        this.menuButton = this.add.text(280, 330, 'Menu', { fill: '#fff' })
            .setInteractive()
            .on('pointerdown', () => {
                if(this.clickLeft){
                    this.scene.stop()
                    this.scene.start("Menu", this.data)
                }
            })
            .on('pointerover', () => this.menuButton.setStyle({ fill: '#ffa82e'}))
            .on('pointerout', () => this.menuButton.setStyle({ fill: '#fff'}));
    }

    clickLeft(pointer){
        return pointer.leftButtonDown()
    }
}