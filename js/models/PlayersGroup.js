import Player from "./Player.js";

export default class PlayersGroup extends Phaser.Physics.Arcade.Group {
    constructor(world, scene, myId) {
        super(world, scene);
        
        this.me = myId == 1 ? new Player(scene, 200, 400, 1) : new Player(scene, 440, 400, 2);
        this.other = myId == 1 ? new Player(scene, 440, 400, 2) : new Player(scene, 200, 400, 1);
        this.me.setActive(true)
        this.other.setActive(true)
        this.add(this.me)
        this.add(this.other)
    }
}