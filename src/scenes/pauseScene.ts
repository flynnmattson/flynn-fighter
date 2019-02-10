/**
 * @author       Flynn Mattson
 * @copyright    2019 Flynn Mattson
 * @description  Pause Scene
 */

export class PauseScene extends Phaser.Scene {
  private bitmapTexts: Phaser.GameObjects.BitmapText[];
  private pauseBg: Phaser.GameObjects.Graphics;
  private escapeKey: Phaser.Input.Keyboard.Key;
  private quitKey: Phaser.Input.Keyboard.Key;
  private keyWait: number;

  constructor() {
    super({
      key: "PauseScene"
    });
  }

  init(): void {
    this.bitmapTexts = [];
    this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.quitKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
  }

  create(): void {    
    this.keyWait = 200;
    this.pauseBg = this.add.graphics();
    this.pauseBg.fillStyle(0xa84647, 1);
    this.pauseBg.fillRect(
      this.cameras.main.width / 4,
      this.cameras.main.height / 4,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2
    );


    this.bitmapTexts.push(
      this.add.bitmapText(
        this.cameras.main.width / 2 - 100,
        this.cameras.main.height / 4 + 20,
        "pixelFont",
        "GAME PAUSED",
        30
      )
    );
    this.bitmapTexts.push(
      this.add.bitmapText(
        this.cameras.main.width / 2 - 60,
        this.cameras.main.height / 2 - 30,
        "pixelFont",
        "Q: QUIT",
        30
      )
    );
    this.bitmapTexts.push(
      this.add.bitmapText(
        this.cameras.main.width / 2 - 96,
        this.cameras.main.height / 2,
        "pixelFont",
        "ESC: RESUME",
        30
      )
    );
  }

  update(): void {
    if (this.keyWait > 0) this.keyWait -= 10;

    if (this.escapeKey.isDown && !this.keyWait) {
      this.scene.resume(this.registry.get("currentScene"));
      this.scene.resume("HUDScene");
      this.scene.stop("PauseScene");
    } else if (this.quitKey.isDown && !this.keyWait) {
      this.quitKey.isDown = false; // NOTE: have to do this due to a bug I think??
      this.cameras.main.fadeOut(500);
      setTimeout(() => {
        this.scene.resume(this.registry.get("currentScene"));
        this.scene.resume("HUDScene");
        this.scene.start("MainMenuScene");
      }, 500);
    }
  }
}
