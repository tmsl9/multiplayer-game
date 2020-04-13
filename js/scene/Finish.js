export default class finish extends Phaser.Scene {
    constructor() {
        super("Finish");
    }

    /**
     * used to receive data from other scenes
     */
    init(data) {
        console.log("Finish scene: ", data)

        //get score passed from PlayGame scene
        this.id = data.id
        this.socket = data.socket
        this.loserID = data.loserID
        this.volume = data.volume

    }

    create() {

        this.result = this.id == this.loserID ? "You lost..." : "You won!!!"

        let { width, height } = this.sys.game.canvas
        this.width = width;
        this.height = height;

        //get all basic cursors input (Up, Down, Left, Right, Space Bar and Shift)
        this.cursors = this.input.keyboard.createCursorKeys();
        this.composeHUD();

        this.gameOverSound = this.sound.add("gameover", { volume: this.volume });

        //this.gameOverSound.play();

    }
    composeHUD() {
        //add the background in the center of screen (could set anchor point to left up using .setOrigin(0,0))
       // this.bg = this.add.image(this.width / 2, this.height / 2, "bg");
        //scale background
       // this.bg.setDisplaySize(this.width, this.height);

        this.add.text(230, 200, this.result, {
            font: "50px Cambria",
            fill: this.id == this.loserID ? "#ff0000" : "#0f0"
        });
        this.add.text(150, 300, "Press space to restart", {
            font: "40px Cambria",
            fill: this.id == this.loserID ? "#ff0000" : "#0f0"
        });

    }

    update() {
        if (this.cursors.space.isDown) {

            //stops the presente scene
            this.scene.stop();

            this.gameOverSound.stop();

            //starts PlayGame scene
            this.scene.start('Play');/////look at this because the socket will be rebooted
        }
    }

}