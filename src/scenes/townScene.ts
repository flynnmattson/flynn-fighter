/**
 * @author       Flynn Mattson
 * @copyright    2019 Flynn Mattson
 * @description  Town Scene
 */

import { Player } from "../objects/player";
import { Background } from "../objects/background";
import { ActionText } from "../objects/actionText";
import { AttackBox } from "../objects/attackBox";
import { InputHandler } from "../objects/inputHandler";

export class TownScene extends Phaser.Scene {
  // objects
  private player: Player;
  private parallaxBg: Background;
  private actionTexts: ActionText[];
  private inputHandler: InputHandler;

  // town environment
  private townMap: Phaser.Tilemaps.Tilemap;
  private townTileset: Phaser.Tilemaps.Tileset;
  private townGroundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private townObjects: Phaser.GameObjects.Image[];
  private townDoor: Phaser.GameObjects.Rectangle;

  // house environment
  private houseMap: Phaser.Tilemaps.Tilemap;
  private houseTileset1: Phaser.Tilemaps.Tileset;
  private houseTileset2: Phaser.Tilemaps.Tileset;
  private houseGroundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private houseFgLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private houseBgLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private houseDoor: Phaser.GameObjects.Rectangle;

  constructor() {
    super({
      key: "TownScene"
    });
  }

  init(): void {
    // objects
    this.player = null;
    this.parallaxBg = null;
    this.actionTexts = [];
    this.townObjects = [];
  }

  create(): void {
    this.registry.set("currentScene", "TownScene");
    this.parallaxBg = new Background({
      scene: this,
      area: "town"
    });
    this.townMap = this.make.tilemap({ key: "townMap" });
    this.townTileset = this.townMap.addTilesetImage("town tileset", "townTiles");
    this.townGroundLayer = this.townMap.createStaticLayer("Ground", this.townTileset, 0, 150);
    this.townGroundLayer.setScale(3);
    this.townGroundLayer.setCollisionByProperty({ collides: true });
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
    this.townDoor = new Phaser.GameObjects.Rectangle(this, this.sys.canvas.width + 95, this.sys.canvas.height - 150, 90, 150);
    this.physics.world.enable(this.townDoor);
    this.townDoor.body.allowGravity = false;
    this.townDoor.body.setSize(90, 150);

    this.houseMap = this.make.tilemap({ key: "houseMap" });
    this.houseTileset1 = this.houseMap.addTilesetImage("house_tileset_1", "houseTiles1");
    this.houseTileset2 = this.houseMap.addTilesetImage("house_tileset_2", "houseTiles2");
    this.houseGroundLayer = this.houseMap.createStaticLayer("Ground", this.houseTileset2, 0, 1000);
    this.houseGroundLayer.setScale(3);
    this.houseGroundLayer.setCollisionByProperty({ collides: true });
    this.houseBgLayer = this.houseMap.createStaticLayer("Background", this.houseTileset2, 0, 1000);
    this.houseBgLayer.setScale(3);
    this.houseFgLayer = this.houseMap.createStaticLayer("Foreground", this.houseTileset1, 0, 1000);
    this.houseFgLayer.setScale(3);
    this.houseFgLayer.setCollisionByProperty({ collides: true });
    this.houseDoor = new Phaser.GameObjects.Rectangle(this, this.sys.canvas.width + 95, 1000 - 150, 90, 150);
    this.physics.world.enable(this.houseDoor);
    this.houseDoor.body.allowGravity = false;
    this.houseDoor.body.setSize(90, 150);

    this.actionTexts = [
      new ActionText({
        scene: this,
        x: this.townObjects[this.townObjects.length - 1].x - 180,
        y: this.townObjects[this.townObjects.length - 1].y - 150,
        type: "pixelFont",
        text: "E: TRAVEL TO FOREST",
        size: 30,
        bounce: 25
      }),
      new ActionText({
        scene: this,
        x: this.townDoor.x - 125,
        y: this.townDoor.y - 150,
        type: "pixelFont",
        text: "E: VISIT MASTER",
        size: 30,
        bounce: 25
      }),
      new ActionText({
        scene: this,
        x: this.houseDoor.x - 180,
        y: this.houseDoor.y - 150,
        type: "pixelFont",
        text: "E: BACK TO TOWN",
        size: 30,
        bounce: 25
      })
    ];

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

    this.inputHandler = new InputHandler({
      scene: this,
      interactKey: true
    });

    this.cameras.main.setBounds(0, 0, this.sys.canvas.width * 2.5, this.sys.canvas.height);
    this.cameras.main.startFollow(this.player, true, 1, 1, -65, 0);
    this.cameras.main.fadeIn();

    this.physics.add.collider(this.player, this.townGroundLayer);
    this.physics.add.collider(this.player, this.houseGroundLayer);

    // this.debug();
  }

  update(): void {
    this.handleInput();
    this.parallaxBg.shiftX(this.player.getVelocityX(), this.player.getPositionX());
    this.player.update();
    this.actionTexts.forEach((text) => {
      text.update();
    });

    this.physics.overlap(
      this.player,
      this.townObjects[this.townObjects.length - 1],
      (player: Player, wagon: Phaser.GameObjects.Image) => {
        this.actionTexts[0].showText(100);
        // Listen for Action to go to Jungle here
        if (this.inputHandler.isPressedInteractKey()) {
          this.inputHandler.reset();
          this.cameras.main.fadeOut(500);
          setTimeout(() => {
            this.scene.start("GameScene");
          }, 500);
        }
      },
      null,
      this
    );

    this.physics.overlap(
      this.player,
      this.townDoor,
      (player: Player, door: Phaser.GameObjects.Rectangle) => {
        this.actionTexts[1].showText(100);
        // Listen for Action to go to Jungle here
        if (this.inputHandler.isPressedInteractKey()) {
          this.inputHandler.reset();
          this.cameras.main.fadeOut(500);
          setTimeout(() => {
            this.toHouse();
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
    this.townGroundLayer.renderDebug(debugGraphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });

    const debugGraphics2 = this.add.graphics().setAlpha(0.75);
    this.houseGroundLayer.renderDebug(debugGraphics2, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });

    this.player.setPosition(this.sys.canvas.width * 2.2, this.sys.canvas.height - 200);
  }

  private toHouse(): void {
    this.cameras.main.setBounds(0, 920, this.sys.canvas.width * 2.5, this.sys.canvas.height);
    this.player.setPosition(this.sys.canvas.width / 5, 1305);
    this.cameras.main.fadeIn(500);
  }

  private toTown(): void {
    
  }

  private handleInput(): void {
    if (this.inputHandler.isPressedEscapeKey()) {
      this.inputHandler.reset();
      this.scene.launch("PauseScene");
      this.scene.pause("HUDScene");
      this.scene.pause(this.scene.key);
    }

    if (this.inputHandler.isPressedJumpKey()) {
      if (this.inputHandler.isPressedDownKey()) {
        this.player.slide(this.inputHandler.isPressedLeftKey() || this.inputHandler.isPressedRightKey());
      } else {
        this.player.jump();
      }
    }

    if (this.inputHandler.isPressedLeftKey()) {
      this.player.runLeft();
    } else if (this.inputHandler.isPressedRightKey()) {
      this.player.runRight();
    } else {
      this.player.stopRun();
    }
  }
}
