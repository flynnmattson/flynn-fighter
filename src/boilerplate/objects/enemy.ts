/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @description  Flappy Bird: Bird
 * @license      Digitsensitive
 */

export class Enemy extends Phaser.GameObjects.Sprite {
    private anim: Phaser.Tweens.Tween[];
    private isDead: boolean = false;
    private isJumping: boolean = false;

    public getDead(): boolean {
        return this.isDead;
    }

    public setDead(dead): void {
        this.isDead = dead;
    }

    constructor(params) {
        super(params.scene, params.x, params.y, params.key, params.frame);

        // image
        this.setScale(3);
        this.setOrigin(0, 0);

        // physics
        params.scene.physics.world.enable(this);
        this.body.allowGravity = true;
        this.body.setSize(17, 12);

        // animations & tweens
        this.anim = [];
        this.anim.push(
            params.scene.tweens.add({
                targets: this,
                duration: 300,
                angle: 8,
                repeat: -1,
                yoyo: true,
                paused: true
            }),
            params.scene.tweens.add({
                targets: this,
                duration: 300,
                angle: -5,
                repeat: -1,
                yoyo: true,
                paused: true
            })
        );

        params.scene.add.existing(this);
    }

    update(): void {
        this.handleAngleChange();
        this.handleGravity();
        this.attack();
    }

    private handleGravity(): void {
        if (this.body.y >= this.scene.sys.canvas.height - 115) {
            this.isJumping = false;
            this.body.allowGravity = false;
            if (this.body.velocity.y > 0) {
                this.body.setVelocityY(0);
            }
        } else {
            this.stopRun();
            this.body.allowGravity = true;
        }
    }

    private handleAngleChange(): void {
        if (this.angle > 0) {
            this.angle -= 1;
        } else if (this.angle < -1) {
            this.angle += 1;
        }
    }

    private attack(): void {
        if (this.x < this.scene.sys.canvas.width / 2 - 65) {
            this.runRight();
            this.x += 1;
        } else if (this.x > this.scene.sys.canvas.width / 2 + 20) {
            this.runLeft();
            this.x -= 1;
        } else {
            this.stopRun();
            // TODO: ATTACK HEREa
        }
    }

    public jump(): void {
        if (this.body.y >= this.scene.sys.canvas.height - 150 &&
            this.body.velocity.y === 0) {
            this.body.setVelocityY(-350);
            this.isJumping = true;
        }
    }

    public runLeft(): void {
        this.flipX = true;
        if (!this.anim[1].isPlaying() && !this.isJumping) {
            this.anim[0].stop();
            this.anim[1].restart();
        }
    }

    public runRight(): void {
        this.flipX = false;
        if (!this.anim[0].isPlaying() && !this.isJumping) {
            this.anim[1].stop();
            this.anim[0].restart();
        }
    }

    public moveLeft(): void {
        this.x -= 2;
    }

    public moveRight(): void {
        this.x += 2;
    }

    public stopRun(): void {
        if (this.anim[0].isPlaying())
            this.anim[0].stop();
        if (this.anim[1].isPlaying())
            this.anim[1].stop();
    }
}
