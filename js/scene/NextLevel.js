export default class nextLevel extends Phaser.Scene {
    constructor() {
        super("NextLevel");
    }

    init(data){
        console.log("Next level: " + data.nextLevel)
        this.data = data
        this.socket = data.socket
        this.nextLevel = data.nextLevel
        this.volume = data.volume
    }

    preload(){
        this.load.image("tiles", "assets/tile-map.png");
        this.load.tilemapTiledJSON("mapText", "assets/MapText.json");
    }

    create() {
        this.map = this.make.tilemap({ key: "mapText" });
        const tileset = this.map.addTilesetImage("tile-map", "tiles");
        this.bossTalking = this.map.createStaticLayer("bossTalking", tileset, 0, 0);
        
        this.boss = this.add.image(200, 450, 'boss', 0).setScale(5)

        var textConfig = {font: "17px Cambria", fill: "#ffffff"}

        this.textSound = this.sound.add("text3", { volume: this.volume });
        //this.textSound.play();
        
        if(this.nextLevel == 1){
            this.add.text(300, 350, "\"Vocês nunca vão conseguir entrar!\nNão com a horda das minhas criações!!\nO castelo é meu!!!!\"", textConfig)            
        }else if(this.nextLevel == 2){
            this.add.text(300, 350, "\"Como foi possível??\nQuando queremos um trabalho\nbem feito temos que ser nós a fazê-lo,\nnão é mesmo?\"", textConfig)
        }else if(this.nextLevel == 3){
            this.boss.y += 100
            this.boss.setAngle(270)
            this.add.text(300, 350, "\"Posso até morrer, mas não vou ser o ÚNICO!!\nEu amaldiçoei o castelo,\ne apenas um de vós poderá sair daqui!\nAHAHGAGHAGHA!!!\"", textConfig)
        }
        let i = 0
        let changeTint = true;
        let repetition = 700//////////////ver tempo por causa da voz do mago(rui)
        this.time.addEvent({
            repeat: repetition,
            loop: false,
            callback: () => {
                if (i >= repetition) {
                    if(this.nextLevel == 3){
                        this.boss.tint = 0xFFFFFF
                    }
                    this.scene.stop();
                    this.socket.emit('nextLevel')
                    this.socket.on('readyToNextLevel', ()=>{
                        this.scene.start('Level' + this.nextLevel, this.data)
                    })
                }else if(this.nextLevel == 3){
                    if (changeTint) {
                        this.boss.tint = 0xFF0000
                    } else {
                        this.boss.tint = 0xFFFFFF
                    }
                    if (i % 40 == 0) {
                        changeTint = !changeTint;
                    }
                }
                i++
            }
        });
    }
}