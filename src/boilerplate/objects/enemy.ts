import { Player } from "./player";

/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @description  Flappy Bird: Bird
 * @license      Digitsensitive
 */

export class Enemy extends Phaser.GameObjects.Sprite {
  private isDead: boolean = false;
  private isHurting: boolean = false;
  private isAttacking: boolean = false;
  private currentScene: Phaser.Scene;
  private player: Player;
  private attackCooldown: number = 1500;
  private attackSpeed: number = 600;
  private nextAttack: number = 0;
  private attackFinished: number = 0;

  constructor(params) {
    super(params.scene, params.x, params.y, params.key, params.frame);
    this.currentScene = params.scene;
    this.player = params.scene.getPlayer();

    // image
    this.setScale(3);
    this.setOrigin(0, 0);

    // physics
    params.scene.physics.world.enable(this);
    this.body.allowGravity = true;
    this.body.setSize(32, 25);

    params.scene.add.existing(this);
  }

  update(): void {
    this.move();
  }

  public getDead(): boolean {
    return this.isDead;
  }

  public setDead(dead): void {
    this.isDead = dead;
  }


  public damage(info): void {
    if (this.overlap(info)) {
      this.isAttacking = false;
      this.isHurting = true;
      this.anims.play("slimeHurt", true);
      this.body.setVelocityX(info.faceLeft ? -100 : 100);
      this.body.setVelocityY(-75);
      setTimeout(() => {
        this.isHurting = false;
      }, 600);
    }
  }

  private overlap(other): boolean {
    let position = {
        rangeLeft: this.body.x,
        rangeRight: this.body.x + 96
      },
      first = other.rangeLeft <= position.rangeLeft ? other : position,
      second = other.rangeLeft <= position.rangeLeft ? position : other;

    return first.rangeRight >= second.rangeLeft;
  }

  private move(): void {
    if (!this.isHurting && !this.isAttacking && this.player.body.x - 50 < this.x && this.x > this.player.body.x + 100) {
      this.runLeft();
    } else if (!this.isHurting && !this.isAttacking && this.player.body.x + 100 > this.x && this.x < this.player.body.x - 50) {
      this.runRight();
    } else {
      if (this.isAttacking && this.currentScene.time.now >= this.attackFinished) {
        // this.player.damage();
        this.isAttacking = false;
      } else if (!this.isHurting) {
        this.attack();
      }
      this.stopRun();
    }
  }

  private attack(): void {
    if (this.currentScene.time.now >= this.nextAttack) {
      this.isAttacking = true;
      this.anims.play("slimeAttack", false);
      // if (this.flipX) this.body.setVelocityX(100);
      // else this.body.setVelocityX(-100);
      this.nextAttack = this.currentScene.time.now + this.attackCooldown;
      this.attackFinished = this.currentScene.time.now + this.attackSpeed;
    }
  }

  private runLeft(): void {
    this.flipX = false;
    this.body.setVelocityX(-150);
    this.anims.play("slimeRun", true);
  }

  private runRight(): void {
    this.flipX = true;
    this.body.setVelocity(150);
    this.anims.play("slimeRun", true);
  }

  private stopRun(): void {
    if (!this.isHurting) {
      if (this.body.velocity.x > 0) {
        this.body.setVelocityX(this.body.velocity.x - 50);
      } else if (this.body.velocity.x < 0) {
        this.body.setVelocityX(this.body.velocity.x + 50);
      }
      if (!this.isAttacking) this.anims.play("slimeIdle", true);
    }
  }
}
