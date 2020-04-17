import Coin from "../models/Coin.js";

export default class shop extends Phaser.Scene {
    constructor(parent){
        super("Shop")
        this.parent = parent
    }
    create() {
        console.log("Shop");

        const sceneWidth = this.game.config.width;
        const sceneHeight = this.game.config.height;

        const y1 = sceneHeight - 100
        const y2 = sceneHeight - 80
        const y3 = sceneHeight - 60
        const y4 = sceneHeight - 40

        var bullet1 = this.add.image(40, y1, "bullet1")
        var bullet2 = this.add.image(40, y2, "bullet2")
        var bullet3 = this.add.image(40, y3, "bullet3")
        var regenLife = this.add.image(40, y4, "regenLife")

        this.add.text(50, y1, "+damage", {font: "30px Cambria", fill: "#ffffff"});
        this.add.text(50, y2, "+velocity", {font: "30px Cambria", fill: "#ffffff"});
        this.add.text(50, y3, "-fire rate", {font: "30px Cambria", fill: "#ffffff"});
        this.add.text(50, y4, "+life", {font: "30px Cambria", fill: "#ffffff"});

        coin1 = new Coin(this, 70, y1)
        .playAnim()
        coin2 = new Coin(this, 70, y2)
        .playAnim()
        coin3 = new Coin(this, 70, y3)
        .playAnim()
        coin4 = new Coin(this, 70, y4)
        .playAnim()

        this.add.text(85, y1, "100", {font: "30px Cambria", fill: "#ffffff"});
        this.add.text(85, y2, "200", {font: "30px Cambria", fill: "#ffffff"});
        this.add.text(85, y3, "300", {font: "30px Cambria", fill: "#ffffff"});
        this.add.text(85, y4, "200", {font: "30px Cambria", fill: "#ffffff"});
    }
}