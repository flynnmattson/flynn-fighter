import { ActionText } from "../objects/actionText";

/**
 * @author       Flynn Mattson
 * @copyright    2019 Flynn Mattson
 * @description  HUD Scene
 */

export class HUDScene extends Phaser.Scene {
  private scoreText: Phaser.GameObjects.BitmapText;
  private comboBarBg: Phaser.GameObjects.Graphics;
  private comboBar: Phaser.GameObjects.Graphics;
  private comboMultiplierText: ActionText;
  private comboTime: {max: number, current: number};
  private comboMultiplier: number;
  private activeComboScore: number;
  private comboScoreText: ActionText;

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
    this.initHealthBar();
    this.initComboMultiplier();
    this.initScore();

    // create events
    const gameScene = this.scene.get("GameScene");
    gameScene.events.removeAllListeners("addScore");
    gameScene.events.removeAllListeners("healthChanged");
    gameScene.events.on("addScore", this.updateComboMultiplier, this);
    gameScene.events.on("healthChanged", this.updateHealthBar, this);
  }

  update(): void {
    if (this.comboMultiplierText.isShowingText()) {
      this.comboMultiplierText.update();
    }
    if (this.comboScoreText.isShowingText()) {
      this.comboScoreText.update();
    }

    if (this.comboTime.current > this.time.now) {
      this.updateComboBar();
    } else if (this.comboBar.visible) {
      this.comboBarBg.setVisible(false);
      this.comboBar.setVisible(false);
      this.comboMultiplier = 1;

      if (this.activeComboScore) {
        this.updateScore();
      }
    }
  }

  private initScore(): void {
    this.scoreText = this.add.bitmapText(
      30,
      55,
      "pixelFont",
      `SCORE: ${this.registry.get("points")}`,
      25
    );
    this.scoreText.setScrollFactor(0);

    this.comboScoreText = new ActionText({
      scene: this,
      x: 115,
      y: 80,
      type: "pixelFont",
      text: "",
      size: 25,
      bounce: 15,
      follow: true,
      fadeDuration: 400
    });
  }

  private initHealthBar(): void {
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
  }

  private initComboMultiplier(): void {
    this.comboTime = {
      max: 3000,
      current: 0
    };
    this.comboMultiplier = 1;
    this.activeComboScore = 0;

    this.comboBarBg = this.add.graphics();
    this.comboBarBg.fillStyle(0xfff6d3, 1);
    this.comboBarBg.fillRect(
      this.cameras.main.width - this.cameras.main.width / 4 - 30,
      28,
      this.cameras.main.width / 4 + 4,
      20
    );
    this.comboBar = this.add.graphics();

    this.comboMultiplierText = new ActionText({
      scene: this,
      x: this.cameras.main.width - this.cameras.main.width / 3 - 18,
      y: 20,
      type: "pixelFont",
      text: "",
      size: 30,
      bounce: 15,
      follow: true,
      fadeDuration: 500
    });
  }

  private updateComboBar(): void {
    let timeDifference: number = this.comboTime.current > this.time.now ?
      this.comboTime.current - this.time.now :
      0;

    this.comboBar.clear();
    this.comboBar.fillStyle(0xe07306, 1);
    this.comboBar.fillRect(
      this.cameras.main.width - this.cameras.main.width / 4 - 28,
      30,
      (this.cameras.main.width / 4) * timeDifference / this.comboTime.max,
      16
    );
  }

  private updateHealthBar(): void {
    this.healthBar.clear();
    this.healthBar.fillStyle(0x5dae47, 1);
    this.healthBar.fillRect(
      32,
      30,
      (this.cameras.main.width / 4) * this.registry.get("health") / this.registry.get("maxHealth"),
      16
    );
  }

  private updateScore(): void {
    this.registry.set("points", this.registry.get("points") + this.activeComboScore);
    this.scoreText.text = `SCORE: ${this.registry.get("points")}`;
    this.comboScoreText.setText(`+${this.activeComboScore}`);
    this.comboScoreText.showText(1000);
    this.activeComboScore = 0;
  }

  private updateComboMultiplier(points): void {
    this.comboTime.current = this.time.now + this.comboTime.max;
    if (!this.comboBar.visible) {
      this.comboBarBg.setVisible(true);
      this.comboBar.setVisible(true);
    }

    this.activeComboScore += points * this.comboMultiplier;

    this.comboMultiplier++;
    this.comboMultiplierText.setText(`x${this.comboMultiplier}`);
    this.comboMultiplierText.showText(this.comboTime.max / 2);
  }
}
