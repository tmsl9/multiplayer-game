export default class waitingOpponent extends Phaser.Scene {
    constructor() {
        super("WaitingOpponent");
    }

    init(data){
        console.log("WaitOpponent scene")
        this.data = data
        this.socket = data.socket
        this.id = data.id
        data.nextLevel = 1
    }
    
    create() {
        this.add.image(0, 0, "bg").setDisplayOrigin(0, 0).setDisplaySize(640, 640);
        this.add.text(210, 255, 'Waiting for opponent', { fill: '#000' })
        this.add.text(260, 285, 'Good luck!', { fill: '#000' })
        this.socket.emit('ready')
        this.socket.on('2players_ready', ()=>{
            this.scene.stop()
            this.scene.start("NextLevel", this.data)
        })
    }


}