export default class bootGame extends Phaser.Scene {
    constructor() {
        super("BootGame");
    }
    preload() {
        this.load.spritesheet("player1", "assets/player1.png", {
            frameWidth: 37.5,
            frameHeight: 50
        });

        this.load.spritesheet("player2", "assets/player2.png", {
            frameWidth: 37.5,
            frameHeight: 50
        });

        this.load.image("bullet", "assets/bullet.png");

        this.load.spritesheet("enemy", "assets/enemies.png", {
            frameHeight: 96,
            frameWidth: 96
        });

        this.load.spritesheet("explosion", "assets/explosion.png", {
            frameWidth: 64,
            frameHeight: 64,
        });

        this.load.image("bg", "assets/background.png");

        this.load.audio("fire", "assets/fireball.mp3");
        this.load.audio("theme", "assets/overworld.mp3");
        this.load.audio("gameover", "assets/gameover.mp3");

    }
    create() {
        console.log("BootGame")
        this.scene.stop()
        this.scene.start("Play");
    }
}