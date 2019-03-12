import { GameScene } from "../scenes/gameScene";
import { Enemy } from "./enemy";
import { AttackBox } from "./attackBox";

/**
 * @author       Flynn Mattson
 * @copyright    2019 Flynn Mattson
 * @description  Spawner Object
 */

export class Spawner {
  private timer: Phaser.Time.TimerEvent;
  private activeEnemies: number;
  private currentWave: number;
  private currentWaveInfo: any;
  private currentScene: GameScene;
  private position: {x: number, y: number};
  private attributes: any;
  private reverseSpawn: boolean;

  constructor (params) {
    this.currentScene = params.scene;
    this.attributes = params.attributes;
    this.currentWave = -1; // Once I call startNextWave() it will increment to 0 which is first wave.
    this.activeEnemies = 0;
    this.position = {
      x: params.x,
      y: params.y
    };
    this.reverseSpawn = false;
  }

  public startNextWave(): void {
    this.currentWave++;

    if (this.attributes.waves[this.currentWave] !== null) {
      // NOTE: Duping object because I'm scared of changing fields on actual object in cache.
      this.currentWaveInfo = JSON.parse(JSON.stringify(this.attributes.waves[this.currentWave]));
      for (let i = 0; i < this.currentWaveInfo.enemies.length; i++) {
        this.currentWaveInfo.enemies[i].spawnTotal =
          this.currentWaveInfo.enemies[i].amount * 
          this.currentWaveInfo.rounds;
      }
  
      this.timer = this.currentScene.time.addEvent({
        delay: this.currentWaveInfo.delay,
        callback: () => {
          this.spawn();
        },
        callbackScope: this.currentScene,
        loop: true,
        startAt: this.currentWaveInfo.delay - 500
      });
    } else {
      this.timer = null;
    }
  }

  public stop(): void {
    this.timer.paused = true;
  }

  public enemyDied(): void {
    this.activeEnemies--;
  }

  public waveFinished(): boolean {
    return !this.timer || this.timer.paused;
  }

  private spawn(): void {
    let didSpawn = false; // An enemy did spawn

    if (this.activeEnemies < this.currentWaveInfo.activeLimit) {
      for (
        let i = this.reverseSpawn ? this.currentWaveInfo.enemies.length -1 : 0; 
        this.reverseSpawn ? i >= 0 : i < this.currentWaveInfo.enemies.length;
        this.reverseSpawn ? i-- : i++
      ) {
        for (let j = 0; j < this.currentWaveInfo.enemies[i].amount; j++) {
          if (this.currentWaveInfo.enemies[i].spawnTotal) {
            didSpawn = true;
            this.activeEnemies++;
            this.currentWaveInfo.enemies[i].spawnTotal--;
            this.currentScene.time.addEvent({
              delay: 500 * (j + 1),
              callback: () => {
                this.currentScene.getEnemies().add(
                  new Enemy({
                    scene: this.currentScene,
                    spawner: this,
                    x: this.position.x,
                    y: this.position.y,
                    key: this.currentWaveInfo.enemies[i].type,
                    attackBox: new AttackBox({
                      scene: this.currentScene
                    })
                  })
                );
              },
              callbackScope: this.currentScene,
              loop: false
            });
          }
        }
      }
  
      this.reverseSpawn = !this.reverseSpawn;
    }

    // No active enemies and all enemies have been spawned and the wave is finished for this spawner.
    if (!didSpawn && !this.activeEnemies) {
      this.stop();
    }
  }
}