export default class bootGame extends Phaser.Scene {
    constructor() {
        super("BootGame");
    }
    
    preload() {
        this.load.spritesheet("player1", "assets/player1.png", {
            frameWidth: 96/3,
            frameHeight: 190/4
        });

        this.load.spritesheet("player2", "assets/player2.png", {
            frameWidth: 96/3,
            frameHeight: 194/4
        });

        this.load.image("bullet0", "assets/bullet0.png");

        this.load.image("bullet1", "assets/bullet1.png");

        this.load.image("bullet2", "assets/bullet2.png");

        this.load.image("bullet3", "assets/bullet3.png");
        
        this.load.image("bulletz", "assets/bulletz.png");

        this.load.image("bulletb", "assets/bulletb.png");

        this.load.image("bulletblue", "assets/bulletblue.png");

        this.load.image("fireball", "assets/fireball.png");

        this.load.spritesheet("z1", "assets/z1.png", {
            frameWidth: 31.5,
            frameHeight: 32
        });

        this.load.spritesheet("z2", "assets/z2.png", {
            frameWidth: 32.6,
            frameHeight: 32
        });

        this.load.spritesheet("z3", "assets/z3.png", {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet("mage", "assets/mage.png", {
            frameWidth: 96/3,
            frameHeight: 192/4
        });

        this.load.image("regenLife", "assets/regenLife.png");

        this.load.image("volume", "assets/volume.png");

        this.load.spritesheet("coin", "assets/coin.png", {
            frameWidth: 260,
            frameHeight: 270,
        });

        this.load.spritesheet("explosion", "assets/explosion.png", {
            frameWidth: 960/5,
            frameHeight: 768/4,
        });

        this.load.spritesheet("playerMelee", "assets/playerMelee.png", {
            frameWidth: 960/5,
            frameHeight: 960/5,
        });

        this.load.image("barraprogresso", "assets/barraprogresso.png");

        this.load.image("progresso", "assets/progresso.png");

        this.load.image("bg", "assets/background.png");

        this.load.audio("fire", "assets/fireball.mp3");
        this.load.audio("theme", "assets/overworld.mp3");
        this.load.audio("gameover", "assets/gameover.mp3");
        
        this.load.audio("text1", "assets/text1.mp3");
        this.load.audio("text2", "assets/text2.mp3");
        this.load.audio("text3", "assets/text3.mp3");

    }
    
    create() {
        console.log("BootGame scene")

        var cursors = {
            up: this.input.keyboard.addKey('W'),
            down: this.input.keyboard.addKey('S'),
            left: this.input.keyboard.addKey('A'),
            right: this.input.keyboard.addKey('D'),
            fight: this.input.keyboard.addKey('SPACE'),
            shop: this.input.keyboard.addKey('Q')
        }

        var socket = io();
        socket.on('id',(data)=>{
            var id = data
            console.log("ID:", id)
            var data = {socket: socket, id: id, volume: 1, cursors: cursors, nextLevel: 1}
            this.scene.stop()
            this.scene.start("Play", data);
        });
    }
}