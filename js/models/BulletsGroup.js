import Bullet from "./Bullet.js";

export default class BulletsGroup extends Phaser.Physics.Arcade.Group {
    constructor(world, scene) {
        super(world, scene);
        
        this.maxSize = 5;

        for (let i = 0; i < this.maxSize; i++) {
            let bullet = new Bullet(scene, -100, -100, i).setActive(false)
            this.add(bullet);
        }
    }
}