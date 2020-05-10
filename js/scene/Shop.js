import Coin from "../models/Coin.js";

export default class shop extends Phaser.Scene {
    constructor(myPlayer){
        super("Shop")
        this.myPlayer = myPlayer
        this.money = myPlayer.money
    }

    create() {
        console.log("Shop scene");

        this.sceneWidth = this.game.config.width;
        this.sceneHeight = this.game.config.height;

        this.y1 = this.sceneWidth - 100
        this.y2 = this.sceneWidth - 80
        this.y3 = this.sceneWidth - 60
        this.y4 = this.sceneWidth - 40
        
        this.red = 0
        this.green = 1
        this.darkGreen = 2

        this.add.image(40, this.y1, "bullet1").setScale(1.2)
        this.add.image(40, this.y2, "bullet2").setScale(1.2)
        this.add.image(40, this.y3, "bullet3").setScale(1.2)
        this.add.image(40, this.y4, "regenLife").setScale(0.1)

        var a =this.add.image(95, this.y1, "+damage").setScale(0.1)
        this.add.image(100, this.y2, "+velocity").setScale(0.1)
        this.add.image(102, this.y3, "-fire rate").setScale(0.1)
        this.add.image(85, this.y4, "+life").setScale(0.1)
        
        new Coin(this, 150, this.y1).setScale(0.06).playAnim()
        new Coin(this, 150, this.y2).setScale(0.06).playAnim()
        new Coin(this, 150, this.y3).setScale(0.06).playAnim()
        new Coin(this, 150, this.y4).setScale(0.06).playAnim()

        this.buttonInteraction(this.add.image(180, this.y1, "100", this.color(100)).setScale(0.1))
        this.buttonInteraction(this.add.image(180, this.y2, "200", this.color(200)).setScale(0.1))
        this.buttonInteraction(this.add.image(180, this.y3, "300", this.color(300)).setScale(0.1))
        this.buttonInteraction(this.add.image(180, this.y4, "200", this.color(200)).setScale(0.1))

        this.input.on("pointerdown", this.buyPowerUp, this)
    }

    buttonInteraction(but){
        if(but.frame.name == this.green){
            but.setInteractive()
            but.on('pointerover', () => but.setFrame(this.darkGreen))
            but.on('pointerout', () => but.setFrame(this.green))
        }
    }

    buyPowerUp(pointer, prices){
        var price = prices[0]
        if(prices.length > 0 && price.frame.name == this.darkGreen){
            this.myPlayer.money -= parseInt(price.texture.key)
            this.myPlayer.buyPowerUp(this.numberPowerUp(price.y))
            this.scene.stop()
            this.scene.remove()
        }
    }

    color(price){
        return this.money < price ? this.red : this.green
    }

    numberPowerUp(y){
        return y == this.y1 ? 1 : y == this.y2 ? 2 : y == this.y3 ? 3 : 4
    }
}