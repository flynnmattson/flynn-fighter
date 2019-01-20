import { Player } from "./player";
import { AttackBox } from "./attackBox";

/**
 * @author       Flynn Mattson
 * @copyright    2019 Flynn Mattson
 * @description  Enemy Object
 */

export class Enemy extends Phaser.GameObjects.Sprite {
  private isDead: boolean = false;
  private isHurting: boolean = false;
  private isAttacking: boolean = false;
  private currentScene: Phaser.Scene;
  private player: Player;
  private attackCooldowns: Array<number>; // Object of Attack Cooldowns to know which one is available
  private attackNum: number; // Index number of Current Attack (in attributes.json)
  private attackFinished: number = 0;
  private health: number;
  private dyingTime: number = 400;
  private attributes: any;
  private attackHitbox: AttackBox;

  constructor(params) {
    super(params.scene, params.x, params.y, params.key);
    this.currentScene = params.scene;
    this.attackHitbox = params.attackBox;
    this.attackHitbox.disable();
    this.player = params.scene.getPlayer();

    // Loads in the attributes from the Games cache. This what we'll
    // use to define all of this enemies attributes.
    this.attributes = params.scene.cache.json.get('attributes')[params.key];
    this.health = this.attributes.health;
    this.attackCooldowns = [];
    this.attributes.attack.forEach((a) => {
      this.attackCooldowns.push(0);
    });

    // image
    this.setScale(3);
    this.setOrigin(0, 0);
    this.setDepth(this.attributes.depth);

    // physics
    params.scene.physics.world.enable(this);
    this.body.allowGravity = true;
    this.body.setOffset(this.attributes.body.offset.x, this.attributes.body.offset.y);
    this.body.setSize(this.attributes.body.size.x, this.attributes.body.size.y, false);
    
    params.scene.add.existing(this);
  }

  update(): void {
    if (!this.isDead) {
      this.move();
    } else {
      this.anims.play(`${this.texture.key}Dead`, true);
      this.body.setVelocityX(0);

      if (this.dyingTime > 0) {
        this.dyingTime -= 10;
      } else {
        this.currentScene.registry.set("points", this.currentScene.registry.get("points") + 1);
        this.currentScene.events.emit("pointsChanged");
        this.attackHitbox.destroy();
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
      this.attackHitbox.disable();
      this.isHurting = true;
      this.health--;
      this.setTintFill(0xffffff);
      setTimeout(() => {
        this.clearTint();
      }, 100);
      if (this.health > 0) {
        this.anims.play(`${this.texture.key}Hurt`, true);
        this.body.setVelocity(info.faceLeft ? -75 : 75, 75);
        setTimeout(() => {
          this.isHurting = false;
        }, 600);
      } else {
        this.isDead = true;
      }
    }
  }

  private move(): void {
    /*
      If you are not currently attacking, Check to see if there is an
      attack in range that is not on cooldown. Might have to iterate through
      and check the range starting from furthest range attack and if 
      it overlaps with player hitbox then trigger attack call for that
      specific attack. Within attack call, put another overlap check on 
      timeout for when you want to trigger the damage on the player.
    */
    this.currentScene.physics.overlap(
      this,
      this.player,
      (enemy: Enemy, player: Player) => {
        this.attack();
      },
      null,
      this
    );
    if (!this.isHurting && !this.isAttacking && this.body.x > this.player.getRightSide()) {
      this.runLeft();
    } else if (!this.isHurting && !this.isAttacking && this.body.x + this.body.width < this.player.getLeftSide()) {
      this.runRight();
    } else {
      if (this.isAttacking && this.currentScene.time.now >= this.attackFinished) {
        this.isAttacking = false;
        this.attackHitbox.disable();
      }
      this.stopRun();
    }

    if (this.attackHitbox.isEnabled()) {
      this.repositionAttackBox();
    }
  }

  private attack(): void {
    if (this.isAttacking && this.currentScene.time.now >= this.attackFinished) {
      this.player.damage(this.attributes.attack[this.attackNum].damage);
      this.isAttacking = false;
      this.attackHitbox.disable();
    } else if (!this.isAttacking && !this.isHurting && this.readyAttack()) {
      this.isAttacking = true;
      this.attackHitbox.enable();
      this.attackHitbox.setBodySize(
        this.attributes.attack[this.attackNum].range,
        this.attributes.body.size.y
      );
      this.anims.play(`${this.texture.key}Attack${this.attackNum + 1}`, false);
      this.body.setVelocityX(
        this.flipX ? 
        this.attributes.attack[this.attackNum].velocity :
        this.attributes.attack[this.attackNum].velocity * -1
      );
      this.attackCooldowns[this.attackNum] = this.currentScene.time.now + this.attributes.attack[this.attackNum].cooldown;
      this.attackFinished = this.currentScene.time.now + this.attributes.attack[this.attackNum].speed;
    }
  }

  private repositionAttackBox(): void {
    if (this.flipX) {
      this.attackHitbox.setPosition(
        (this.body.x + this.body.width) - this.attackHitbox.getBodyWidth() / 2,
        this.body.y
      );
    } else {
      this.attackHitbox.setPosition(
        this.body.x - this.attackHitbox.getBodyWidth() / 2,
        this.body.y
      );
    }
  }

  private readyAttack(): boolean {
    for (let i = 0; i < this.attackCooldowns.length; i++) {
      if (this.attackCooldowns[i] <= this.currentScene.time.now) {
        this.attackNum = i;
        return true;
      }
    }
    return false;
  }

  private runLeft(): void {
    this.flipX = false;
    if (this.body.offset.x < 0) {
      this.body.setOffset(this.attributes.body.offset.x, this.attributes.body.offset.y);
    }
    this.body.setVelocityX(this.attributes.speed * -1);
    this.anims.play(`${this.texture.key}Run`, true);
  }

  private runRight(): void {
    this.flipX = true;
    if (this.body.offset.x > 0) {
      this.body.setOffset(this.attributes.body.offset.flipX, this.attributes.body.offset.y);
    }
    this.body.setVelocityX(this.attributes.speed);
    this.anims.play(`${this.texture.key}Run`, true);
  }

  private stopRun(): void {
    if (!this.isHurting) {
      if (this.body.velocity.x > 0) {
        this.body.setVelocityX(this.body.velocity.x - 50);
      } else if (this.body.velocity.x < 0) {
        this.body.setVelocityX(this.body.velocity.x + 50);
      }
      if (!this.isAttacking) this.anims.play(`${this.texture.key}Idle`, true);
    }
  }
}
