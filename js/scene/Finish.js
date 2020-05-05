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
        this.nextLevel = data.nextLevel
        this.socket = data.socket
        this.volume = data.volume
        this.loserID = data.loser

    }

    preload(){
        console.log("PILAAAAAAAAA");

        if(this.nextLevel==3){
            this.load.image("tiles", "assets/tile-map.png");
            this.load.tilemapTiledJSON("finish", "assets/MapFinish.json");
        }else{
            
            console.log("PILAAAAAAAAA");
            this.load.image("tiles", "assets/tile-map.png");
            
            console.log("PILAAAAAAAAA");
            this.load.tilemapTiledJSON("loss", "assets/MapLoss.json");
            
            console.log("PILAAAAAAAAA");
        }
    }

    create() {

        if(this.nextLevel==3){
            this.map = this.make.tilemap({ key: "map" });
            const tileset = this.map.addTilesetImage("tile-map", "tiles");
            this.map.createStaticLayer("finish", tileset, 0, 0);
            if(this.loserID == 2){
                this.add.image(440, 400, "player1");//player 1
                this.add.image(200, 400, "player2");//player 2
            }else{
                this.add.image(200, 400, "player1");//player 1
                this.add.image(440, 400, "player2");//player 2
            }
        }else{
            
            console.log("PILAAAAAAAAA");
            this.map = this.make.tilemap({ key: "loss" });
            
            console.log("PILAAAAAAAAA");
            const tileset = this.map.addTilesetImage("tile-map", "tiles");
            
            console.log("PILAAAAAAAAA");
            this.map.createStaticLayer("loss", tileset, 0, 0);
            
            console.log("PILAAAAAAAAA");
            this.add.image(50, 500, "player1");//player 1
            this.add.image(100, 500, "player2");//player 2
        }

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