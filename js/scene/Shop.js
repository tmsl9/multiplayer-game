import player from "../models/Player.js";

export default class shop extends Phaser {
    constructor() {
        super("Shop");
    }
    
    init(data, scene){
        console.log("Menu: ", data)
        this.data = data
        this.socket = data.socket
        this.id = data.id
        this.scene = scene
    }

    create() {
        console.log("Shop");

        this.sceneWidth = this.scene.game.config.width;
        this.sceneHeight = this.scene.game.config.height;

        this.bullet1 = this.scene.add.image(this.sceneHeight - 100, 40, "bullet1")
        this.bullet2 = this.scene.add.image(this.sceneHeight - 80, 40, "bullet2")
        this.bullet3 = this.scene.add.image(this.sceneHeight - 60, 40, "bullet3")
        this.regenLife = this.scene.add.image(this.sceneHeight - 40, 40, "regenLife")
        this.add.text(this.sceneHeight - 100, 50, "100", {
            font: "30px Cambria",
            fill: "#ffffff"
        });
        this.add.text(this.sceneHeight - 100, 50, "Player 2: 100", {
            font: "30px Cambria",
            fill: "#ffffff"
        });
        this.add.text(this.sceneHeight - 100, 50, "Player 2: 100", {
            font: "30px Cambria",
            fill: "#ffffff"
        });

    }
    
}