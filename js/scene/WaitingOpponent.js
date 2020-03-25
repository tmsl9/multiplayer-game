export default class waitingOpponent extends Phaser.Scene {
    constructor() {
        super("WaitingOpponent");
    }

    init(data){
        console.log("Wait scene: ", data)

        this.socket = data.socket
        this.id = data.id
    }
    
    create() {
        console.log("Waiting for opponent");
        console.log("id: ", this.id)
        this.socket.emit('ready')
        this.socket.on('2players_ready', ()=>{
            this.scene.stop()
            this.scene.start("PlayGame", {id: this.id, socket: this.socket})
        })
    }


}