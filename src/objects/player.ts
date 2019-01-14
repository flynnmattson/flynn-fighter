/**
 * @author       Flynn Mattson
 * @copyright    2019 Flynn Mattson
 * @description  Player Object
 */

export class Player extends Phaser.GameObjects.Sprite {
  private isDead: boolean = false;
  private inAir: boolean = false;
  private isRunning: boolean = false;
  private isAttacking: boolean = false;
  private isHurting: boolean = false;
  private isSliding: boolean = false;
  private isWielding: boolean = false;
  private currentScene: Phaser.Scene;
  private attackCooldown: number = 375;
  private nextAttack: number = 0;
  private nextSlide: number = 0;
  private attackCombo: number = 1;
  private airAttackCombo: number = 1;
  private dyingTime: number = 400;
  private health: number;

  public getDead(): boolean {
    return this.isDead;
  }

  public getVelocityX(): number {
    return this.body.velocity.x;
  }

  public getPositionX(): number {
    return this.body.x;
  }

  public getRightSide(): number {
    return this.body.x + this.body.width - 7;
  }

  public getLeftSide(): number {
    return this.body.x - this.body.width - 13;
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

  constructor(params) {
    super(params.scene, params.x, params.y, params.key, params.frame);
    this.currentScene = params.scene;
    this.isWielding = params.wield || false;
    this.health = params.scene.registry.get("health");

    // image
    this.setScale(3);
    this.setOrigin(0, 0);

    // physics
    params.scene.physics.world.enable(this);
    this.body.allowGravity = true;
    this.body.setOffset(12, params.scene.scene.key === "TownScene" ? 15 : 7);
    this.body.setSize(24, 25, false);

    params.scene.add.existing(this);
  }

  update(): void {
    if (this.body.velocity.y === 0 && this.inAir) {
      this.inAir = false;
      this.airAttackCombo = 1;
    } else if (this.body.velocity.y != 0) {
      if (!this.anims.isPlaying) {
        this.anims.play("adventurerFall", true);
      }
      this.inAir = true;
      this.isRunning = false;
    }

    if (this.isAttacking && this.currentScene.time.now > this.nextAttack) {
      this.isAttacking = false;
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

    this.isOffTheScreen();
  }

  public jump(): void {
    if (!this.isSliding && !this.inAir && !this.isAttacking) {
      this.inAir = true;
      this.body.setVelocityY(-350);
      this.anims.play("adventurerJump", false);
    }
  }

  public slide(): void {
    if (this.currentScene.time.now > this.nextSlide && !this.isAttacking && !this.inAir) {
      this.isSliding = true;
      this.body.setVelocityX(this.flipX ? this.isRunning ? -550 : -1000 : this.isRunning ? 550 : 1000);
      this.anims.play("adventurerSlide", true);
      this.nextSlide = this.currentScene.time.now + this.attackCooldown * 2;
    }
  }

  public attack(): object {
    if (!this.isRunning && !this.isSliding && this.currentScene.time.now > this.nextAttack) {
      this.isAttacking = true;
      if (this.inAir) {
        this.body.setVelocityX(0);
        this.anims.play("adventurerAirAttack" + this.airAttackCombo, false);
        this.body.setVelocityY(this.airAttackCombo === 3 ? 300 : -150);
        this.airAttackCombo = this.airAttackCombo === 3 ? 1 : this.airAttackCombo + 1;
      } else {
        this.anims.play("adventurerAttack" + this.attackCombo, false);
        this.body.setVelocityX(this.flipX ? this.attackCombo === 3 ? -600 : -300 : this.attackCombo === 3 ? 600 : 300);
        this.attackCombo = this.attackCombo === 3 ? 1 : this.attackCombo + 1;
      }

      this.nextAttack = this.currentScene.time.now + this.attackCooldown;
      return {
        triggerDamage: this.inAir ? this.attackCooldown - this.attackCooldown / 4 : this.attackCooldown / 2,
        faceLeft: this.flipX
      };
    } else {
      return null;
    }
  }
 
  public runLeft(): void {
    if (!this.isAttacking && !this.isSliding) {
      this.flipX = true;
      this.body.setVelocityX(-300);
      if (!this.inAir) {
        this.isRunning = true;
        this.anims.play(`adventurerRun${this.isWielding ? "Sword" : ""}`, true);
      }
    }
  }

  public runRight(): void {
    if (!this.isAttacking && !this.isSliding) {
      this.flipX = false;
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
      this.body.setVelocityX(this.body.velocity.x - 50);
    } else if (this.body.velocity.x < 0) {
      this.body.setVelocityX(this.body.velocity.x + 50);
    }
    // if (!this.isHurting && !this.isJumping && !this.isAttacking && !this.isSliding) {
    if ((!this.anims.isPlaying || this.anims.getCurrentKey().startsWith("adventurerRun")) && !this.inAir) {
      this.anims.play(`adventurerIdle${this.isWielding ? "Sword" : ""}`, true);
    }
  }

  public damage(fromLeft: boolean): void {
    if (!this.isDead && !this.isSliding) {
      this.isAttacking = false;
      this.isHurting = true;
      this.health--;
      this.currentScene.registry.set("health", this.health);
      this.currentScene.events.emit("healthChanged");
      if (this.health > 0) {
        this.anims.play("adventurerHurt", true);
        // this.body.setVelocity(fromLeft ? 75 : -75, -75);
        setTimeout(() => {
          this.isHurting = false;
          this.clearTint();
          this.setAlpha(1);
        }, 400);
      } else {
        this.isDead = true;
      }
      this.setTint(0xfc8a75);
      this.setAlpha(0.9);
    }
  }

  private isOffTheScreen(): void {
    if (this.y + this.height > this.scene.sys.canvas.height) {
      this.isDead = true;
    }
  }
}
