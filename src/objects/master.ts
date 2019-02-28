/**
 * @author       Flynn Mattson
 * @copyright    2019 Flynn Mattson
 * @description  Master Object
 */

export class Master extends Phaser.GameObjects.Sprite {
  private currentScene: Phaser.Scene;
  private attributes: any;

  constructor(params) {
    super(params.scene, params.x, params.y, params.key);
    this.currentScene = params.scene;
    this.attributes = params.scene.cache.json.get('attributes')['master'];

    this.setScale(3);
    this.setOrigin(0, 0);
    this.setDepth(this.attributes.depth);
    this.flipX = params.scene.scene.key === "TownScene";

    params.scene.physics.world.enable(this);
    this.body.allowGravity = true;
    this.body.setOffset(
      this.flipX ? this.attributes.body.offset.flipX : this.attributes.body.offset.x,
      params.scene.scene.key === "TownScene" ? 10 : this.attributes.body.offset.y
    );
    this.body.setSize(this.attributes.body.size.x, this.attributes.body.size.y, false);

    params.scene.add.existing(this);
  }

  update(): void {
    this.anims.play('adventurerIdle', true);
  }
};