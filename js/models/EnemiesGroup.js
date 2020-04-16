import Enemy from "./Enemy.js";

export default class EnemiesGroup extends Phaser.Physics.Arcade.Group {
    constructor(world, scene) {
        super(world, scene);
        
        const maxSize = 5;

        for (let i = 0; i < maxSize; i++) {
            let enemy = new Enemy(scene, -100, -100, 1, i).setActive(false)
            this.add(enemy);
        }
    }
}