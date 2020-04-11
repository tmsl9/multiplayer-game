export default class soundAdjustment extends Phaser.Scene {
    constructor() {
        super("SoundAdjustment");
    }
    
    init(data){
        console.log("SoundAdjustment: ", data)
        this.data = data
        this.volume = data.volume * 100 + 300
    }

    create() {
        console.log("SoundAdjustment");
        
        this.min =300
        this.max = 400
        this.add.text(150, 290, 'Volume', { fill: '#fff' })
        this.add.text(260, 290, '0 |', { fill: '#fff' })
        this.add.text(345, 290, '|', { fill: '#fff' })
        this.add.text(411, 290, '| 100', { fill: '#fff' })
        this.volumeButton = this.add.image(this.volume, 298, "volume")
            .setInteractive()
            .on('pointerdown', this.clickVolume, this)
            .setScale(0.06)
        this.okButton = this.add.text(220, 400, 'Ok', { fill: '#fff' })
            .on('pointerdown', () => {
                this.data.volume = (this.volume - 300) / 100
                this.scene.stop()
                this.scene.start("Menu", this.data)
            })
        this.buttonInteraction(this.okButton)
        this.cancelarButton = this.add.text(300, 400, 'Cancelar', { fill: '#fff' })
            .on('pointerdown', () => {
                this.scene.stop()
                this.scene.start("Menu", this.data)
            })
        this.buttonInteraction(this.cancelarButton)
    }

    buttonInteraction(but){
        but.setInteractive()
        but.on('pointerover', () => but.setStyle({ fill: '#ffa82e'}))
        but.on('pointerout', () => but.setStyle({ fill: '#fff'}))
    }

    clickVolume(pointer){
        this.volumeButton.off('pointerdown', this.clickVolume, this)
        this.volumeButton.on('pointermove', this.dragVolume, this)
        this.input.on('pointermove', this.dragVolume, this)
        this.input.on('pointerup', this.stopDragVolume, this)
    }

    dragVolume(pointer){
        if(pointer.x >= this.min && pointer.x <= this.max){
            this.volumeButton.x = pointer.x
        }else{
            this.volumeButton.x = pointer.x < this.min ? this.min : this.max
        }
        this.volume = this.volumeButton.x
    }

    stopDragVolume(pointer){
        this.volumeButton.on('pointerdown', this.clickVolume, this)
        this.volumeButton.off('pointermove', this.dragVolume, this)
        this.input.off('pointermove', this.dragVolume, this)
        this.input.off('pointerup', this.stopDragVolume, this)
    }
}