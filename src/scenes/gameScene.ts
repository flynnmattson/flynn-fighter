/**
 * @author       Flynn Mattson
 * @copyright    2019 Flynn Mattson
 * @description  Game Scene
 */


import { Player } from "../objects/player";
import { Enemy } from "../objects/enemy";
import { Background } from "../objects/background";
import { ActionText } from "../objects/actionText";
import { AttackBox } from "../objects/attackBox";

export class GameScene extends Phaser.Scene {
  // objects
  private player: Player;
  private enemies: Phaser.GameObjects.Group;
  private countdownText: ActionText;
  private parallaxBg: Background;

  // variables
  private timer: Phaser.Time.TimerEvent;
  private jumpKey: Phaser.Input.Keyboard.Key;
  private leftKey: Phaser.Input.Keyboard.Key;
  private rightKey: Phaser.Input.Keyboard.Key;
  private downKey: Phaser.Input.Keyboard.Key;
  private escapeKey: Phaser.Input.Keyboard.Key;
  private keyWait: number;
  private cutscene: { wield: number, run: number, countdown: number };

  // tilemap
  private map: Phaser.Tilemaps.Tilemap;
  private tileset: Phaser.Tilemaps.Tileset;
  private groundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private middleLayer: Phaser.Tilemaps.StaticTilemapLayer;

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
    this.cutscene = null;

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
    this.registry.set("currentScene", "GameScene");
    this.keyWait = 200;
    this.parallaxBg = new Background({
      scene: this,
      area: "jungle",
      x: 0,
      y: 0,
      width: this.sys.canvas.width * 3,
      height: 216
    });
    this.map = this.make.tilemap({ key: "jungleMap" });
    this.tileset = this.map.addTilesetImage("jungle tileset", "jungleTiles");
    this.middleLayer = this.map.createStaticLayer("MiddleGround", this.tileset, 0, -400);
    this.middleLayer.setScale(3);
    // this.middleLayer.setScaleMode(ScaleModes.NEAREST);
    this.groundLayer = this.map.createStaticLayer("Ground", this.tileset, 0, -400);
    this.groundLayer.setScale(3);
    this.groundLayer.setCollisionByProperty({collides: true});

    // TODO: USE THIS TO CREATE SPAWNERS AND WE CAN ADD CUSTOM PROPERTIES TO EACH OF THESE SPAWN
    // POINT OBJECTS WHICH CAN INCLUDE THE NUMBER OF EACH CLASS THAT SPAWNS, INTERVAL THEY ARE SPAWNED
    // THAT SORT OF STUFF.
    console.log(this.map.getObjectLayer("SpawnPoints"));

    this.player = new Player({
      scene: this,
      x: 0,
      y: 0,
      wield: false,
      attackBox: new AttackBox({
        scene: this
      })
    });

    this.cameras.main.setBounds(150, -375, this.sys.canvas.width * 2.70, this.sys.canvas.height * 1.15);
    this.cameras.main.startFollow(this.player, true, 1, 1, -50, 0);
    // this.cameras.main.roundPixels = true;
    this.cameras.main.fadeIn(1000);

    this.physics.add.collider(this.player, this.groundLayer);

    this.cutscene = {
      countdown: 1500,
      wield: 1500,
      run: 1200
    };
    this.countdownText = new ActionText({
      scene: this,
      x: this.sys.canvas.width / 2,
      y: this.sys.canvas.height / 2 - 50,
      type: "pixelFont",
      text: "3...",
      size: 50,
      bounce: false,
      follow: true
    });

    this.debug();
  }

  update(): void {
    if (this.countdownText.isShowingText()) {
      this.countdownText.update();
    }
    if (this.cutscene) {
      this.handleCutscene();
    } else {
      this.handleAttack();
      this.handleInput();
    }
    this.parallaxBg.shiftX(this.player.getVelocityX(), this.player.getPositionX());
    this.parallaxBg.shiftY(this.cameras.main.scrollY);
    this.player.update();
  }

  public getPlayer(): Player {
    return this.player;
  }

  public getGroundLayer(): Phaser.Tilemaps.StaticTilemapLayer {
    return this.groundLayer;
  }

  private debug(): void {
    // const debugGraphics = this.add.graphics().setAlpha(0.75);
    // this.groundLayer.renderDebug(debugGraphics, {
    //   tileColor: null, // Color of non-colliding tiles
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    // });

    this.player.setPosition(250, 0);
    this.player.setWield(true);
    this.cutsceneOver();
  }

  private handleCutscene(): void {
    if (this.cutscene.run < 600 && this.cutscene.run > 0) {
      this.player.runRight();
    } else {
      this.player.stopRun();
    }
    if (this.cutscene.wield === 0) {
      this.player.setWield(true);
    }
    if (this.cutscene.countdown === 0) {
      this.countdownText.showText(500);
    } else if (this.cutscene.countdown === -1000) {
      this.countdownText.setText("2...");
      this.countdownText.showText(500);
    } else if (this.cutscene.countdown === -2000) {
      this.countdownText.setText("1...");
      this.countdownText.showText(500);
    } else if (this.cutscene.countdown === -3000) {
      this.countdownText.setText("HERE THEY COME!");
      this.countdownText.setPosition(this.sys.canvas.width / 3 - 50, this.sys.canvas.height / 2 - 50);
      this.countdownText.showText(500);
      this.cutsceneOver();
    }

    for (let key in this.cutscene) {
      this.cutscene[key] -= 10;
    }
  }

  private cutsceneOver(): void {
    this.cutscene = null;

    this.input.on(
      "pointerdown",
      () => { this.player.startAttack(); },
      this
    );

    // this.startSpawner();
  }

  private handleAttack(): void {
    let attackInfo;

    if (attackInfo = this.player.triggerAttack()) {
      this.physics.overlap(
        this.enemies,
        this.player.getAttackBox(),
        (enemy: Enemy, player: AttackBox) => {
          enemy.damage(attackInfo);
        },
        null,
        this
      );
    }
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

  private startSpawner(): void {
    this.spawnEnemy();

    this.timer = this.time.addEvent({
      delay: 10000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });
  }

  private addOneEnemy(x: number): void {
    let enemy = new Enemy({
      scene: this,
      x: x,
      y: this.sys.canvas.height - 205,
      key: "imp",
      attackBox: new AttackBox({
        scene: this
      })
    });
    let enemy2 = new Enemy({
      scene: this,
      x: x,
      y: this.sys.canvas.height - 205,
      key: "slime",
      attackBox: new AttackBox({
        scene: this
      })
    });
    let enemy3 = new Enemy({
      scene: this,
      x: x,
      y: this.sys.canvas.height - 205,
      key: "slug",
      attackBox: new AttackBox({
        scene: this
      })
    });

    this.enemies.add(enemy);
    this.enemies.add(enemy2);
    this.enemies.add(enemy3);
  }

  private spawnEnemy(): void {
    this.addOneEnemy(this.sys.canvas.width * 1.2);
  }
}
