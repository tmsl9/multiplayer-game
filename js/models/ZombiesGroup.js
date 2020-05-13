import Zombie from "./Zombie.js";

export default class ZombiesGroup extends Phaser.Physics.Arcade.Group {
    constructor(world, scene) {
        super(world, scene);
        
        const maxSize = 10;

        for (let i = 0; i < maxSize; i++) {
            let zombie = new Zombie(scene, -100, -100, 1, i - 10).setActive(false)
            this.add(zombie);
        }
    }
}