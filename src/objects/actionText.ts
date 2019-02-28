/**
 * @author       Flynn Mattson
 * @copyright    2019 Flynn Mattson
 * @description  ActionText Object
 */

export class ActionText extends Phaser.GameObjects.BitmapText {
  private fadeInTween: Phaser.Tweens.Tween;
  private fadeOutTween: Phaser.Tweens.Tween;
  private fadeReset: number = 0;
  private fadeInCooldown: number = 0;
  private showingText: boolean;
  private keyImage: Phaser.GameObjects.Image;
  private keyFadeInTween: Phaser.Tweens.Tween;
  private keyFadeOutTween: Phaser.Tweens.Tween;

  constructor(params) {
    super(
      params.scene,
      params.key ? params.x + 35 : params.x,
      params.y,
      params.type,
      params.text,
      params.size
    );
    
    if (params.key) {
      this.keyImage = params.scene.add.image(
        params.x,
        params.y + 16,
        params.key
        );
        this.keyImage.setScale(4);
    }
      
    if (params.follow) {
      this.setScrollFactor(0);
      if (this.keyImage) this.keyImage.setScrollFactor(0);
    }

    if ('bounce' in params && params.bounce) {
      params.scene.tweens.add({
        targets: this,
        y: this.y + (params.bounce),
        duration: 500,
        repeat: -1,
        yoyo: true
      });
      if (this.keyImage) {
        params.scene.tweens.add({
          targets: this.keyImage,
          y: this.keyImage.y + (params.bounce),
          duration: 500,
          repeat: -1,
          yoyo: true
        });
      }
    }

    if ('fadeDuration' in params && params.fadeDuration) {
      this.fadeInTween = params.scene.tweens.add({
        targets: this,
        duration: params.fadeDuration,
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
        duration: params.fadeDuration,
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
  
      if (this.keyImage) {
        this.keyFadeInTween = params.scene.tweens.add({
          targets: this.keyImage,
          duration: params.fadeDuration,
          alpha: {
            getStart: () => 0,
            getEnd: () => 1
          },
          repeat: 0,
          yoyo: false,
          onComplete: () => {
  
          }
        });
        this.keyFadeOutTween = params.scene.tweens.add({
          targets: this.keyImage,
          duration: params.fadeDuration,
          alpha: {
            getStart: () => 1,
            getEnd: () => 0
          },
          repeat: 0,
          yoyo: false,
          onComplete: () => {
  
          }
        });
        this.keyFadeInTween.pause();
        this.keyFadeOutTween.pause();
        this.keyImage.alpha = 0;
      }
  
      this.fadeInTween.pause();
      this.fadeOutTween.pause();
      this.alpha = 0;
      this.fadeInCooldown = 0;
    }
    
    params.scene.add.existing(this);
  }

  update(): void {
    // If the Fade tweens are defined at all
    if (this.fadeOutTween) {
      if (this.fadeInCooldown > 0) {
        this.fadeInCooldown -= 10;
      }
  
      if (this.fadeReset > 0) {
        this.fadeReset -= 10;
      } else if (this.alpha === 1) {
        this.fadeOutTween.restart();
        if (this.keyFadeOutTween) this.keyFadeOutTween.restart();
      }
    }
  }

  public isShowingText(): boolean {
    return this.showingText;
  }

  public showText(fadeReset): void {
    if (!this.fadeInCooldown && this.alpha < 1 && (this.fadeInTween.isPaused() || !this.fadeInTween.isPlaying())) {
      this.fadeInTween.restart();
      if (this.keyFadeInTween) this.keyFadeInTween.restart();
    }
    this.fadeInCooldown = 50;

    this.fadeReset = fadeReset;
  }
}
