export default class controlsConfiguration extends Phaser.Scene {
    constructor() {
        super("ControlsConfiguration");
    }
    
    init(data){
        console.log("ControlsConfiguration: ", data)
        this.data = data
        this.cursors = this.data.cursors
    }

    create() {
        console.log("ControlsConfiguration");
        
        this.charsAllowed = this.charsAllowedFun()
        
        this.add.text(50, 50, 'Characters allowed:', { fill: '#fff' })
        this.add.text(100, 80, 'A-Z, 0-9, LeftShift, Control, Alt, CapsLock,', { fill: '#fff' })
        this.add.text(100, 100, 'Esc, Spacebar, Tab, Enter, Ponto, Vírgula,', { fill: '#fff' })
        this.add.text(100, 120, 'Backspace, Up, Left, Right, Down', { fill: '#fff' })
        
        this.add.text(100, 200, 'Mover para cima', { fill: '#fff' })
        this.upButton = this.add.text(400, 200, String.fromCharCode(this.cursors.up.keyCode), { fill: '#fff' })
        this.buttonInteraction(this.upButton)
        this.add.text(100, 220, 'Mover para baixo', { fill: '#fff' })
        this.downButton = this.add.text(400, 220, String.fromCharCode(this.cursors.down.keyCode), { fill: '#fff' })
        this.buttonInteraction(this.downButton)
        this.add.text(100, 240, 'Mover para a esquerda', { fill: '#fff' })
        this.leftButton = this.add.text(400, 240, String.fromCharCode(this.cursors.left.keyCode), { fill: '#fff' })
        this.buttonInteraction(this.leftButton)
        this.add.text(100, 260, 'Mover para a direita', { fill: '#fff' })
        this.rightButton = this.add.text(400, 260, String.fromCharCode(this.cursors.right.keyCode), { fill: '#fff' })
        this.buttonInteraction(this.rightButton)
        this.add.text(100, 280, 'Lutar', { fill: '#fff' })
        this.fightButton = this.add.text(400, 280, String.fromCharCode(this.cursors.fight.keyCode), { fill: '#fff' })/////fight é o space ou seja vai imprimir uma coisa que nao existe
        this.buttonInteraction(this.fightButton)

        this.input.on("pointerdown", this.clickKey, this)

        this.okButton = this.add.text(220, 400, 'Ok', { fill: '#fff' })
            .on('pointerdown', () => {
                this.data.cursors = this.cursors
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
    
    clickKey(pointer, buttons){//atenção quando clica no ecrã dá erro, arranjar solução com if ou assim
        if(buttons.length > 0){
            this.button = buttons[0]
            this.button.setStyle({ fill: '#0f0'})
            this.input.off('pointerdown', this.clickKey, this)
            this.input.keyboard.addListener("keydown", ()=>{
                var key = event.keyCode
                var letter = String.fromCharCode(key)
                if(letter == this.button.text || this.canChoseKey(key)){
                    this.changeKey(key)
                    this.button.setText(letter)
                    this.button.setStyle({ fill: '#ffa82e'})
                    this.input.keyboard.removeAllListeners("keydown")
                }
            })
            this.input.on('pointerout', this.outKey, this)
        }
    }

    outKey(pointer){
        this.input.on('pointerdown', this.clickKey, this)
        this.input.off('pointerout', this.outKey, this)
    }
  
    changeKey(key){
        if(String.fromCharCode(this.cursors.up.keyCode) == this.button.text){
            this.cursors.up.keyCode = key
        }else if(String.fromCharCode(this.cursors.down.keyCode) == this.button.text){
            this.cursors.down.keyCode = key
        }else if(String.fromCharCode(this.cursors.left.keyCode) == this.button.text){
            this.cursors.left.keyCode = key
        }else if(String.fromCharCode(this.cursors.right.keyCode) == this.button.text){
            this.cursors.right.keyCode = key
        }else if(String.fromCharCode(this.cursors.fight.keyCode) == this.button.text){
            this.cursors.fight.keyCode = key
        }
    }

    canChoseKey(keyCode){
        return this.charsAllowed.includes(keyCode) && keyCode != this.cursors.up.keyCode && keyCode != this.cursors.down.keyCode && keyCode != this.cursors.left.keyCode 
        && keyCode != this.cursors.right.keyCode && keyCode != this.cursors.fight.keyCode
    }

    charsAllowedFun(){
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