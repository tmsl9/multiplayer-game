export default class menu extends Phaser.Scene {
    constructor() {
        super("Menu");
    }
    
    init(data){
        console.log("Menu scene")
        this.data = data
    }

    create() {
        this.add.image(0, 0, "bg").setDisplayOrigin(0, 0).setDisplaySize(640, 640);
        this.volumeButton = this.add.text(268, 270, 'Volume', { fill: '#000' , fontSize: "25px"})
            .on('pointerdown', () => {
                this.scene.stop()
                this.scene.start("SoundAdjustment", this.data)
            })
            this.buttonInteraction(this.volumeButton)
        this.tecladoButton = this.add.text(262, 300, 'Teclado', { fill: '#000' , fontSize: "25px"})
            .on('pointerdown', () => {
                this.scene.stop()
                this.scene.start("ControlsConfiguration", this.data)
            })
            this.buttonInteraction(this.tecladoButton)
        this.retrocederButton = this.add.text(305, 400, '←', { fill: '#000' , fontSize: "30px"})
            .on('pointerdown', () => {
                this.scene.stop()
                this.scene.start("Play", this.data)
            })
        this.buttonInteraction(this.retrocederButton)
    }

    buttonInteraction(but){
        but.setInteractive()
        but.on('pointerover', () => but.setStyle({ fill: '#800000'}))
        but.on('pointerout', () => but.setStyle({ fill: '#000'}))
    }

}