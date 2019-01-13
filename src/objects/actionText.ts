/**
 * @author       Flynn Mattson
 * @copyright    2019 Flynn Mattson
 * @description  ActionText Object
 */

export class ActionText extends Phaser.GameObjects.BitmapText {
  private fadeInTween: Phaser.Tweens.Tween;
  private fadeOutTween: Phaser.Tweens.Tween;
  private fadeReset: number = 0;
  private showingText: boolean;

  constructor(params) {
    super(params.scene, params.x, params.y, params.type, params.text, params.size);

    if (params.bounce) {
      params.scene.tweens.add({
        targets: this,
        y: this.y + 25,
        duration: 500,
        repeat: -1,
        yoyo: true
      });
    }
    this.fadeInTween = params.scene.tweens.add({
      targets: this,
      duration: 500,
      alpha: {
        getStart: () => 0,
        getEnd: () => 1
      },
      repeat: 0,
      yoyo: false,
      onComplete: () => {
        this.showingText = true;
      }
    });
    this.fadeOutTween = params.scene.tweens.add({
      targets: this,
      duration: 500,
      alpha: {
        getStart: () => 1,
        getEnd: () => 0
      },
      repeat: 0,
      yoyo: false,
      onComplete: () => {
        this.showingText = false;
      }
    });
    this.fadeInTween.pause();
    this.fadeOutTween.pause();
    this.alpha = 0;

    params.scene.add.existing(this);
  }

  update(): void {
    if (this.fadeReset > 0) {
      this.fadeReset -= 10;
    } else if (this.alpha === 1) {
      this.fadeOutTween.restart();
    }
  }

  public isShowingText(): boolean {
    return this.showingText;
  }

  public showText(fadeReset): void {
    if (this.alpha < 1 && (this.fadeInTween.isPaused() || !this.fadeInTween.isPlaying())) {
      this.fadeInTween.restart();
    }
    this.fadeReset = fadeReset;
  }
}
