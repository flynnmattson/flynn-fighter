/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @description  Flappy Bird: Game Scene
 * @license      Digitsensitive
 */

import { Player } from "../objects/player";
import { Enemy } from "../objects/enemy";

export class GameScene extends Phaser.Scene {
  // objects
  private player: Player;
  private enemies: Phaser.GameObjects.Group;
  private bg: Phaser.GameObjects.TileSprite;
  private fg: Phaser.GameObjects.TileSprite;

  // variables
  private timer: Phaser.Time.TimerEvent;
  private score: number;
  private scoreText: Phaser.GameObjects.Text[];
  private jumpKey: Phaser.Input.Keyboard.Key;
  private leftKey: Phaser.Input.Keyboard.Key;
  private rightKey: Phaser.Input.Keyboard.Key;

  constructor() {
    super({
      key: "GameScene"
    });
  }

  init(): void {
    // objects
    this.player = null;
    this.enemies = this.add.group({
      classType: Enemy,
      runChildUpdate: true
    });
    this.bg = null;
    this.fg = null;

    // variables
    this.timer = undefined;
    this.score = 0;
    this.scoreText = [];

    // input
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  }

  create(): void {
    this.bg = this.add.tileSprite(0, 0, 300, 200, "background");
    this.bg.setScale(6);

    this.fg = this.add.tileSprite(0, this.sys.canvas.height, this.sys.canvas.width, 110, "foreground");
    this.fg.setScale(2);

    this.scoreText.push(
      this.add.text(this.sys.canvas.width / 2 - 14, 30, "0", {
        fontFamily: "Connection",
        fontSize: "40px",
        fill: "#000"
      })
    );
    this.scoreText.push(
      this.add.text(this.sys.canvas.width / 2 - 16, 30, "0", {
        fontFamily: "Connection",
        fontSize: "40px",
        fill: "#fff"
      })
    );

    this.spawnEnemy();

    this.player = new Player({
      scene: this,
      x: this.sys.canvas.width / 2 - 75,
      y: this.sys.canvas.height - 220,
      key: "adventurer"
    });

    // this.timer = this.time.addEvent({
    //   delay: 5000,
    //   callback: this.spawnEnemy,
    //   callbackScope: this,
    //   loop: true
    // });

    this.input.on(
      "pointerdown",
      function() {
        this.player.attack();
      },
      this
    );
  }

  update(): void {
    this.handleInput();
    if (!this.player.getDead()) {
      this.player.update();
    } else {
      if (this.player.y > this.sys.canvas.height) {
        this.restartGame();
      }
    }
  }

  private handleInput(): void {
    if (this.jumpKey.isDown) {
      this.player.jump();
    }
    if (this.leftKey.isDown) {
      this.player.runLeft();
      this.enemies.getChildren().forEach((enemy: Enemy) => {
        enemy.moveRight();
      });
      this.bg.tilePositionX -= 0.05;
      this.fg.tilePositionX -= 2;
    } else if (this.rightKey.isDown) {
      this.player.runRight();
      this.enemies.getChildren().forEach((enemy: Enemy) => {
        enemy.moveLeft();
      });
      this.bg.tilePositionX += 0.05;
      this.fg.tilePositionX += 2;
    } else {
      this.player.stopRun();
    }
  }

  private addOneEnemy(x): void {
    let enemy = new Enemy({
      scene: this,
      x: x,
      y: this.sys.canvas.height - 205,
      key: "enemy"
    });

    this.enemies.add(enemy);
  }

  private spawnEnemy(): void {
    // update the score
    this.score += 1;
    this.scoreText[0].setText("" + this.score);
    this.scoreText[1].setText("" + this.score);

    // randomly pick a number between 1 and 5
    // let x = Math.floor(Math.random() * 10) + 5;

    this.addOneEnemy(this.sys.canvas.width);

    // // add 6 pipes with one big hole at position hole and hole + 1
    // for (let i = 0; i < 10; i++) {
    //   if (i != hole && i != hole + 1 && i != hole + 2) {
    //     if (i == hole - 1) {
    //       this.addOnePipe(800, i * 60, 0, hole);
    //     } else if (i == hole + 3) {
    //       this.addOnePipe(800, i * 60, 1, hole);
    //     } else {
    //       this.addOnePipe(800, i * 60, 2, hole);
    //     }
    //   }
    // }
  }

  private hitPipe() {
    this.player.setDead(true);
  }

  private restartGame(): void {
    this.scene.start("MainMenuScene");
  }
}
