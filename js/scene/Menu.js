export default class menu extends Phaser.Scene {
    constructor() {
        super("Menu");
    }
    
    init(data){
        console.log("Menu: ", data)
        this.data = data
        console.log(this.data.cursors.up.keyCode)
        console.log(this.data.cursors.down.keyCode)
        console.log(this.data.cursors.left.keyCode)
        console.log(this.data.cursors.right.keyCode)
        console.log(this.data.cursors.fight.keyCode)
    }

    create() {
        console.log("Menu");
        this.volumeButton = this.add.text(280, 300, 'Volume', { fill: '#fff' })
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.stop()
                this.scene.start("SoundAdjustment", this.data)
            })
            .on('pointerover', () => this.volumeButton.setStyle({ fill: '#ffa82e'}))
            .on('pointerout', () => this.volumeButton.setStyle({ fill: '#fff'}));
        this.tecladoButton = this.add.text(280, 330, 'Teclado', { fill: '#fff' })
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.stop()
                this.scene.start("ControlsConfiguration", this.data)
            })
            .on('pointerover', () => this.tecladoButton.setStyle({ fill: '#ffa82e'}))
            .on('pointerout', () => this.tecladoButton.setStyle({ fill: '#fff'}));
        this.retrocederButton = this.add.text(150, 380, '<- Retroceder', { fill: '#fff' })
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.stop()
                this.scene.start("Play", this.data)
            })
            .on('pointerover', () => this.retrocederButton.setStyle({ fill: '#ffa82e'}))
            .on('pointerout', () => this.retrocederButton.setStyle({ fill: '#fff'}));
    }
}