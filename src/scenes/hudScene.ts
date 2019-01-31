/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @description  Space Invaders: HUD Scene
 * @license      Digitsensitive
 */

export class HUDScene extends Phaser.Scene {
  private scoreText: Phaser.GameObjects.BitmapText;
  private healthBarBg: Phaser.GameObjects.Graphics;
  private healthBar: Phaser.GameObjects.Graphics;

  constructor() {
    super({
      key: "HUDScene"
    });
  }

  init(): void {

  }

  create(): void {
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0xfff6d3, 1);
    this.healthBarBg.fillRect(
      30,
      28,
      this.cameras.main.width / 4 + 4,
      20
    );
    this.healthBar = this.add.graphics();
    this.healthBar.fillStyle(0x5dae47, 1);
    this.healthBar.fillRect(
      32,
      30,
      (this.cameras.main.width / 4) * this.registry.get("health") / this.registry.get("maxHealth"),
      16
    );

    this.scoreText = this.add.bitmapText(
      30,
      55,
      "pixelFont",
      `SCORE: ${this.registry.get("points")}`,
      25
    );

    this.scoreText.setScrollFactor(0);

    // create events
    const gameScene = this.scene.get("GameScene");
    gameScene.events.on("pointsChanged", this.updatePoints, this);
    gameScene.events.on("healthChanged", this.updateHealth, this);
  }

  private updatePoints() {
    this.scoreText.text = `SCORE: ${this.registry.get("points")}`;
  }

  private updateHealth() {
    this.healthBar.clear();
    this.healthBar.fillStyle(0x5dae47, 1);
    this.healthBar.fillRect(
      32,
      30,
      (this.cameras.main.width / 4) * this.registry.get("health") / this.registry.get("maxHealth"),
      16
    );
  }
}
