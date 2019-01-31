/**
 * @author       Flynn Mattson
 * @copyright    2019 Flynn Mattson
 * @description  InputHandler Object
 */

export class InputHandler {
  // keys
  private jumpKey: Phaser.Input.Keyboard.Key;
  private leftKey: Phaser.Input.Keyboard.Key;
  private rightKey: Phaser.Input.Keyboard.Key;
  private downKey: Phaser.Input.Keyboard.Key;
  private escapeKey: Phaser.Input.Keyboard.Key;
  private interactKey: Phaser.Input.Keyboard.Key;
  // private keyWait: number;
  private currentScene: Phaser.Scene;

  constructor (params) {
    this.currentScene = params.scene;
    this.jumpKey = params.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.leftKey = params.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.rightKey = params.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.downKey = params.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.escapeKey = params.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    if (params.interactKey) {
      this.interactKey = params.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }
  }

  public reset(): void {
    this.escapeKey.isDown = false;
    if (this.interactKey) this.interactKey.isDown = false;
  }

  public setClickAction(action: Function): void {
    this.currentScene.input.on(
      "pointerdown",
      () => { action; },
      this.currentScene
    );
  }

  public isPressedJumpKey(): boolean {
    return this.jumpKey.isDown && this.jumpKey.repeats === 1;
  }

  public isPressedEscapeKey(): boolean {
    return this.escapeKey.isDown;
  }

  public isPressedInteractKey(): boolean {
    return this.interactKey.isDown;
  }

  public isPressedDownKey(): boolean {
    return this.downKey.isDown;
  }

  public isPressedLeftKey(): boolean {
    return this.leftKey.isDown;
  }

  public isPressedRightKey(): boolean {
    return this.rightKey.isDown;
  }
}
