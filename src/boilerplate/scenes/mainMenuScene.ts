/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @description  Flappy Bird: Main Menu Scene
 * @license      Digitsensitive
 */

export class MainMenuScene extends Phaser.Scene {
  private startKey: Phaser.Input.Keyboard.Key;
  private bitmapTexts: Phaser.GameObjects.BitmapText[] = [];

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
    this.bitmapTexts.push(
      this.add.bitmapText(
        this.sys.canvas.width / 2 - 135,
        this.sys.canvas.height / 2 - 80,
        "pixelFont",
        "FRYNN FIGHTER",
        40
      )
    );

    this.bitmapTexts.push(
      this.add.bitmapText(
        this.sys.canvas.width / 2 - 50,
        this.sys.canvas.height / 2 - 10,
        "pixelFont",
        "S: PLAY",
        30
      )
    );
  }

  update(): void {
    if (this.startKey.isDown) {
      this.scene.start("HUDScene");
      this.scene.start("GameScene");
      this.scene.bringToTop("HUDScene");
    }
  }

  /**
   * Build-in global game data manager to exchange data between scenes.
   * Here we initialize our variables with a key.
   */
  private initRegistry(): void {
    this.registry.set("points", 0);
    this.registry.set("lives", 3);
    this.registry.set("level", 1);
  }
}
