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
  private jumpKey: Phaser.Input.Keyboard.Key;
  private leftKey: Phaser.Input.Keyboard.Key;
  private rightKey: Phaser.Input.Keyboard.Key;
  private downKey: Phaser.Input.Keyboard.Key;
  private escapeKey: Phaser.Input.Keyboard.Key;
  private keyWait: number;

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

    // input
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  create(): void {
    this.keyWait = 200;
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
      y: this.sys.canvas.height - 170,
      key: "adventurer"
    });

    this.cameras.main.setBounds(0, 0, this.sys.canvas.width * 1.5, this.sys.canvas.height);
    this.cameras.main.startFollow(this.player, false, 1, 1, -50, 0);

    this.physics.add.collider(this.player, this.groundLayer);
    this.physics.add.collider(this.enemies, this.groundLayer);

    // const debugGraphics = this.add.graphics().setAlpha(0.75);
    // this.groundLayer.renderDebug(debugGraphics, {
    //   tileColor: null, // Color of non-colliding tiles
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    // });

    this.spawnEnemy();

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
          // damage overlapping enemies
          setTimeout(() => {
            this.physics.overlap(
              this.enemies,
              this.player,
              (enemy: Enemy, player: Player) => {
                enemy.damage(attackInfo);
              },
              null,
              this
            );
          }, attackInfo.triggerDamage);
        }
      },
      this
    );
  }

  update(): void {
    this.handleInput();
    this.parallaxBg.shift(this.player.getVelocityX(), this.player.getPositionX());
    this.player.update();
  }

  public getPlayer(): Player {
    return this.player;
  }

  private handleInput(): void {
    if (this.keyWait > 0) this.keyWait -= 10;

    if (this.escapeKey.isDown && !this.keyWait) {
      this.keyWait = 200;
      this.escapeKey.isDown = false; // NOTE: have to do this due to a bug I think??
      this.scene.launch("PauseScene");
      this.scene.pause(this.scene.key);
    }

    if (this.jumpKey.isDown) {
      if (this.downKey.isDown) {
        this.player.slide();
      } else {
        this.player.jump();
      }
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
    this.addOneEnemy(this.sys.canvas.width);
  }
}
