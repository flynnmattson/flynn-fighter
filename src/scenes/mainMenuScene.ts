import { ActionText } from "../objects/actionText";

/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @description  Flappy Bird: Main Menu Scene
 * @license      Digitsensitive
 */

export class MainMenuScene extends Phaser.Scene {
  private startKey: Phaser.Input.Keyboard.Key;
  private bitmapTexts: Phaser.GameObjects.BitmapText[] = [];
  private menuTexts: ActionText[] = [];

  constructor() {
    super({
      key: "MainMenuScene"
    });
  }

  init(): void {
    this.startKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.S
    );
    this.startKey.isDown = false;
    this.initRegistry();
  }

  create(): void {
    if (this.scene.isVisible("HUDScene")) {
      this.scene.stop("HUDScene");
    }
    if (this.scene.isVisible("GameScene")) {
      this.scene.stop("GameScene");
    }
    if (this.scene.isVisible("PauseScene")) {
      this.scene.stop("PauseScene");
    }
    if (this.scene.isVisible("TownScene")) {
      this.scene.stop("TownScene");
    }

    this.bitmapTexts.push(
      this.add.bitmapText(
        this.sys.canvas.width / 2 - 135,
        this.sys.canvas.height / 2 - 80,
        "pixelFont",
        "FLYNN FIGHTER",
        40
      )
    );

    this.menuTexts.push(
      new ActionText({
        scene: this,
        x: this.sys.canvas.width / 2 - 40,
        y: this.sys.canvas.height / 2 - 10,
        type: "pixelFont",
        text: "PLAY",
        size: 30,
        key: "s_key"
      })
    );

    this.cameras.main.fadeIn();
  }

  update(): void {
    if (this.startKey.isDown) {
      this.startKey.isDown = false;
      this.cameras.main.fadeOut(500);
      setTimeout(() => {
        this.scene.start("TownScene");
        this.scene.start("HUDScene");
        // this.scene.start("GameScene");
        this.scene.bringToTop("HUDScene");
      }, 500);
    }
  }

  /**
   * Build-in global game data manager to exchange data between scenes.
   * Here we initialize our variables with a key.
   */
  private initRegistry(): void {
    this.registry.set("points", 0);
    this.registry.set("health", 100);
    this.registry.set("maxHealth", 100);
    this.registry.set("currentScene", "MainMenuScene");
    this.registry.set("secondaryAttack", "magicAttack");
    // this.registry.set("secondaryAttack", "bowAttack");
  }
}
