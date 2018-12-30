/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @description  Space Invaders: HUD Scene
 * @license      Digitsensitive
 */

export class HUDScene extends Phaser.Scene {
  private scoreText: Phaser.GameObjects.Text[];

  constructor() {
    super({
      key: "HUDScene"
    });
  }

  init(): void {
    this.scoreText = [];
  }

  create(): void {
    this.scoreText.push(
      this.add.text(
        this.sys.canvas.width / 2 - 24,
        30,
        `Kills: ${this.registry.get("points")}`,
        {
          fontFamily: "Connection",
          fontSize: "30px",
          fill: "#000"
        }
      )
    );
    this.scoreText.push(
      this.add.text(
        this.sys.canvas.width / 2 - 26,
        30, 
        `Kills: ${this.registry.get("points")}`, 
        {
          fontFamily: "Connection",
          fontSize: "30px",
          fill: "#fff"
        }
      )
    );

    this.scoreText[0].setScrollFactor(0);
    this.scoreText[1].setScrollFactor(0);

    // create events
    const level = this.scene.get("GameScene");
    level.events.on("pointsChanged", this.updatePoints, this);
    level.events.on("livesChanged", this.updateLives, this);
  }

  private updatePoints() {
    this.scoreText[0].setText(`Kills: ${this.registry.get("points")}`);
    this.scoreText[1].setText(`Kills: ${this.registry.get("points")}`);
  }

  private updateLives() {
    // this.bitmapTexts[0].setText(`Lives: ${this.registry.get("lives")}`);
  }
}
