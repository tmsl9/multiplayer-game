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
        this.add.text(230, 300, 'Waiting for opponent', { fill: '#fff' })
        this.add.text(280, 330, 'Good luck!', { fill: '#fff' })
        this.socket.emit('ready')
        this.socket.on('2players_ready', ()=>{
            this.scene.stop()
            this.scene.start("NextLevel", this.data)
        })
    }


}