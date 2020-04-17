import bootGame from './scene/BootGame.js';
import playGame from './scene/Level1.js';
import play from './scene/Play.js';
import waitingOpponent from './scene/WaitingOpponent.js';
import menu from './scene/Menu.js';
import soundAdjustment from './scene/SoundAdjustment.js';
import controlsConfiguration from './scene/ControlsConfiguration.js';
import shop from './scene/Shop.js';
import finish from './scene/Finish.js';

var game;
window.onload = function () {
    var gameConfig = {
        width: 640,
        height: 640,
        backgroundColor: 0x000000,
        scene: [bootGame, playGame, finish, play, waitingOpponent, menu, shop, soundAdjustment, controlsConfiguration],
        physics: {
            default: "arcade",
            arcade: {
                debug: false
            }
        }
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
    resizeGame();
    window.addEventListener("resize", resizeGame);
}

function resizeGame() {
    var canvas = document.querySelector("canvas");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;
    if (windowRatio < gameRatio) {
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else {
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}
