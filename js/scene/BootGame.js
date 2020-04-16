import shop from "./Shop";

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

        this.load.image("bullet", "assets/bullet.png");

        this.load.image("bullet1", "assets/bullet1.png");

        this.load.image("bullet2", "assets/bullet2.png");

        this.load.image("bullet3", "assets/bullet3.png");
        
        this.load.image("bossBullet", "assets/bossBullet.png");

        this.load.image("regenLife", "assets/regenLife.png");

        this.load.spritesheet("z1", "assets/z1.png", {
            frameHeight: 33,
            frameWidth: 33
        });

        this.load.spritesheet("z2", "assets/z2.png", {
            frameHeight: 33,
            frameWidth: 33
        });

        this.load.spritesheet("z3", "assets/z3.png", {
            frameHeight: 33,
            frameWidth: 33
        });

        this.load.spritesheet("explosion", "assets/explosion.png", {
            frameWidth: 64,
            frameHeight: 64,
        });

        this.load.spritesheet("coin", "assets/coin.png", {
            frameWidth: 260,
            frameHeight: 270,
        });

        this.load.image("bg", "assets/background.png");

        this.load.audio("fire", "assets/fireball.mp3");
        this.load.audio("theme", "assets/overworld.mp3");
        this.load.audio("gameover", "assets/gameover.mp3");

    }
    
    create() {
        console.log("BootGame")
        this.add.image(0,0,"bg").setScale(4)
        var cursors = {
            up: this.input.keyboard.addKey('W'),
            down: this.input.keyboard.addKey('S'),
            left: this.input.keyboard.addKey('A'),
            right: this.input.keyboard.addKey('D'),
            fight: this.input.keyboard.addKey('SPACE'),
            shop: this.input.keyboard.addKey('Q')
        }

        var win = this.add.zone(0, this.game.config.height - 120, 100, 120);
console.log("po")
        //var shopWindow = new shop(win);

        this.scene.add("shop",shop., true);
        console.log("pi")
        /*var socket = io();
        socket.on('id',(data)=>{
            var id = data
            console.log("id received:", id)
            this.scene.stop()
            this.scene.start("Play", {socket: socket, id: id, volume: 1, cursors: cursors});
        });*/
    }
}