export default class controlsConfiguration extends Phaser.Scene {
    constructor() {
        super("ControlsConfiguration");
    }
    
    init(data){
        console.log("ControlsConfiguration: ", data)
        this.data = data
        this.cursors = {
            up: this.input.keyboard.addKey(data.cursors.up.keyCode),
            down: this.input.keyboard.addKey(data.cursors.down.keyCode),
            left: this.input.keyboard.addKey(data.cursors.left.keyCode),
            right: this.input.keyboard.addKey(data.cursors.right.keyCode),
            fight: this.input.keyboard.addKey(data.cursors.fight.keyCode)
        }
    }

    create() {//////aprender a ler do teclado perguntar ao professor alessandro
        console.log("ControlsConfiguration");
        
        this.charsAllowed = this.charsAllowed()
        
        this.add.text(50, 50, 'Characters allowed:', { fill: '#fff' })
        this.add.text(100, 80, 'A-Z, 0-9, LeftShift, Control, Alt, CapsLock,', { fill: '#fff' })
        this.add.text(100, 100, 'Esc, Spacebar, Tab, Enter, Ponto, Vírgula,', { fill: '#fff' })
        this.add.text(100, 120, 'Backspace, Up, Left, Right, Down', { fill: '#fff' })
        
        this.add.text(100, 200, 'Mover para a frente', { fill: '#fff' })
        this.upButton = this.add.text(400, 200, "\'"+String.fromCharCode(this.cursors.up.keyCode)+"\'", { fill: '#fff' })
            .setInteractive()
            .on('pointerdown', this.clickKey, this)
            .on('pointerover', () => this.upButton.setStyle({ fill: '#ffa82e'}))
            .on('pointerout', () => this.upButton.setStyle({ fill: '#fff'}));

        this.okButton = this.add.text(220, 400, 'Ok', { fill: '#fff' })
            .setInteractive()
            .on('pointerdown', () => {
                this.data.cursors = this.cursors
                this.scene.stop()
                this.scene.start("Menu", this.data)
            })
            .on('pointerover', () => this.okButton.setStyle({ fill: '#ffa82e'}))
            .on('pointerout', () => this.okButton.setStyle({ fill: '#fff'}));
        this.cancelarButton = this.add.text(300, 400, 'Cancelar', { fill: '#fff' })
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.stop()
                this.scene.start("Menu", this.data)
            })
            .on('pointerover', () => this.cancelarButton.setStyle({ fill: '#ffa82e'}))
            .on('pointerout', () => this.cancelarButton.setStyle({ fill: '#fff'}));
    }

    clickKey(pointer){
        this.upButton.off('pointerdown', this, this)
        onkeypress()
        console.log("click")
    }
   
    canChoseKey(keyCode){
        return keyCode != this.cursors.up.keyCode && keyCode != this.cursors.down.keyCode && keyCode != this.cursors.left.keyCode 
        && keyCode != this.cursors.right.keyCode && keyCode != this.cursors.fight.keyCode
    }

    charsAllowed(){
        var c = []
        for(var i = '0'.charCodeAt(0); i <= '9'.charCodeAt(0); i++){
            c.push(i)
        }
        for(var i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++){
            c.push(i)
        }

        c.push(16)
        c.push(17)
        c.push(18)
        c.push(20)
        c.push(27)
        c.push(32)
        c.push(9)
        c.push(13)
        c.push(190)
        c.push(188)
        c.push(8)
        c.push(37)
        c.push(38)
        c.push(39)
        c.push(40)

        return c
    }
    
}