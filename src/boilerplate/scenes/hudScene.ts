/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @description  Space Invaders: HUD Scene
 * @license      Digitsensitive
 */

export class HUDScene extends Phaser.Scene {
  private scoreText: Phaser.GameObjects.Text[];
  private healthText: Phaser.GameObjects.Text[];

  constructor() {
    super({
      key: "HUDScene"
    });
  }

  init(): void {
    this.scoreText = [];
    this.healthText = [];
  }

  create(): void {
    this.healthText.push(
      this.add.text(
        30,
        30,
        `Health: ${this.registry.get("health")}`,
        {
          fontFamily: "Connection",
          fontSize: "25px",
          fill: "#000"
        }
      )
    );
    this.healthText.push(
      this.add.text(
        32,
        30,
        `Health: ${this.registry.get("health")}`,
        {
          fontFamily: "Connection",
          fontSize: "25px",
          fill: "#fff"
        }
      )
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
    this.healthText[0].setScrollFactor(0);
    this.healthText[1].setScrollFactor(0);

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
    this.healthText[0].setText(`Health: ${this.registry.get("health")}`);
    this.healthText[1].setText(`Health: ${this.registry.get("health")}`);
  }
}
