/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @description  Flappy Bird: Bird
 * @license      Digitsensitive
 */

export class Player extends Phaser.GameObjects.Sprite {
  private anim: Phaser.Tweens.Tween[];
  private isDead: boolean = false;

  public getDead(): boolean {
    return this.isDead;
  }

  public setDead(dead): void {
    this.isDead = dead;
  }

  constructor(params) {
    super(params.scene, params.x, params.y, params.key, params.frame);

    // image
    this.setScale(3);
    this.setOrigin(0, 0);

    // physics
    params.scene.physics.world.enable(this);
    this.body.setGravityY(-300);
    this.body.setSize(17, 12);

    // animations & tweens
    this.anim = [];
    this.anim.push(
      params.scene.tweens.add({
        targets: this,
        duration: 100,
        angle: -20
      })
    );

    params.scene.add.existing(this);
  }

  update(): void {
    this.handleAngleChange();
    this.handleGravity();
    this.isOffTheScreen();
  }

  private handleGravity(): void {
    if (this.body.y >= this.scene.sys.canvas.height - 150) {
      this.body.setGravityY(-300);
      if (this.body.velocity.y > 0) {
        this.body.setVelocityY(0);
      }
    } else {
      this.body.setGravityY(300);
    }
  }

  private handleAngleChange(): void {
    if (this.angle < 20) {
      this.angle += 1;
    }
  }

  public flap(): void {
    if (this.body.y >= this.scene.sys.canvas.height - 150 &&
        this.body.velocity.y === 0) {
      this.body.setVelocityY(-350);
      this.anim[0].restart();
    }
  }

  private isOffTheScreen(): void {
    if (this.y + this.height > this.scene.sys.canvas.height) {
      this.isDead = true;
    }
  }
}
