export default class play extends Phaser.Scene {
    constructor() {
        super("Play");
    }
    
    init(data){
        console.log("Play: ", data)
        this.data = data
        this.socket = data.socket
        this.id = data.id
        console.log(data.cursors.up.keyCode)
        console.log(data.cursors.down.keyCode)
        console.log(data.cursors.left.keyCode)
        console.log(data.cursors.right.keyCode)
        console.log(data.cursors.fight.keyCode)
        console.log(data.cursors.shop.keyCode)
    }

    create() {
        console.log("Play");
        
        this.playButton = this.add.text(280, 300, 'Play', { fill: '#fff' })
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.stop()
                this.scene.start("WaitingOpponent", this.data)
            })
            .on('pointerover', () => this.playButton.setStyle({ fill: '#ffa82e'}))
            .on('pointerout', () => this.playButton.setStyle({ fill: '#fff'}));

        this.menuButton = this.add.text(280, 330, 'Menu', { fill: '#fff' })
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.stop()
                this.scene.start("Menu", this.data)
            })
            .on('pointerover', () => this.menuButton.setStyle({ fill: '#ffa82e'}))
            .on('pointerout', () => this.menuButton.setStyle({ fill: '#fff'}));
            //som
            //configurar controlos
               
    }
}