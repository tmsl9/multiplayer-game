export default class controlsConfiguration extends Phaser.Scene {
    constructor() {
        super("ControlsConfiguration");
    }
    
    init(data){
        console.log("ControlsConfiguration scene")
        this.data = data
        this.cursors = this.defCursors()
    }

    create() {
        
        this.add.image(0, 0, "bg").setDisplayOrigin(0, 0).setDisplaySize(640, 640);
        this.charsAllowed = this.charsAllowedFun()
        
        this.add.text(50, 50, 'Characters allowed:', { fill: '#000' })
        this.add.text(100, 80, 'A-Z, 0-9, LeftShift, LeftControl, Alt,', { fill: '#000' })
        this.add.text(100, 100, 'CapsLock, Esc, Spacebar, Tab, Enter, Ponto,', { fill: '#000' })
        this.add.text(100, 120, 'Backspace, Up, Left, Right, Down, Vírgula', { fill: '#000' })
        
        this.add.text(100, 200, 'Mover para cima', { fill: '#000' })
        this.upButton = this.add.text(400, 200, this.keyText(this.cursors.up.keyCode), { fill: '#000' })
        this.buttonInteraction(this.upButton)
        this.add.text(100, 220, 'Mover para baixo', { fill: '#000' })
        this.downButton = this.add.text(400, 220, this.keyText(this.cursors.down.keyCode), { fill: '#000' })
        this.buttonInteraction(this.downButton)
        this.add.text(100, 240, 'Mover para a esquerda', { fill: '#000' })
        this.leftButton = this.add.text(400, 240, this.keyText(this.cursors.left.keyCode), { fill: '#000' })
        this.buttonInteraction(this.leftButton)
        this.add.text(100, 260, 'Mover para a direita', { fill: '#000' })
        this.rightButton = this.add.text(400, 260, this.keyText(this.cursors.right.keyCode), { fill: '#000' })
        this.buttonInteraction(this.rightButton)
        this.add.text(100, 280, 'Lutar', { fill: '#000' })
        this.fightButton = this.add.text(400, 280, this.keyText(this.cursors.fight.keyCode), { fill: '#000' })
        this.buttonInteraction(this.fightButton)
        this.add.text(100, 300, 'Loja', { fill: '#000' })
        this.shopButton = this.add.text(400, 300, this.keyText(this.cursors.shop.keyCode), { fill: '#000' })
        this.buttonInteraction(this.shopButton)
        this.add.text(100, 320, 'Atirar', { fill: '#000' })
        this.shopButton = this.add.text(400, 320, 'Mouse\'s left button (*)', { fill: '#000' })
        this.add.text(100, 500, '(*) Não pode ser alterado', { fill: '#000' })

        this.input.on("pointerdown", this.clickKey, this)

        this.okButton = this.add.text(220, 400, 'Ok', { fill: '#000' })
            .on('pointerdown', () => {
                if(this.clickLeft){
                    this.data.cursors = this.cursors
                    this.destroyCursors()
                    this.scene.stop()
                    this.scene.start("Menu", this.data)
                }
            })
        this.buttonInteraction(this.okButton)
        this.cancelarButton = this.add.text(300, 400, 'Cancelar', { fill: '#000' })
            .on('pointerdown', () => {
                if(this.clickLeft){
                    this.destroyCursors()
                    this.scene.stop()
                    this.scene.start("Menu", this.data)
                }
            })
        this.buttonInteraction(this.cancelarButton)
    }

    buttonInteraction(but){
        but.setInteractive()
        but.on('pointerover', () => but.setStyle({ fill: '#800000'}))
        but.on('pointerout', () => but.setStyle({ fill: '#000'}))
    }
    
    clickLeft(pointer){
        return pointer.leftButtonDown()
    }

    clickKey(pointer, buttons){
        if(this.clickLeft && buttons.length > 0){
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
  
    changeKey(key){
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

    defCursors(){
        return {
            up: this.input.keyboard.addKey(this.data.cursors.up.keyCode),
            down: this.input.keyboard.addKey(this.data.cursors.down.keyCode),
            left: this.input.keyboard.addKey(this.data.cursors.left.keyCode),
            right: this.input.keyboard.addKey(this.data.cursors.right.keyCode),
            fight: this.input.keyboard.addKey(this.data.cursors.fight.keyCode),
            shop: this.input.keyboard.addKey(this.data.cursors.shop.keyCode)
        }
    }

    destroyCursors(){
        this.input.keyboard.removeKey(this.cursors.up)
        this.input.keyboard.removeKey(this.cursors.down)
        this.input.keyboard.removeKey(this.cursors.left)
        this.input.keyboard.removeKey(this.cursors.right)
        this.input.keyboard.removeKey(this.cursors.fight)
        this.input.keyboard.removeKey(this.cursors.shop)
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