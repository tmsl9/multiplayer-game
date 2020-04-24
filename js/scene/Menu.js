export default class menu extends Phaser.Scene {
    constructor() {
        super("Menu");
    }
    
    init(data){
        console.log("Menu scene")
        this.data = data
    }

    create() {
        this.volumeButton = this.add.text(280, 300, 'Volume', { fill: '#fff' })
            .on('pointerdown', () => {
                this.scene.stop()
                this.scene.start("SoundAdjustment", this.data)
            })
            this.buttonInteraction(this.volumeButton)
        this.tecladoButton = this.add.text(280, 330, 'Teclado', { fill: '#fff' })
            .on('pointerdown', () => {
                this.scene.stop()
                this.scene.start("ControlsConfiguration", this.data)
            })
            this.buttonInteraction(this.tecladoButton)
        this.retrocederButton = this.add.text(150, 380, '<- Retroceder', { fill: '#fff' })
            .on('pointerdown', () => {
                this.scene.stop()
                this.scene.start("Play", this.data)
            })
        this.buttonInteraction(this.retrocederButton)
    }

    buttonInteraction(but){
        but.setInteractive()
        but.on('pointerover', () => but.setStyle({ fill: '#ffa82e'}))
        but.on('pointerout', () => but.setStyle({ fill: '#fff'}))
    }

}