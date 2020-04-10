export default class waitingOpponent extends Phaser.Scene {
    constructor() {
        super("WaitingOpponent");
    }

    init(data){
        console.log("Wait scene: ", data)
        this.data = data
        this.socket = data.socket
        this.id = data.id
    }
    
    create() {
        this.add.text(230, 300, 'Waiting for opponent', { fill: '#fff' })
        this.add.text(280, 330, 'Good luck!', { fill: '#fff' })
        console.log("Waiting for opponent");
        console.log("id: ", this.id)
        this.socket.emit('ready')
        this.socket.on('2players_ready', ()=>{
            this.scene.stop()
            this.scene.start("PlayGame", this.data)
        })
    }


}