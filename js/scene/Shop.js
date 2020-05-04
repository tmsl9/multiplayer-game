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

        var textConfig = {font: "15px Cambria", fill: "#fff"}
        
        this.y1 = this.sceneHeight - 100
        this.y2 = this.sceneHeight - 80
        this.y3 = this.sceneHeight - 60
        this.y4 = this.sceneHeight - 40

        this.green = '#0f0'
        this.red = '#ff0000'
        this.darkGreen = '#16a823'

        this.add.image(40, this.y1, "bullet1").setScale(1.2)
        this.add.image(40, this.y2, "bullet2").setScale(1.2)
        this.add.image(40, this.y3, "bullet3").setScale(1.2)
        this.add.image(40, this.y4, "regenLife").setScale(0.1)

        this.add.text(60, this.y1, "+damage", textConfig);
        this.add.text(60, this.y2, "+velocity", textConfig);
        this.add.text(60, this.y3, "-fire rate", textConfig);
        this.add.text(60, this.y4, "+life", textConfig);

        var coin1 = new Coin(this, 150, this.y1).setScale(0.06)
        .playAnim()
        var coin2 = new Coin(this, 150, this.y2).setScale(0.06)
        .playAnim()
        var coin3 = new Coin(this, 150, this.y3).setScale(0.06)
        .playAnim()
        var coin4 = new Coin(this, 150, this.y4).setScale(0.06)
        .playAnim()

        var bullet1Price = this.add.text(160, this.y1, "100", textConfig).setFill(this.color(100))
        this.buttonInteraction(bullet1Price)
        var bullet2Price = this.add.text(160, this.y2, "200", textConfig).setFill(this.color(200))
        this.buttonInteraction(bullet2Price)
        var bullet3Price = this.add.text(160, this.y3, "300", textConfig).setFill(this.color(300))
        this.buttonInteraction(bullet3Price)
        var regenLifePrice = this.add.text(160, this.y4, "200", textConfig).setFill(this.color(200))
        this.buttonInteraction(regenLifePrice)
        this.input.on("pointerdown", this.buyPowerUp, this)
    }

    buttonInteraction(but){
        if(but.style.color == this.green){
            but.setInteractive()
            but.on('pointerover', () => but.setStyle({ fill: this.darkGreen }))
            but.on('pointerout', () => but.setStyle({ fill: this.green }))
        }
    }

    buyPowerUp(pointer, prices){
        var price = prices[0]
        if(prices.length > 0 && price.style.color == this.darkGreen){
            this.myPlayer.money -= parseInt(price.text)
            this.myPlayer.buyPowerUp(this.numberPowerUp(price.y))
            this.scene.stop()
        }
    }

    color(price){
        return this.money < price ? this.red : this.green
    }

    numberPowerUp(y){
        return y == this.y1 ? 1 : y == this.y2 ? 2 : y == this.y3 ? 3 : 4
    }
}