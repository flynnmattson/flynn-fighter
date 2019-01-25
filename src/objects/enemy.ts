import { Player } from "./player";
import { AttackBox } from "./attackBox";
import { GameScene } from "../scenes/gameScene";
import { Projectile } from "./projectile";

/**
 * @author       Flynn Mattson
 * @copyright    2019 Flynn Mattson
 * @description  Enemy Object
 */

export class Enemy extends Phaser.GameObjects.Sprite {
  private isDead: boolean = false;
  private isHurting: boolean = false;
  private isAttacking: boolean = false;
  private currentScene: GameScene;
  private player: Player;
  private attackCooldowns: Array<number>; // Array of Attack Cooldowns to know which one is available
  private attackNum: number = 0; // Index number of Current Attack (in attributes.json)
  private attackFinished: number = 0; // Attack animation/follow through is finished at this time.
  private attackTrigger: number = 0; // When to trigger the current attack's damage to Player
  private lastDamageId: number = 0; // The Player Damage ID used to only receive damage from a single attack once.
  private dyingTime: number = 0;
  private health: number;
  private attributes: any;
  private attackHitbox: AttackBox;
  private projectiles: Phaser.GameObjects.Group;

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
    this.attributes.attack.forEach((attack) => {
      if (attack.type === 'ranged' && !this.projectiles) {
        this.projectiles = this.currentScene.add.group({
          classType: Projectile,
          active: true,
          runChildUpdate: false
        });
      }
      this.attackCooldowns.push(0);
    });

    // image
    this.setScale(3);
    this.setOrigin(0, 0);
    this.setDepth(this.attributes.depth);

    // physics
    params.scene.physics.world.enable(this);

    if (this.attributes.type === 'ground') {
      this.currentScene.physics.add.collider(this, this.currentScene.getGroundLayer());
      this.body.allowGravity = true;
    } else if (this.attributes.type === 'fly') {
      this.body.allowGravity = false;
    }

    this.body.setOffset(this.attributes.body.offset.x, this.attributes.body.offset.y);
    this.body.setSize(this.attributes.body.size.x, this.attributes.body.size.y, false);
    
    params.scene.add.existing(this);
  }

  update(): void {
    if (!this.isDead) {
      this.move();
    } else {
      this.body.setVelocityX(0);

      if (this.dyingTime <= this.currentScene.time.now && this.body.velocity.y === 0) {
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

  public getBodyRight(): number {
    return this.body.x + this.body.width;
  }

  public getBodyLeft(): number {
    return this.body.x;
  }

  public getBodyHeightCenter(): number {
    return this.body.y - (this.body.height / 2);
  }

  public damage(info): void {
    if (!this.isDead && this.lastDamageId !== info.damageId) {
      this.cancelAttack();
      this.lastDamageId = info.damageId;
      this.isHurting = true;
      this.health--;
      this.setTintFill(0xffffff);
      setTimeout(() => {
        this.clearTint();
      }, 100);
      if (this.health > 0) {
        this.anims.play(`${this.texture.key}Hurt`, true);
        this.body.setVelocity(info.faceLeft ? -75 : 75, 0);
        setTimeout(() => {
          this.isHurting = false;
        }, 600);
      } else {
        if (this.attributes.type === 'fly') {
          this.currentScene.physics.add.collider(this, this.currentScene.getGroundLayer());
          this.body.allowGravity = true;
        }
        this.isDead = true;
        this.dyingTime = this.currentScene.time.now + this.attributes.dying;
        this.anims.play(`${this.texture.key}Dead`, false);
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
      if (this.attributes.attack[this.attackNum].type === 'ranged') {
        // Shoot Projectile Here
        this.projectiles.add(new Projectile({
          scene: this.currentScene,
          x: this.flipX ? this.getBodyRight() : this.getBodyLeft(),
          y: this.getBodyHeightCenter() + this.body.height,
          info: this.attributes.attack[this.attackNum].projectile,
          damage: this.attributes.attack[this.attackNum].damage,
          key: `${this.texture.key}Projectile${this.attackNum + 1}`,
          flip: this.flipX
        }));
      } else {
        this.currentScene.physics.overlap(
          this.attackHitbox,
          this.player,
          (enemy: AttackBox, player: Player) => {
            this.player.damage(this.attributes.attack[this.attackNum].damage);
          },
          null,
          this
        );
      }
      this.attackCooldowns[this.attackNum] = this.currentScene.time.now + this.attributes.attack[this.attackNum].cooldown;
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

    if (this.attributes.type === 'fly') {
      if (!this.isHurting && !this.isAttacking && this.getBodyHeightCenter() + 5 < this.player.getBodyHeightCenter()) {
        this.flyDown();
      } else if (!this.isHurting && !this.isAttacking && this.getBodyHeightCenter() - 5 > this.player.getBodyHeightCenter()) {
        this.flyUp();
      } else {
        this.stopFly();
      }
    }

    if (this.attackHitbox.isEnabled()) {
      this.repositionAttackBox();
    }
  }

  private checkRange(): void {
    this.attackHitbox.enable();
    // Starts from the top of the attacks array in attributes.json.
    // NOTE: Assumes Range of attacks are ascending in the array which means Furthest away at the end.
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

  private flyDown(): void {
    this.body.setVelocityY(this.attributes.speed);
    this.anims.play(`${this.texture.key}Run`, true);
  }

  private flyUp(): void {
    this.body.setVelocityY(this.attributes.speed * -1);
    this.anims.play(`${this.texture.key}Run`, true);
  }

  private stopFly(): void {
    if (this.body.velocity.y > 0) {
      this.body.setVelocityY(this.body.velocity.y - 50);
    } else if (this.body.velocity.y < 0) {
      this.body.setVelocityY(this.body.velocity.y + 50);
    }
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
