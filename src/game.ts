/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @license      Digitsensitive
 */

/// <reference path="./phaser.d.ts"/>

import "phaser";
import { BootScene } from "./scenes/bootScene";
import { MainMenuScene } from "./scenes/mainMenuScene";
import { GameScene } from "./scenes/gameScene";
import { HUDScene } from "./scenes/hudScene";
import { PauseScene } from "./scenes/pauseScene";
import { TownScene } from "./scenes/townScene";

// main game configuration
const config: GameConfig = {
  title: "Frynn Fighter",
  version: "1.0",
  width: 800,
  height: 600,
  type: Phaser.AUTO,
  parent: "game",
  scene: [
    BootScene,
    MainMenuScene,
    GameScene,
    TownScene,
    HUDScene,
    PauseScene
  ],
  input: {
    keyboard: true,
    mouse: true,
    touch: false,
    gamepad: false
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  backgroundColor: "#a84647",
  pixelArt: true,
  antialias: false
};

// game class
export class Game extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }
}

// when the page is loaded, create our game instance
window.onload = () => {
  var game = new Game(config);
};
