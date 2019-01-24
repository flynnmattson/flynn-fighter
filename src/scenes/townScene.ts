/**
 * @author       Flynn Mattson
 * @copyright    2019 Flynn Mattson
 * @description  Town Scene
 */

import { Player } from "../objects/player";
import { Background } from "../objects/background";
import { ActionText } from "../objects/actionText";
import { AttackBox } from "../objects/attackBox";

export class TownScene extends Phaser.Scene {
  // objects
  private player: Player;
  private parallaxBg: Background;
  private actionText: ActionText;

  // variables
  private jumpKey: Phaser.Input.Keyboard.Key;
  private leftKey: Phaser.Input.Keyboard.Key;
  private rightKey: Phaser.Input.Keyboard.Key;
  private downKey: Phaser.Input.Keyboard.Key;
  private escapeKey: Phaser.Input.Keyboard.Key;
  private goKey: Phaser.Input.Keyboard.Key;
  private keyWait: number;

  // environment
  private map: Phaser.Tilemaps.Tilemap;
  private tileset: Phaser.Tilemaps.Tileset;
  private groundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private townObjects: Phaser.GameObjects.Image[];

  constructor() {
    super({
      key: "TownScene"
    });
  }

  init(): void {
    // objects
    this.player = null;
    this.parallaxBg = null;
    this.actionText = null;
    this.townObjects = [];

    // input
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.goKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  create(): void {
    this.registry.set("currentScene", "TownScene");
    this.keyWait = 200;
    this.parallaxBg = new Background({
      scene: this,
      area: "town"
    });
    this.map = this.make.tilemap({ key: "townMap" });
    this.tileset = this.map.addTilesetImage("town tileset", "townTiles");
    this.groundLayer = this.map.createStaticLayer("Ground", this.tileset, 0, 150);
    this.groundLayer.setScale(3);
    this.groundLayer.setCollisionByProperty({ collides: true });
    this.townObjects.push(this.add.image(this.sys.canvas.width * 1.5 + this.sys.canvas.width / 4, this.sys.canvas.height / 2 + 30, "townHouse3"));
    this.townObjects.push(this.add.image(this.sys.canvas.width * 1.5 - this.sys.canvas.width / 3, this.sys.canvas.height / 2 - 30, "townHouse2"));
    this.townObjects.push(this.add.image(this.sys.canvas.width - this.sys.canvas.width / 3.5, this.sys.canvas.height / 2 + 30, "townHouse3"));
    this.townObjects.push(this.add.image(this.sys.canvas.width / 5, this.sys.canvas.height / 2 + 30, "townHouse1"));
    this.townObjects.push(this.add.image(350, this.sys.canvas.height - 195, "townLamp"));
    this.townObjects.push(this.add.image(this.sys.canvas.width + 380, this.sys.canvas.height - 195, "townLamp"));
    this.townObjects.push(this.add.image(this.sys.canvas.width * 2.3, this.sys.canvas.height - 150, "townWagon"));
    this.physics.world.enable(this.townObjects[this.townObjects.length - 1]);
    this.townObjects[this.townObjects.length - 1].body.allowGravity = false;
    this.townObjects[this.townObjects.length - 1].body.setSize(93, 75);
    this.townObjects.forEach((obj) => {
      obj.setScale(2);
    });

    this.actionText = new ActionText({
      scene: this,
      x: this.townObjects[this.townObjects.length - 1].x - 180,
      y: this.townObjects[this.townObjects.length - 1].y - 150,
      type: "pixelFont",
      text: "E: TRAVEL TO FOREST",
      size: 30,
      bounce: true
    });

    this.player = new Player({
      scene: this,
      x: this.sys.canvas.width / 5,
      y: this.sys.canvas.height - 200,
      key: "Player",
      wield: false,
      attackBox: new AttackBox({
        scene: this
      })
    });

    this.cameras.main.setBounds(0, 0, this.sys.canvas.width * 2.5, this.sys.canvas.height);
    this.cameras.main.startFollow(this.player, true, 1, 1, -65, 0);
    this.cameras.main.fadeIn();

    this.physics.add.collider(this.player, this.groundLayer);

    // this.debug();
  }

  update(): void {
    this.handleInput();
    this.parallaxBg.shift(this.player.getVelocityX(), this.player.getPositionX());
    this.player.update();
    this.actionText.update();

    this.physics.overlap(
      this.player,
      this.townObjects[this.townObjects.length - 1],
      (player: Player, wagon: Phaser.GameObjects.Image) => {
        this.actionText.showText(100);
        // Listen for Action to go to Jungle here
        if (this.goKey.isDown) {
          this.cameras.main.fadeOut(500);
          this.goKey.isDown = false;
          setTimeout(() => {
            this.scene.start("GameScene");
          }, 500);
        }
      },
      null,
      this
    );
  }

  public getPlayer(): Player {
    return this.player;
  }

  private debug(): void {
    const debugGraphics = this.add.graphics().setAlpha(0.75);
    this.groundLayer.renderDebug(debugGraphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });

    this.player.setPosition(this.sys.canvas.width * 2, this.sys.canvas.height - 200);
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
}
