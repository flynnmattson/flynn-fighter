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
  private secondaryAttack: string;

  // Particle Variables

  private particles: Phaser.GameObjects.Particles.ParticleEmitterManager;
  private fire: Phaser.GameObjects.Particles.ParticleEmitter;
  private emitterLine: Phaser.Geom.Line;
  

  constructor(params) {
    super(params.scene, params.x, params.y, params.key);
    this.currentScene = params.scene;
    this.attackHitbox = params.attackBox;
    this.isWielding = params.wield || false;
    if (!this.isWielding) {
      this.attackHitbox.disable();
    }
    this.health = params.scene.registry.get("health");
    this.secondaryAttack = params.scene.registry.get("secondaryAttack");
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

    //particles
    this.particles = this.currentScene.add.particles('smokeAndFire');
    this.particles.setDepth(20);

    params.scene.add.existing(this);
  }

  update(): void {
    if (this.attackHitbox.isEnabled() && this.attackHitbox.body.velocity.x === 0) {
      if (this.flipX) {
        this.attackHitbox.setPosition(
          this.body.x - (this.attackHitbox.getBodyWidth() / 2),
          // - attributes.offset,
          this.body.y
        );
      } else {
        this.attackHitbox.setPosition(
          (this.body.x + this.body.width) - (this.attackHitbox.getBodyWidth() / 2),
          // + attributes.offset,
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
      this.stopAttacking();
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
    if (this.isWielding && !this.isSliding && this.currentScene.time.now > this.nextAttack) {
      this.isAttacking = true;
      if (secondaryAttack) {
        if (!this.inAir) {
          switch (this.secondaryAttack) {
            case 'bowAttack':
              this.anims.play("adventurerBowAttack1", false);
              setTimeout(() => {
                if (this.isAttacking) {
                  this.body.setVelocityX(this.attributes.bowAttack[0].velocity * (this.flipX ? 1 : -1));
                  this.shootArrow(this.attributes.bowAttack[0]);
                }
              }, this.attributes.bowAttack[0].trigger);
              this.startAttackTimers(this.attributes.bowAttack[0], false);
              break;
            case 'magicAttack':
              this.anims.play("adventurerCast", false);
              setTimeout(() => {
                if (this.isAttacking) {
                  this.body.setVelocityX(this.attributes.magicAttack[0].velocity * (this.flipX ? 1 : -1));
                  this.castMagic();
                  this.setAttackHitbox(this.attributes.magicAttack[0].attackBox);
                }
              }, this.attributes.magicAttack[0].trigger);
              this.startAttackTimers(this.attributes.magicAttack[0], true);
              break;
            default:
              return;
          }
        } else {
          switch (this.secondaryAttack) {
            case 'bowAttack':
              this.anims.play("adventurerBowAttack2", false);
              this.body.setVelocityX(0);
              setTimeout(() => {
                if (this.isAttacking) this.shootArrow(this.attributes.bowAttack[1]);
              }, this.attributes.bowAttack[1].trigger);
              this.startAttackTimers(this.attributes.bowAttack[1], false);
              break;
            default:
              return;
          }
        }
      } else {
        if (!this.inAir) {
          this.anims.play("adventurerAttack" + this.attackCombo, false);
          this.body.setVelocityX(this.attributes.swordGroundAttack[this.attackCombo - 1].velocity * (this.flipX ? -1 : 1));
          this.setAttackHitbox(this.attributes.swordGroundAttack[this.attackCombo - 1].attackBox);
          this.startAttackTimers(this.attributes.swordGroundAttack[this.attackCombo - 1], true);
          this.attackCombo = this.attackCombo === 3 ? 1 : this.attackCombo + 1;
        } else if (this.airAttackCombo) {
          this.anims.play("adventurerAirAttack" + this.airAttackCombo, false);
          this.body.setVelocity(0, this.attributes.swordAirAttack[this.airAttackCombo - 1].velocity);
          this.setAttackHitbox(this.attributes.swordAirAttack[this.airAttackCombo - 1].attackBox);
          this.startAttackTimers(this.attributes.swordAirAttack[this.airAttackCombo - 1], true);
          // If the Air Attack is on the third and final attack then sets to 0 which means combo is finished.
          this.airAttackCombo = this.airAttackCombo === 3 ? 0 : this.airAttackCombo + 1;
        }
      }
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
       if (this.fire && this.fire.active) this.fire.stop();
      }if (this.fire && this.fire.active) this.fire.stop();
      this.body.setVelocityX(-300);
      if (!this.inAir) {
        this.isRunning = true;
        this.anims.play(`adventurerRun${this.isWielding ? "Sword" : ""}`, true);
      }
    } else {
      this.stopRun();
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
    } else {
      this.stopRun();
    }
  }

  public stopRun(): void {
    if (!this.isSliding) {
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
  }

  public damage(amount: number): boolean {
    if (!this.isDead && !this.isSliding) {
      this.stopAttacking();
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

  // TODO: This function shouldn't need the needsHitbox parameter. Instead look at the
  // attributes and if the range and offset keys exist than we know it requires a hitbox.
  private startAttackTimers(attributes: any, needsHitbox: boolean): void {
    if (needsHitbox) this.attackHitbox.enable();
    // TODO: In GameScene, if current time is AFTER this.attackTrigger and BEFORE
    // this.nextAttack, then continually do overlap checks on enemies and the Player
    // attack box and if they overlap damage the enemy. Pass in the time of the attack
    // to the damage function call and keep track of that in the Enemy class. That way
    // the Enemy will only be damaged by an attack once because we do a bunch of overlap
    // checks.
    this.attackStart = this.currentScene.time.now;
    this.nextAttack = this.attackStart + attributes.speed;
    this.attackTrigger = this.attackStart + attributes.trigger;
  }

  private shootArrow(attributes: any): void {
    this.projectiles.add(new Projectile({
      scene: this.currentScene,
      owner: 'player',
      x: this.flipX ? this.getBodyLeftSide() : this.getBodyRightSide(),
      y: this.getBodyHeightCenter() + this.body.height,
      info: attributes.projectile,
      damage: attributes.damage,
      key: `adventurerBowProjectile1`,
      flip: !this.flipX
    }));
  }

  private castMagic(): void {
    this.emitterLine = new Phaser.Geom.Line(0, 0, this.flipX ? -200 : 200, 0);
    this.fire = this.particles.createEmitter({
      emitZone: { source: this.emitterLine, type: 'edge', quantity: 110, yoyo: false },
      frame: [3, 4, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      // speed: 75,
      speed: 250,
      // frequency: 10, // How often to shoot the texture. Lower means more frequent
      quantity: 3, // Number of emitters to shoot. Defaults to 1
      scale: { start: 3, end: 2 },
      angle: { min: 225, max: 315 }, // Angled upward. Good for when enemies are on fire.
      // angle: { min: -25, max: 45 },
      alpha: { start: 1, end: 0.6, ease: 'Expo.easeOut' },
      blendMode: 'ADD',
      rotate: { min: -180, max: 180 },
      lifespan: { min: 300, max: 400 },
      gravityY: -200
    });
    this.fire.startFollow(this, this.flipX ? 0 : 140, 60);
  }

  private setAttackHitbox(attributes: any): void {
    this.attackHitbox.enable();
    this.attackHitbox.setBodySize(attributes.width, attributes.height);
    if (this.flipX) {
      this.attackHitbox.setPosition(
        this.body.x - (this.attackHitbox.getBodyWidth() / 2),
        // - attributes.offset,
        this.body.y
      );
      this.attackHitbox.body.setVelocityX(-attributes.velocity);
    } else {
      this.attackHitbox.setPosition(
        (this.body.x + this.body.width) - (this.attackHitbox.getBodyWidth() / 2),
        // + attributes.offset,
        this.body.y
      );
      this.attackHitbox.body.setVelocityX(attributes.velocity);
    }
  }

  private stopAttacking(): void {
    this.isAttacking = false;
    if (this.attackHitbox.isEnabled()) {
      this.attackHitbox.disable();
    }
    if (this.fire && this.fire.active) {
      this.fire.stop();
    }
  }
}
