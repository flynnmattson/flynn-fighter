/**
 * @author Flynn Mattson
 */

export class Background {
  private background1: Phaser.GameObjects.TileSprite;
  private background2: Phaser.GameObjects.TileSprite;
  private background3: Phaser.GameObjects.TileSprite;
  private background4: Phaser.GameObjects.TileSprite;
  private background5: Phaser.GameObjects.TileSprite;
  private backgrounds: Array<Phaser.GameObjects.TileSprite>;
  private lastPosition: Number = 0;

  constructor(params) {
    this.background1 = params.scene.add.tileSprite(params.scene.sys.canvas.width / 2, params.scene.sys.canvas.height / 2, 384 * 2, 216, "background1");
    this.background1.setScale(3);
    this.background2 = params.scene.add.tileSprite(params.scene.sys.canvas.width / 2, params.scene.sys.canvas.height / 2, 384 * 2, 216, "background2");
    this.background2.setScale(3);
    this.background3 = params.scene.add.tileSprite(params.scene.sys.canvas.width / 2, params.scene.sys.canvas.height / 2, 384 * 2, 216, "background3");
    this.background3.setScale(3);
    this.background4 = params.scene.add.tileSprite(params.scene.sys.canvas.width / 2, params.scene.sys.canvas.height / 2, 384 * 2, 216, "background4");
    this.background4.setScale(3);
    this.background5 = params.scene.add.tileSprite(params.scene.sys.canvas.width / 2, params.scene.sys.canvas.height / 2, 384 * 2, 216, "background5");
    this.background5.setScale(3);
    this.backgrounds = [
      this.background1,
      this.background2,
      this.background3,
      this.background4,
      this.background5
    ];
  }

  public shift(playerVelocity, playerPosition): void {
    if (playerVelocity !== 0 && playerPosition !== this.lastPosition) {
      for (let i = 0; i < this.backgrounds.length; i++) {
        this.backgrounds[i].tilePositionX += (playerVelocity / 2500) * (1 + (i * 0.20));
      }
    }
    
    this.lastPosition = playerPosition;
  }
}