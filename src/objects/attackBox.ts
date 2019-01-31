/**
 * @author       Flynn Mattson
 * @copyright    2019 Flynn Mattson
 * @description  AttackBox Object
 */

export class AttackBox extends Phaser.GameObjects.Rectangle {
  private currentScene: Phaser.Scene;

  constructor(params) {
    super(params.scene, 0, 0, 0, 0);
    this.currentScene = params.scene;
    this.setScale(3);

    // physics
    params.scene.physics.world.enable(this);
    this.body.allowGravity = false;
    // this.body.setSize(10, 10, false);

    params.scene.add.existing(this);
  }

  public setBodySize(width: number, height: number): void {
    this.body.setSize(width, height, false);
  }

  public getBodyWidth(): number {
    return this.body.width;
  }

  public enable(): void {
    this.setActive(true);
    this.currentScene.physics.world.enable(this);
  }

  public disable(): void {
    this.setActive(false);
    this.currentScene.physics.world.disable(this);
  }

  public isEnabled(): boolean {
    return this.active;
  }

  update(): void {

  }
}
