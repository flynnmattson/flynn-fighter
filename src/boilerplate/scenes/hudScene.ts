/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @description  Space Invaders: HUD Scene
 * @license      Digitsensitive
 */

export class HUDScene extends Phaser.Scene {
  private scoreText: Phaser.GameObjects.Text[];
  private healthBarBg: Phaser.GameObjects.Graphics;
  private healthBar: Phaser.GameObjects.Graphics;

  constructor() {
    super({
      key: "HUDScene"
    });
  }

  init(): void {
    this.scoreText = [];
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
      (this.cameras.main.width / 4) * this.registry.get("health") / 10,
      16
    );

    this.scoreText.push(
      this.add.text(
        30,
        55,
        `Kills: ${this.registry.get("points")}`,
        {
          fontFamily: "Connection",
          fontSize: "25px",
          fill: "#000"
        }
      )
    );
    this.scoreText.push(
      this.add.text(
        32,
        55, 
        `Kills: ${this.registry.get("points")}`, 
        {
          fontFamily: "Connection",
          fontSize: "25px",
          fill: "#fff"
        }
      )
    );

    this.scoreText[0].setScrollFactor(0);
    this.scoreText[1].setScrollFactor(0);

    // create events
    const level = this.scene.get("GameScene");
    level.events.on("pointsChanged", this.updatePoints, this);
    level.events.on("healthChanged", this.updateHealth, this);
  }

  private updatePoints() {
    this.scoreText[0].setText(`Kills: ${this.registry.get("points")}`);
    this.scoreText[1].setText(`Kills: ${this.registry.get("points")}`);
  }

  private updateHealth() {
    this.healthBar.clear();
    this.healthBar.fillStyle(0x5dae47, 1);
    this.healthBar.fillRect(
      32,
      30,
      (this.cameras.main.width / 4) * this.registry.get("health") / 10,
      16
    );
  }
}
