import { AttackBox } from "./attackBox";
import { Projectile } from "./projectile";

/**
 * @author       Flynn Mattson
 * @copyright    2019 Flynn Mattson
 * @description  Player Object
 */

export class Player extends Phaser.GameObjects.Sprite {
  private isDead: boolean = false;
  private inAir: boolean = false;
  private isAttacking: boolean = false;
  private isRunning: boolean = false;
  private isHurting: boolean = false;
  private isSliding: boolean = false;
  private isWielding: boolean = false;
  private currentScene: Phaser.Scene;
  private attackCooldown: number = 355;
  private attackTrigger: number = 0;
  private attackStart: number = 0;
  private nextAttack: number = 0;
  private nextSlide: number = 0;
  private attackCombo: number = 1;
  private airAttackCombo: number = 1;
  private dyingTime: number = 400;
  private health: number;
  private attributes: any;
  private attackHitbox: AttackBox;
  private projectiles: Phaser.GameObjects.Group;

  constructor(params) {
    super(params.scene, params.x, params.y, params.key);
    this.currentScene = params.scene;
    this.attackHitbox = params.attackBox;
    this.isWielding = params.wield || false;
    if (!this.isWielding) {
      this.attackHitbox.disable();
    }
    this.health = params.scene.registry.get("health");
    this.attributes = params.scene.cache.json.get('attributes')['player'];

    this.projectiles = this.currentScene.add.group({
      classType: Projectile,
      active: true,
      runChildUpdate: false
    });

    // image
    this.setScale(3);
    this.setOrigin(0, 0);
    this.setDepth(this.attributes.depth);

    // physics
    params.scene.physics.world.enable(this);
    this.body.allowGravity = true;
    this.body.setOffset(
      this.attributes.body.offset.x,
      params.scene.scene.key === "TownScene" ? this.attributes.body.offset.y * 2 : this.attributes.body.offset.y
    );
    this.body.setSize(this.attributes.body.size.x, this.attributes.body.size.y, false);
    this.attackHitbox.setBodySize(this.attributes.body.size.x, this.attributes.body.size.y);

    params.scene.add.existing(this);
  }

  update(): void {
    if (this.attackHitbox.isEnabled()) {
      if (this.flipX) {
        this.attackHitbox.setPosition(
          this.getBodyLeftSide() - this.attackHitbox.getBodyWidth() / 2,
          this.body.y
        );
      } else {
        this.attackHitbox.setPosition(
          this.getBodyLeftSide() + this.attackHitbox.getBodyWidth() / 2,
          this.body.y
        );
      }
    }

    if (this.inAir && this.body.onFloor()) {
      this.inAir = false;
      this.airAttackCombo = 1;
    } else if (this.body.velocity.y > 0) {
      if (
        !this.anims.isPlaying ||
        ["adventurerRun", "adventurerRunSword", "adventurerSlide"].indexOf(this.anims.getCurrentKey()) !== -1
      ) {
        this.anims.play("adventurerFall", false);
      }
      this.inAir = true;
      this.isRunning = false;
    }

    if (this.isAttacking && this.currentScene.time.now > this.nextAttack) {
      this.isAttacking = false;
      this.attackHitbox.disable();
    }

    if (this.isSliding && this.currentScene.time.now > this.nextSlide - this.attackCooldown) {
      this.isSliding = false;
    }

    if (this.isDead) {
      this.anims.play("adventurerDie", true);
      this.body.setVelocityX(0);

      if (this.dyingTime > 0) {
        this.dyingTime -= 10;
      } else {
        this.currentScene.scene.start("MainMenuScene");
      }
    }

    // this.isOffTheScreen();
  }

  public getDead(): boolean {
    return this.isDead;
  }

  public getWield(): boolean {
    return this.isWielding;
  }

  public getVelocityX(): number {
    return this.body.velocity.x;
  }

  public getPositionX(): number {
    return this.body.x;
  }

  public getBodyCenter(): number {
    return this.body.x + (this.body.width / 2);
  }

  public getBodyRightSide(): number {
    return this.body.x + this.body.width;
  }

  public getBodyLeftSide(): number {
    return this.body.x;
  }

  public getBodyHeightCenter(): number {
    return this.body.y - (this.body.height / 2);
  }

  public getAttackBox(): AttackBox {
    return this.attackHitbox;
  }

  public setWield(wield: boolean): void {
    if (wield && !this.isWielding) {
      this.anims.play("adventurerWield", false);
      this.isWielding = true;
    } else if (!wield && this.isWielding) {
      this.anims.play("adventurerUnwield", false);
      this.isWielding = false;
    }
  }

  public updateOffset(): void {
    if (this.currentScene.scene.key === "TownScene") {
      // Offset for town vs house
      this.body.setOffset(
        this.attributes.body.offset.x,
        this.y > 1000 ? 10 : this.attributes.body.offset.y * 2
      );
    } else if (this.currentScene.scene.key === "GameScene") {
      this.body.setOffset(this.attributes.body.offset.x, this.attributes.body.offset.y);
    }
  }

  public jump(): void {
    if (!this.isSliding && !this.inAir && !this.isAttacking) {
      this.inAir = true;
      this.body.setVelocityY(-400);
      this.anims.play("adventurerJump", false);
    }
  }

  public slide(isMoving: boolean): void {
    if (this.currentScene.time.now > this.nextSlide && !this.isAttacking && !this.inAir) {
      this.isSliding = true;
      this.body.setVelocityX(this.flipX ? isMoving ? -550 : -1000 : isMoving ? 550 : 1000);
      this.anims.play("adventurerSlide", true);
      this.nextSlide = this.currentScene.time.now + this.attackCooldown * 2;
    }
  }

  public startAttack(secondaryAttack: boolean): void {
    if (this.isWielding && !this.isRunning && !this.isSliding && this.currentScene.time.now > this.nextAttack) {
      this.isAttacking = true;
      if (secondaryAttack) {
        if (this.inAir) {
          this.anims.play("adventurerBowAttack2", false);
          this.body.setVelocityX(0);
          setTimeout(() => this.shootArrow(), 300);
        } else {
          this.anims.play("adventurerBowAttack1", false);
          setTimeout(() => {
            this.body.setVelocityX(this.flipX ? 300 : -300);
            this.shootArrow();
          }, 650);
        }
      } else {
        this.attackHitbox.enable();
        if (!this.inAir) {
          this.anims.play("adventurerAttack" + this.attackCombo, false);
          this.body.setVelocityX(this.flipX ? this.attackCombo === 3 ? -600 : -300 : this.attackCombo === 3 ? 600 : 300);
          this.attackCombo = this.attackCombo === 3 ? 1 : this.attackCombo + 1;
        } else if (this.airAttackCombo) {
          this.body.setVelocityX(0);
          this.anims.play("adventurerAirAttack" + this.airAttackCombo, false);
          this.body.setVelocityY(this.airAttackCombo === 3 ? 300 : -150);
          // If the Air Attack is on the third and final attack then sets to 0 which means combo is finished.
          this.airAttackCombo = this.airAttackCombo === 3 ? 0 : this.airAttackCombo + 1;
        }
      }
  
      // TODO: In GameScene, if current time is AFTER this.attackTrigger and BEFORE
      // this.nextAttack, then continually do overlap checks on enemies and the Player
      // attack box and if they overlap damage the enemy. Pass in the time of the attack
      // to the damage function call and keep track of that in the Enemy class. That way
      // the Enemy will only be damaged by an attack once because we do a bunch of overlap
      // checks.
      this.attackStart = this.currentScene.time.now;
      this.nextAttack = this.attackStart + this.attackCooldown;
      this.attackTrigger = this.attackStart + this.attackCooldown / 3;
    }
  }

  public triggerAttack(): object {
    if (
      this.isAttacking &&
      this.currentScene.time.now >= this.attackTrigger &&
      this.currentScene.time.now <= this.nextAttack
    ) {
      return {
        faceLeft: this.flipX,
        damageId: this.attackStart
      };
    } else {
      return null;
    }
  }
 
  public runLeft(): void {
    if (!this.isAttacking && !this.isSliding) {
      this.flip(true);
      if (this.body.offset.x > 0) {
        this.body.setOffset(this.attributes.body.offset.x, this.body.offset.y);
      }
      this.body.setVelocityX(-300);
      if (!this.inAir) {
        this.isRunning = true;
        this.anims.play(`adventurerRun${this.isWielding ? "Sword" : ""}`, true);
      }
    }
  }

  public runRight(): void {
    if (!this.isAttacking && !this.isSliding) {
      this.flip(false);
      if (this.body.offset.x < 0) {
        this.body.setOffset(this.attributes.body.offset.x, this.body.offset.y);
      }
      this.body.setVelocityX(300);
      if (!this.inAir) {
        this.isRunning = true;
        this.anims.play(`adventurerRun${this.isWielding ? "Sword" : ""}`, true);
      }
    }
  }

  public stopRun(): void {
    this.isRunning = false;
    if (this.body.velocity.x > 0) {
      this.body.setVelocityX(this.body.velocity.x < 50 ? 0 : this.body.velocity.x - 50);
    } else if (this.body.velocity.x < 0) {
      this.body.setVelocityX(this.body.velocity.x > -50 ? 0 : this.body.velocity.x + 50);
    }
    // if (!this.isHurting && !this.isJumping && !this.isAttacking && !this.isSliding) {
    if ((!this.anims.isPlaying || this.anims.getCurrentKey().startsWith("adventurerRun")) && !this.inAir) {
      this.anims.play(`adventurerIdle${this.isWielding ? "Sword" : ""}`, true);
    }
  }

  public damage(amount: number): boolean {
    if (!this.isDead && !this.isSliding) {
      this.isAttacking = false;
      this.attackHitbox.disable();
      this.isHurting = true;
      this.health -= amount;
      this.currentScene.registry.set("health", this.health > 0 ? this.health : 0);
      this.currentScene.events.emit("healthChanged");

      this.setTintFill(0xffffff);
      setTimeout(() => {
        this.clearTint();
      }, 100);

      if (this.health > 0) {
        if (!this.inAir) this.anims.play("adventurerHurt", true);
        setTimeout(() => {
          this.isHurting = false;
        }, 400);
      } else {
        this.isDead = true;
      }

      return true;
    } else {
      return false;
    }
  }

  private flip(state: boolean): void {
    this.flipX = state;
    if (state) {
      this.body.setOffset(this.attributes.body.offset.flipX, this.body.offset.y);
    } else {
      this.body.setOffset(this.attributes.body.offset.x, this.body.offset.y);
    }
  }

  private isOffTheScreen(): void {
    if (this.y + this.height > this.scene.sys.canvas.height) {
      this.isDead = true;
    }
  }

  private shootArrow(): void {
    this.projectiles.add(new Projectile({
      scene: this.currentScene,
      owner: 'player',
      x: this.flipX ? this.getBodyLeftSide() : this.getBodyRightSide(),
      y: this.getBodyHeightCenter() + this.body.height,
      info: this.attributes.attack[0].projectile,
      damage: this.attributes.attack[0].damage,
      key: `adventurerBowProjectile1`,
      flip: !this.flipX
    }));
  }
}
