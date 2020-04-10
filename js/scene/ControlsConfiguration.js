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
        this.add.text(100, 80, 'A-Z, 0-9, LeftShift, LeftControl, Alt,', { fill: '#fff' })
        this.add.text(100, 100, 'CapsLock, Esc, Spacebar, Tab, Enter, Ponto,', { fill: '#fff' })
        this.add.text(100, 120, 'Backspace, Up, Left, Right, Down, Vírgula', { fill: '#fff' })
        
        this.add.text(100, 200, 'Mover para cima', { fill: '#fff' })
        this.upButton = this.add.text(400, 200, this.keyText(this.cursors.up.keyCode), { fill: '#fff' })
        this.buttonInteraction(this.upButton)
        this.add.text(100, 220, 'Mover para baixo', { fill: '#fff' })
        this.downButton = this.add.text(400, 220, this.keyText(this.cursors.down.keyCode), { fill: '#fff' })
        this.buttonInteraction(this.downButton)
        this.add.text(100, 240, 'Mover para a esquerda', { fill: '#fff' })
        this.leftButton = this.add.text(400, 240, this.keyText(this.cursors.left.keyCode), { fill: '#fff' })
        this.buttonInteraction(this.leftButton)
        this.add.text(100, 260, 'Mover para a direita', { fill: '#fff' })
        this.rightButton = this.add.text(400, 260, this.keyText(this.cursors.right.keyCode), { fill: '#fff' })
        this.buttonInteraction(this.rightButton)
        this.add.text(100, 280, 'Lutar', { fill: '#fff' })
        this.fightButton = this.add.text(400, 280, this.keyText(this.cursors.fight.keyCode), { fill: '#fff' })
        this.buttonInteraction(this.fightButton)
        this.add.text(100, 300, 'Loja', { fill: '#fff' })
        this.shopButton = this.add.text(400, 300, this.keyText(this.cursors.shop.keyCode), { fill: '#fff' })
        this.buttonInteraction(this.shopButton)
        this.add.text(100, 320, 'Atirar', { fill: '#fff' })
        this.shopButton = this.add.text(400, 320, 'Mouse\'s left button (*)', { fill: '#fff' })
        this.add.text(100, 500, '(*) Não pode ser alterado', { fill: '#fff' })

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
    
    clickKey(pointer, buttons){///z está a ir pra cima
        if(buttons.length > 0){
            this.button = buttons[0]
            this.button.setStyle({ fill: '#0f0'})
            this.input.off('pointerdown', this.clickKey, this)
            this.input.keyboard.addListener("keydown", ()=>{
                var key = event.keyCode
                if(key == this.charsAllowed[this.button.text] || this.canChoseKey(key)){
                    this.changeKey(key)
                    this.button.setText(this.keyText(key))
                    this.button.setStyle({ fill: '#ffa82e'})
                    this.input.keyboard.removeAllListeners("keydown")
                }
            })
            this.input.on('pointerout', this.outKey, this)
        }
    }

    keyText(key){
        for(var keyString in this.charsAllowed){
            if(this.charsAllowed[keyString] == key){
                return keyString
            }
        }
        return ""
    }

    outKey(pointer){
        this.input.keyboard.removeAllListeners("keydown")
        this.input.on('pointerdown', this.clickKey, this)
        this.input.off('pointerout', this.outKey, this)
    }
  
    changeKey(key){/////////////////////
        if(this.keyText(this.cursors.up.keyCode) == this.button.text){
            this.cursors.up.keyCode = key
        }else if(this.keyText(this.cursors.down.keyCode) == this.button.text){
            this.cursors.down.keyCode = key
        }else if(this.keyText(this.cursors.left.keyCode) == this.button.text){
            this.cursors.left.keyCode = key
        }else if(this.keyText(this.cursors.right.keyCode) == this.button.text){
            this.cursors.right.keyCode = key
        }else if(this.keyText(this.cursors.fight.keyCode) == this.button.text){
            this.cursors.fight.keyCode = key
        }else if(this.keyText(this.cursors.shop.keyCode) == this.button.text){
            this.cursors.shop.keyCode = key
        }
    }

    getTextFromCharsAllowed(keyCode){
        for(var i in this.charsAllowed){
            if(this.charsAllowed[i] == keyCode){
                return i
            }
        }
        return ""
    }

    canChoseKey(keyCode){
        var isAllowed = false
        for(var i in this.charsAllowed){
            if(this.charsAllowed[i] == keyCode){
                isAllowed = true
                break
            }
        }
        return isAllowed && keyCode != this.cursors.up.keyCode && keyCode != this.cursors.down.keyCode
        && keyCode != this.cursors.left.keyCode && keyCode != this.cursors.right.keyCode
        && keyCode != this.cursors.fight.keyCode&& keyCode != this.cursors.shop.keyCode
    }

    charsAllowedFun(){
        var c = {}
        for(var i = '0'.charCodeAt(0); i <= '9'.charCodeAt(0); i++){
            c[String.fromCharCode(i)] = i
        }
        for(var i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++){
            c[String.fromCharCode(i)] = i
        }

        c['LeftShift'] = 16
        c['LeftControl'] = 17
        c['Alt'] = 18
        c['Capslock'] = 20
        c['Esc'] = 27
        c['Spacebar'] = 32
        c['Tab'] = 9
        c['Enter'] = 13
        c['Ponto'] = 190
        c['Vírgula'] = 188
        c['Backspace'] = 8
        c['Left'] = 37
        c['Up'] = 38
        c['Right'] = 39
        c['Down'] = 40

        return c
    }
    
}