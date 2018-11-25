/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @description  Flappy Bird: Game Scene
 * @license      Digitsensitive
 */

import { Player } from "../objects/player";
import { Pipe } from "../objects/pipe";

export class GameScene extends Phaser.Scene {
  // objects
  private player: Player;
  private pipes: Phaser.GameObjects.Group;
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
    this.pipes = this.add.group({ classType: Pipe });
    this.bg = null;
    this.fg = null;

    // variables
    this.timer = undefined;
    this.score = -1;
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
    // this.physics.world.enable(this.fg);

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

    // this.addRowOfPipes();

    this.player = new Player({
      scene: this,
      x: this.sys.canvas.width / 2 - 14,
      y: this.sys.canvas.height - 150,
      key: "player"
    });

    // this.timer = this.time.addEvent({
    //   delay: 1500,
    //   callback: this.addRowOfPipes,
    //   callbackScope: this,
    //   loop: true
    // });
  }

  update(): void {
    this.handleInput();
    if (!this.player.getDead()) {
      this.player.update();
      this.physics.overlap(this.player, this.pipes, this.hitPipe, null, this);
    } else {
      Phaser.Actions.Call(
        this.pipes.getChildren(),
        function(pipe) {
          pipe.body.setVelocityX(0);
        },
        this
      );

      if (this.player.y > this.sys.canvas.height) {
        this.restartGame();
      }
    }
  }

  private handleInput(): void {
    if (this.jumpKey.isDown) {
      this.player.flap();
    }
    if (this.leftKey.isDown) {
      this.player.flipX = true;
      this.bg.tilePositionX -= 0.1;
      this.fg.tilePositionX -= 1;
    } else if (this.rightKey.isDown) {
      this.player.flipX = false;
      this.bg.tilePositionX += 0.1;
      this.fg.tilePositionX += 1;
    }
  }

  private addOnePipe(x, y, frame, hole): void {
    // create a pipe at the position x and y
    let pipe = new Pipe({
      scene: this,
      x: x,
      y: y,
      frame: frame,
      key: "pipe"
    });

    // add pipe to group
    this.pipes.add(pipe);
  }

  private addRowOfPipes(): void {
    // update the score
    this.score += 1;
    this.scoreText[0].setText("" + this.score);
    this.scoreText[1].setText("" + this.score);

    // randomly pick a number between 1 and 5
    let hole = Math.floor(Math.random() * 5) + 1;

    // add 6 pipes with one big hole at position hole and hole + 1
    for (let i = 0; i < 10; i++) {
      if (i != hole && i != hole + 1 && i != hole + 2) {
        if (i == hole - 1) {
          this.addOnePipe(800, i * 60, 0, hole);
        } else if (i == hole + 3) {
          this.addOnePipe(800, i * 60, 1, hole);
        } else {
          this.addOnePipe(800, i * 60, 2, hole);
        }
      }
    }
  }

  private hitPipe() {
    this.player.setDead(true);
  }

  private restartGame(): void {
    this.scene.start("MainMenuScene");
  }
}
