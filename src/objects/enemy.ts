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
  private attackCooldowns: Array<number>; // Array of Attack Cooldowns to know which one is available
  private attackNum: number = 0; // Index number of Current Attack (in attributes.json)
  private attackFinished: number = 0; // Attack animation/follow through is finished at this time.
  private attackTrigger: number = 0; // When to trigger the current attack's damage to Player
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

  public getBodyCenter(): number {
    return this.body.x + (this.body.width / 2);
  }

  public damage(info): void {
    if (!this.isDead) {
      this.cancelAttack();
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
    if (this.isAttacking && this.attackTrigger != 0 && this.currentScene.time.now >= this.attackTrigger) {
      this.currentScene.physics.overlap(
        this.attackHitbox,
        this.player,
        (enemy: AttackBox, player: Player) => {
          // this.player.damage(this.attributes.attack[this.attackNum].damage);
        },
        null,
        this
      );
      this.attackTrigger = 0;
    } else if (this.isAttacking && this.currentScene.time.now >= this.attackFinished) {
      this.cancelAttack();
    } else if (!this.isAttacking && !this.isHurting) {
      this.checkRange();
    }

    if (!this.isHurting && !this.isAttacking && this.body.x > this.player.getBodyRightSide()) {
      this.runLeft();
    } else if (!this.isHurting && !this.isAttacking && this.body.x + this.body.width < this.player.getBodyLeftSide()) {
      this.runRight();
    } else {
      if (!this.isHurting && !this.isAttacking) {
        if (this.getBodyCenter() + this.attributes.body.offset.flipX < this.player.getBodyCenter()) this.flip(true);
        else if (this.getBodyCenter() - this.attributes.body.offset.flipX > this.player.getBodyCenter()) this.flip(false);
      }
      this.stopRun();
    }

    if (this.attackHitbox.isEnabled()) {
      this.repositionAttackBox();
    }
  }

  private checkRange(): void {
    this.attackHitbox.enable();
    for (let i = this.attackCooldowns.length - 1; i >= 0; i--) {
      if (this.isAttacking) return; // Stops the loop from continuing
      else if (this.attackCooldowns[i] <= this.currentScene.time.now) {
        this.attackNum = i;
        this.attackHitbox.setBodySize(
          this.attributes.attack[this.attackNum].range,
          this.attributes.body.size.y
        );
        this.repositionAttackBox();
        this.currentScene.physics.overlap(
          this.attackHitbox,
          this.player,
          (enemy: AttackBox, player: Player) => {
            this.attack();
          },
          null,
          this
        );
      }
    }
  }

  private attack(): void {
    this.isAttacking = true;
    this.anims.play(`${this.texture.key}Attack${this.attackNum + 1}`, false);
    this.body.setVelocityX(
      this.flipX ?
      this.attributes.attack[this.attackNum].velocity :
      this.attributes.attack[this.attackNum].velocity * -1
    );
    this.attackTrigger = this.currentScene.time.now + this.attributes.attack[this.attackNum].trigger;
    this.attackCooldowns[this.attackNum] = this.currentScene.time.now + this.attributes.attack[this.attackNum].cooldown;
    this.attackFinished = this.currentScene.time.now + this.attributes.attack[this.attackNum].speed;
  }

  private cancelAttack(): void {
    this.isAttacking = false;
    this.attackTrigger = 0;
    this.attackHitbox.disable();
  }

  private flip(state: boolean): void {
    this.flipX = state;
    if (state) {
      this.body.setOffset(this.attributes.body.offset.flipX, this.attributes.body.offset.y);
    } else {
      this.body.setOffset(this.attributes.body.offset.x, this.attributes.body.offset.y);
    }
  }

  private repositionAttackBox(): void {
    if (this.flipX) {
      this.attackHitbox.setPosition(
        (this.body.x + this.body.width) - (this.attackHitbox.getBodyWidth() / 2)
          + this.attributes.attack[this.attackNum].offset,
        this.body.y
      );
    } else {
      this.attackHitbox.setPosition(
        this.body.x - (this.attackHitbox.getBodyWidth() / 2)
          - this.attributes.attack[this.attackNum].offset,
        this.body.y
      );
    }
  }

  private runLeft(): void {
    if (this.flipX) this.flip(false);
    this.body.setVelocityX(this.attributes.speed * -1);
    this.anims.play(`${this.texture.key}Run`, true);
  }

  private runRight(): void {
    if (!this.flipX) this.flip(true);
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
