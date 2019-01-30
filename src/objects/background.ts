/**
 * @author Flynn Mattson
 */

export class Background {
  private backgrounds: Array<Phaser.GameObjects.TileSprite>;
  private lastPositionX: number = 0;
  private lastPositionY: number = 0;

  constructor(params) {
    switch (params.area) {
      case "jungle":
        this.backgrounds = [
          params.scene.add.tileSprite(params.x, params.y, params.width, params.height, "jungle_background1"),
          params.scene.add.tileSprite(params.x, params.y, params.width, params.height, "jungle_background2"),
          params.scene.add.tileSprite(params.x, params.y, params.width, params.height, "jungle_background3"),
          params.scene.add.tileSprite(params.x, params.y, params.width, params.height, "jungle_background4"),
          params.scene.add.tileSprite(params.x, params.y, params.width, params.height, "jungle_background5")
        ];
        break;
      case "town":
        this.backgrounds = [
          params.scene.add.tileSprite(params.scene.sys.canvas.width / 2, params.scene.sys.canvas.height / 2, 384 * 3, 216, "town_background1"),
          params.scene.add.tileSprite(params.scene.sys.canvas.width / 2, params.scene.sys.canvas.height / 2, 384 * 3, 216, "town_background2"),
        ];
        break;
      default:
        this.backgrounds = [];
        break;
    }

    this.backgrounds.forEach((bg) => bg.setScale(3));
  }

  public shiftX(playerVelocity: number, playerPosition: number): void {
    if (playerVelocity !== 0 && playerPosition !== this.lastPositionX) {
      for (let i = 0; i < this.backgrounds.length; i++) {
        this.backgrounds[i].tilePositionX += (playerVelocity / 2500) * (1 + (i * 0.20));
      }
    }
    
    this.lastPositionX = playerPosition;
  }

  public shiftY(cameraPosition: number): void {
    if (cameraPosition !== this.lastPositionY && this.lastPositionY !== 0) {
      for (let i = 0; i < this.backgrounds.length; i++) {
        this.backgrounds[i].y += cameraPosition - this.lastPositionY;
      }
    }

    this.lastPositionY = cameraPosition;
  }
}