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
  private health: number = 3;
  private dyingTime: number = 400;

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
    this.body.setOffset(2, 5);
    // this.body.setSize(20, 25, false);
    this.body.setSize(26, 15, false);

    params.scene.add.existing(this);
  }

  update(): void {
    if (!this.isDead) {
      this.move();
    } else {
      this.anims.play("slimeDead", true);
      this.body.setVelocityX(0);

      if (this.dyingTime > 0) {
        this.dyingTime -= 10;
      } else {
        this.currentScene.registry.set("points", this.currentScene.registry.get("points") + 1);
        this.currentScene.events.emit("pointsChanged");
        this.destroy();
      }
    }
  }

  public getDead(): boolean {
    return this.isDead;
  }

  public damage(info): void {
    if (!this.isDead) {
      this.isAttacking = false;
      this.isHurting = true;
      this.health--;
      if (this.health > 0) {
        this.anims.play("slimeHurt", true);
        this.body.setVelocity(info.faceLeft ? -75 : 75, 75);
        setTimeout(() => {
          this.isHurting = false;
          this.clearTint();
          this.setAlpha(1);
        }, 600);
      } else {
        this.isDead = true;
      }
      this.setTint(0xfc8a75);
      this.setAlpha(0.9);
    }
  }

  private move(): void {
    this.currentScene.physics.overlap(
      this,
      this.player,
      (enemy: Enemy, player: Player) => {
        this.attack();
      },
      null,
      this
    );
    if (!this.isHurting && !this.isAttacking && this.x > this.player.getRightSide()) {
      this.runLeft();
    } else if (!this.isHurting && !this.isAttacking && this.x < this.player.getLeftSide()) {
      this.runRight();
    } else {
      if (this.isAttacking && this.currentScene.time.now >= this.attackFinished) {
        this.isAttacking = false;
      }
      this.stopRun();
    }
  }

  private attack(): void {
    if (this.isAttacking && this.currentScene.time.now >= this.attackFinished) {
      this.player.damage(this.flipX);
      this.isAttacking = false;
    } else if (!this.isHurting && this.currentScene.time.now >= this.nextAttack) {
      this.isAttacking = true;
      this.anims.play("slimeAttack", false);
      if (this.flipX) this.body.setVelocityX(50);
      else this.body.setVelocityX(-50);
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
