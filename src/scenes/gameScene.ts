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
import { InputHandler } from "../objects/inputHandler";
import { Spawner } from "../objects/spawner";

export class GameScene extends Phaser.Scene {
  // objects
  private player: Player;
  private enemies: Phaser.GameObjects.Group;
  private parallaxBg: Background;
  private inputHandler: InputHandler;
  private spawners: Array<Spawner>;
  private countdownText: ActionText;
  private countdownTimer: Phaser.Time.TimerEvent;
  private messageText: ActionText;

  // variables
  private countdownEnds: number;
  private cutscene: { wield: number, run: number };
  private waveFinished: boolean;
  private attributes: any; // Attributes referred to in levelAttributes.json for the given level

  // tilemap
  private map: Phaser.Tilemaps.Tilemap;
  private tileset: Phaser.Tilemaps.Tileset;
  private groundLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private middleLayer: Phaser.Tilemaps.StaticTilemapLayer;
  private spawnColliderLayer: Phaser.Tilemaps.StaticTilemapLayer;

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
  }

  create(): void {
    this.registry.set("currentScene", "GameScene");
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
    this.spawnColliderLayer = this.map.createStaticLayer("SpawnColliders", this.tileset, 0, -400);
    this.spawnColliderLayer.setScale(3);
    this.spawnColliderLayer.setCollisionByProperty({ collides: true });
    // this.middleLayer.setScaleMode(ScaleModes.NEAREST);
    this.groundLayer = this.map.createStaticLayer("Ground", this.tileset, 0, -400);
    this.groundLayer.setScale(3);
    this.groundLayer.setCollisionByProperty({collides: true});

    this.player = new Player({
      scene: this,
      x: 0,
      y: 10,
      wield: false,
      attackBox: new AttackBox({
        scene: this
      })
    });

    this.inputHandler = new InputHandler({scene: this});

    this.cameras.main.setBounds(150, -375, this.sys.canvas.width * 2.70, this.sys.canvas.height * 1.15);
    this.cameras.main.startFollow(this.player, true, 1, 1, -50, 0);
    // this.cameras.main.roundPixels = true;
    this.cameras.main.fadeIn(1000);

    this.physics.add.collider(this.player, this.groundLayer);

    this.attributes = this.cache.json.get('levelAttributes')['jungle'];
    // Spawn Points
    this.spawners = [];
    let spawnObjLayer = this.map.getObjectLayer("SpawnPoints");
    spawnObjLayer.objects.forEach((obj) => {
      let active = obj.properties.filter((prop) => prop.name === "active").map((prop) => prop.value);

      if (active.length && active[0]) {
        this.spawners.push(
          new Spawner({
            scene: this,
            x: obj.x * 3,
            y: obj.y * 3 - 470,
            attributes: this.attributes.spawners.filter((attr) => attr.id === obj.id)[0]
          })
        );
      }
    });

    this.cutscene = {
      wield: 1800,
      run: 1500
    };

    this.countdownText = new ActionText({
      scene: this,
      x: this.sys.canvas.width / 2,
      y: this.sys.canvas.height / 2 - 50,
      type: "pixelFont",
      text: "",
      size: 50,
      follow: true,
      fadeDuration: 400
    });

    this.messageText = new ActionText({
      scene: this,
      x: this.sys.canvas.width / 4 - 50,
      y: this.sys.canvas.height / 2 - 50,
      type: "pixelFont",
      text: "",
      size: 50,
      follow: true,
      fadeDuration: 500
    });

    this.countdownEnds = 0;
    this.countdownTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (this.countdownEnds) {
          this.countdownText.setText(`${this.countdownEnds}...`);
          this.countdownText.setPosition(this.sys.canvas.width / 2, this.sys.canvas.height / 2 - 50);
          this.countdownText.showText(150);
          this.countdownEnds--;
        } else {
          this.messageText.setText("HERE THEY COME!");
          this.messageText.setPosition(this.sys.canvas.width / 3 - 75, this.sys.canvas.height / 2 - 50);
          this.messageText.showText(400);
          this.countdownTimer.paused = true;
          if (this.cutscene) this.cutsceneOver();
          else this.handleNextWave();
        }
      },
      callbackScope: this,
      loop: true,
      paused: true
    });

    // this.debug();
  }

  update(): void {
    if (this.countdownText.isShowingText()) {
      this.countdownText.update();
    }

    if (this.messageText.isShowingText()) {
      this.messageText.update();
    }

    if (this.player.getWield()) {
      this.handleAttack();
    }

    if (this.cutscene) {
      this.handleCutscene();
    } else {
      this.handleInput();
      
      if (!this.waveFinished) {
        let justFinished = true;
        this.spawners.forEach((spawner) => {
          justFinished = justFinished && spawner.waveFinished();
        });
  
        if (justFinished) {
          this.handleAfterWave();
        }
      }
    }

    this.parallaxBg.shiftX(this.player.getVelocityX(), this.player.getPositionX());
    this.parallaxBg.shiftY(this.cameras.main.scrollY);
    this.player.update();
  }

  public getPlayer(): Player {
    return this.player;
  }

  public getEnemies(): Phaser.GameObjects.Group {
    return this.enemies;
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

    this.player.setPosition(150, 0);
    this.player.setWield(true);
    this.cutsceneOver();
  }

  private handleAfterWave(): void {
    this.waveFinished = true;
    this.player.setWield(false);
    this.countdownEnds = 0;

    this.messageText.setText("WAVE FINISHED!");
    this.messageText.setPosition(this.sys.canvas.width / 4, this.sys.canvas.height / 2 - 100);
    this.messageText.showText(500);

    this.time.addEvent({
      delay: 2000,
      callback: () => {
        this.messageText.setText("NEXT WAVE STARTS IN");
        this.messageText.setPosition(this.sys.canvas.width / 4 - 75, this.sys.canvas.height / 2 - 100);
        this.messageText.showText(2500);
        this.countdownEnds = 15;
        this.countdownTimer.paused = false;
      },
      callbackScope: this,
      loop: false,
    });
  }

  private handleNextWave(): void {
    this.player.setWield(true);
    this.startSpawner();
  }

  private handleCutscene(): void {
    if (this.cutscene.run < 950 && this.cutscene.run > 0) {
      this.player.runRight();
    } else {
      this.player.stopRun();
    }
    if (this.cutscene.wield === 0) {
      this.player.setWield(true);
      this.countdownEnds = 5;
      this.countdownTimer.paused = false;
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
    this.physics.add.collider(this.player, this.spawnColliderLayer);
    this.startSpawner();
    // this.enemies.add(
    //   new Enemy({
    //     scene: this,
    //     x: 500,
    //     y: 30,
    //     key: "reaper",
    //     attackBox: new AttackBox({
    //       scene: this
    //     })
    //   })
    // );
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
    if (this.inputHandler.isPressedEscapeKey()) {
      this.inputHandler.reset();
      this.scene.launch("PauseScene");
      
      this.scene.pause(this.scene.key);
      this.scene.pause("HUDScene");
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

  private startSpawner(): void {
    this.waveFinished = false;
    this.spawners.forEach((spawner) => { spawner.startNextWave(); });
  }
}
