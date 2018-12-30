/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @description  Flappy Bird: Game Scene
 * @license      Digitsensitive
 */

import { Player } from "../objects/player";
import { Enemy } from "../objects/enemy";
import { Background } from "../objects/background";

export class GameScene extends Phaser.Scene {
  // objects
  private player: Player;
  private enemies: Phaser.GameObjects.Group;
  private parallaxBg: Background;

  // variables
  private timer: Phaser.Time.TimerEvent;
  private score: number;
  private jumpKey: Phaser.Input.Keyboard.Key;
  private leftKey: Phaser.Input.Keyboard.Key;
  private rightKey: Phaser.Input.Keyboard.Key;

  // tilemap
  private map: Phaser.Tilemaps.Tilemap;
  private tileset: Phaser.Tilemaps.Tileset;
  private groundLayer: Phaser.Tilemaps.StaticTilemapLayer;

  constructor() {
    super({
      key: "GameScene"
    });
  }

  init(): void {
    // objects
    this.player = null;
    this.parallaxBg = null;
    this.enemies = this.add.group({
      classType: Enemy,
      runChildUpdate: true
    });

    // variables
    this.timer = undefined;
    this.score = 0;

    // input
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  }

  create(): void {
    this.parallaxBg = new Background({
      scene: this
    });
    this.map = this.make.tilemap({ key: "map" });
    this.tileset = this.map.addTilesetImage("jungle tileset", "tiles");
    this.groundLayer = this.map.createStaticLayer("Ground", this.tileset, 0, 150);
    this.groundLayer.setScale(3);
    this.groundLayer.setCollisionByProperty({collides: true});

    this.player = new Player({
      scene: this,
      x: this.sys.canvas.width / 2 - 75,
      y: this.sys.canvas.height - 220,
      key: "adventurer"
    });

    this.spawnEnemy();

    this.cameras.main.setBounds(0, 0, this.sys.canvas.width * 1.5, this.sys.canvas.height);
    this.cameras.main.startFollow(this.player);

    this.physics.add.collider(this.player, this.groundLayer);
    this.physics.add.collider(this.enemies, this.groundLayer);

    // const debugGraphics = this.add.graphics().setAlpha(0.75);
    // this.groundLayer.renderDebug(debugGraphics, {
    //   tileColor: null, // Color of non-colliding tiles
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    // });

    this.timer = this.time.addEvent({
      delay: 5000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    this.input.on(
      "pointerdown",
      () => {
        let attackInfo; 
        if (attackInfo = this.player.attack()) {
          // damage nearby enemies
          this.enemies.children.each((enemy) => {
            setTimeout(() => {
              enemy.damage(attackInfo);
            }, attackInfo.triggerDamage);
          }, this);
        }
      },
      this
    );
  }

  update(): void {
    this.handleInput();
    this.parallaxBg.shift(this.player.getVelocityX(), this.player.getPositionX());
    if (!this.player.getDead()) {
      this.player.update();
    } else {
      if (this.player.y > this.sys.canvas.height) {
        this.restartGame();
      }
    }
  }

  public getPlayer(): Player {
    return this.player;
  }

  private handleInput(): void {
    if (this.jumpKey.isDown) {
      this.player.jump();
    }
    if (this.leftKey.isDown) {
      this.player.runLeft();
    } else if (this.rightKey.isDown) {
      this.player.runRight();
    } else {
      this.player.stopRun();
    }
  }

  private addOneEnemy(x): void {
    let enemy = new Enemy({
      scene: this,
      x: x,
      y: this.sys.canvas.height - 205,
      key: "slime"
    });

    this.enemies.add(enemy);
  }

  private spawnEnemy(): void {
    // update the score
    this.score += 1;

    // randomly pick a number between 1 and 5
    // let x = Math.floor(Math.random() * 10) + 5;

    this.addOneEnemy(this.sys.canvas.width);
  }

  private restartGame(): void {
    this.scene.start("MainMenuScene");
  }
}
