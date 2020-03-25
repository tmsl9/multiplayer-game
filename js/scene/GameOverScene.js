import Bird from '../models/Bird.js';

/**
 * 
 */
export default class GameOverScene extends Phaser.Scene {
    constructor() {

        super("GameOver");
        this.maxScore = 0;

    }

    /**
     * used to receive data from other scenes
     */
    init(data) {
        console.log('init', data);

        //get score passed from PlayGame scene
        this.score = data.score;

        //keeps the highest score
        this.maxScore = this.maxScore < this.score ? this.score : this.maxScore;
    }

    create() {
        let { width, height } = this.sys.game.canvas
        this.width = width;
        this.height = height;

        //get all basic cursors input (Up, Down, Left, Right, Space Bar and Shift)
        this.cursors = this.input.keyboard.createCursorKeys();
        this.composeHUD();

        this.gameOverSound = this.sound.add("gameover", { volume: 0.1 });

        this.gameOverSound.play();

    }
    composeHUD() {
        //add the background in the center of screen (could set anchor point to left up using .setOrigin(0,0))
        this.bg = this.add.image(this.width / 2, this.height / 2, "bg");
        //scale background
        this.bg.setDisplaySize(this.width, this.height);

        this.labelScore = this.add.text(190, 20, "" + this.score, {
            font: "30px Cambria",
            fill: "#ffffff"
        });
        this.labelLives = this.add.text(290, 20, "0", {
            font: "30px Cambria",
            fill: "#ffffff"
        });
        this.labelMaxScore = this.add.text(290, 100, "Max Score: " + this.maxScore, {
            font: "30px Cambria",
            fill: "#ffffff"
        });
        this.add.text(150, 200, "Game Over\nPress space to restart", {
            font: "50px Cambria",
            fill: "#ff0000"
        });
        this.bird = new Bird(this, 100, 100, null, null);

    }

    update() {
        if (this.cursors.space.isDown) {

            //stops the presente scene
            this.scene.stop();

            this.gameOverSound.stop();

            //starts PlayGame scene
            this.scene.start('PlayGame');
        }
    }

}