/**
 * @author       Flynn Mattson
 * @copyright    2019 Flynn Mattson
 * @description  Pause Scene
 */

export class PauseScene extends Phaser.Scene {
  private titleText: Phaser.GameObjects.Text[];
  private pauseBg: Phaser.GameObjects.Graphics;
  private escapeKey: Phaser.Input.Keyboard.Key;
  private keyWait: number;

  constructor() {
    super({
      key: "PauseScene"
    });
  }

  init(): void {
    this.titleText = [];
    this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.keyWait = 200;
  }

  create(): void {
    this.pauseBg = this.add.graphics();
    this.pauseBg.fillStyle(0xa84647, 1);
    this.pauseBg.fillRect(
      this.cameras.main.width / 4,
      this.cameras.main.height / 4,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2
    );


    this.titleText.push(
      this.add.text(
        this.cameras.main.width / 2 - 90,
        this.cameras.main.height / 4 + 20,
        'Game Paused',
        {
          fontFamily: "Connection",
          fontSize: "25px",
          fill: "#000"
        }
      )
    );
    this.titleText.push(
      this.add.text(
        this.cameras.main.width / 2 - 88,
        this.cameras.main.height / 4 + 20,
        'Game Paused',
        {
          fontFamily: "Connection",
          fontSize: "25px",
          fill: "#fff"
        }
      )
    );
  }

  update(): void {
    if (this.keyWait > 0) this.keyWait -= 10;

    if (this.escapeKey.isDown && !this.keyWait) {
      this.scene.resume("GameScene");
      this.scene.stop("PauseScene");
    }
  }
}
