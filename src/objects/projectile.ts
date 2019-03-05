import { Scene } from "phaser";

/**
 * @author       Flynn Mattson
 * @copyright    2019 Flynn Mattson
 * @description  Projectile Object
 */

export class Projectile extends Phaser.GameObjects.Sprite {
  private currentScene: Scene;

  constructor(params) {
    super(params.scene, params.x, params.y, params.key);

    this.currentScene = params.scene;
    this.setScale(3);

    // physics
    params.scene.physics.world.enable(this);
    this.body.allowGravity = false;

    this.body.setSize(params.info.body.size.x, params.info.body.size.y, false);
    this.body.setOffset(params.flip ? params.info.body.offset.flipX : params.info.body.offset.x, params.info.body.offset.y);

    params.scene.physics.add.collider(this, params.scene.getGroundLayer(), () => {
      this.destroy();
    });

    if (params.owner === 'enemy') {
      params.scene.physics.add.overlap(this, params.scene.getPlayer(), (proj, player) => {
        // Damage Player here. If he's sliding then ignore damage and don't destroy it
        if (params.scene.getPlayer().damage(params.damage)) {
          this.destroy();
        }
      });
    } else if (params.owner === 'player') {
      params.scene.physics.add.overlap(this, params.scene.getEnemies(), (proj, enemy) => {
        enemy.damage({
          faceLeft: this.flipX,
          damageId: this.currentScene.time.now
        });
        this.destroy();
      });
    }

    this.flipX = params.flip;
    this.body.setVelocityX(params.flip ? params.info.speed : -params.info.speed);
    this.anims.play(params.key);

    params.scene.add.existing(this);
  }

  update(): void {}
}