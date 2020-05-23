export default class finish extends Phaser.Scene {
    constructor() {
        super("Finish");
    }

    init(data) {
        console.log("Finish scene: ", data)

        this.id = data.id
        this.nextLevel = data.nextLevel
        this.socket = data.socket
        this.volume = data.volume
        this.loserID = data.loser
    }

    preload(){
        if(this.nextLevel==3){
            this.load.image("tiles", "assets/tile-map.png");
            this.load.tilemapTiledJSON("finish", "assets/MapFinish.json");
        }else{
            this.load.image("tiles", "assets/tile-map.png");
            this.load.tilemapTiledJSON("loss", "assets/MapLoss.json");
        }
    }

    create() {
        if(this.nextLevel==3){
            this.map = this.make.tilemap({ key: "finish" });
            const tileset = this.map.addTilesetImage("tile-map", "tiles");
            this.map.createStaticLayer("finish", tileset, 0, 0);
            if(this.loserID == 2){
                this.add.image(240, 560, "player1");//player 1
                this.add.image(400, 560, "player2");//player 2
            }else{
                this.add.image(400, 560, "player1");//player 1
                this.add.image(240, 560, "player2");//player 2
            }
        }else{
            this.map = this.make.tilemap({ key: "loss" });
            const tileset = this.map.addTilesetImage("tile-map", "tiles");
            this.map.createStaticLayer("loss", tileset, 0, 0);
            this.add.image(112, 560, "player1");//player 1
            this.add.image(180, 560, "player2");//player 2
        }

        let { width, height } = this.sys.game.canvas
        this.width = width;
        this.height = height;

        this.cursors = this.input.keyboard.createCursorKeys();
        this.composeHUD();
    }

    composeHUD() {
        if(this.nextLevel==3){
            if(this.id == this.loserID){
                this.add.text(250, 315, "Perdeste!", {
                    font: "40px Cambria",
                    fill: "#fff"
                });
            }else{
                this.add.text(250, 315, "Ganhaste!", {
                    font: "40px Cambria",
                    fill: "#fff"
                });
            }
            this.add.text(95, 355, "[Clique SPACE para jogar novamente]", {
                font: "30px Cambria",
                fill: "#fff"
            }); 
        }else{
            this.add.text(290, 260, "Perdi?", {
                font: "30px Cambria",
                fill: "#fff"
            });
            this.add.text(165, 300, "Deixa-me jogar novamente!", {
                font: "30px Cambria",
                fill: "#fff"
            });
            this.add.text(95, 340, "[Clique SPACE para jogar novamente]", {
                font: "30px Cambria",
                fill: "#fff"
            });
        }
    }

    update() {
        if (this.cursors.space.isDown) {

            this.scene.stop();

            this.gameOverSound.stop();

            this.scene.start('Play');
        }
    }

}