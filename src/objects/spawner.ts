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
  private delay: number;
  private currentScene: GameScene;
  private position: {x: number, y: number};
  private enemyTypes: Array<{type: string, amount: number}>;

  constructor (params) {
    this.currentScene = params.scene;
    this.enemyTypes = [];
    this.delay = 10000;
    this.position = {
      x: params.x,
      y: params.y
    };

    params.properties.forEach((prop) => {
      if (prop.name === "delay") this.delay = prop.value;

      if (prop.name.startsWith("enemy_")) {
        this.enemyTypes.push({
          type: prop.name.split("enemy_")[1],
          amount: prop.value
        });
      }
    });

    this.timer = params.scene.time.addEvent({
      delay: this.delay,
      callback: () => {
        this.spawn();
      },
      callbackScope: this.currentScene,
      loop: true,
      paused: true
    });
  }

  public start(): void {
    this.timer.startAt = this.delay - 200;
    this.timer.paused = false;
  }

  public stop(): void {
    this.timer.paused = true;
  }

  private spawn(): void {
    this.enemyTypes.forEach((enemy) => {
      for (let i = 0; i < enemy.amount; i++) {
        this.currentScene.time.addEvent({
          delay: 400 * (i + 1),
          callback: () => {
            this.currentScene.getEnemies().add(
              new Enemy({
                scene: this.currentScene,
                x: this.position.x,
                y: this.position.y,
                key: enemy.type,
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
    });
  }
}