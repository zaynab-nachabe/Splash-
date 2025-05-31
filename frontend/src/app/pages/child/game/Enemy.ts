import { GameEngine } from "./game-engine";

export class Enemy {
     
    protected x: number;
    protected y: number;
    protected width: number;
    protected height: number; 
    protected alive: boolean;
    protected speed: number;
    protected score: number;
    protected isDying: boolean = false;
    protected deathAnimationFrame: number = 0;
    protected deathAnimationFrames: HTMLImageElement[] = []; // Number of frames
    protected deathAnimationTimer: number = 0;
    protected deathAnimationImage: HTMLImageElement;
    protected deathAnimationFrameCount: number = 7;


    constructor(private gameEngine: GameEngine, private canvas: HTMLCanvasElement, x?: number, y?: number) {
        this.gameEngine = gameEngine;

        this.x = x || this.canvas.width * Math.random();
        this.y = y || 300;
        this.width = 100,
        this.height = 100
        this.alive = true;
        this.speed = 0.5; 
        this.score = 10;
        this.deathAnimationImage = new Image();
        for (let i = 0; i < this.deathAnimationFrameCount; i++) {
            const img = new Image();
            img.src = '../../../../../assets/animations/64x64/bubble_' + i + '.png';
            this.deathAnimationFrames.push(img);
        }
    }   

    public get position(): {x:number, y:number} {
        return {x: this.x, y: this.y};
    }
    public get isAlive(): boolean {
        return this.alive;
    }
    public get scoreValue(): number {
        return this.score;
    }

    public destroy(): void {
        this.isDying = true;
        this.deathAnimationFrame = 0;
        this.deathAnimationTimer = 0;
        this.alive = false;
    }
    
    public update(): void {
        if (this.isDying) {
            this.deathAnimationTimer++;
            if (this.deathAnimationTimer % 5 === 0) {
                this.deathAnimationFrame++;
                if (this.deathAnimationFrame >= this.deathAnimationFrames.length) {
                    this.alive = false;
                }
            }
            return;
        }
        const dx = this.gameEngine.player.position.x - this.x;
        const dy = this.gameEngine.player.position.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
            const moveX = (dx / distance) * this.speed;
            const moveY = (dy / distance) * this.speed;
            this.x += moveX;
            this.y += moveY;
        }
        if (distance < 100) {
            this.alive = false;
        }
    }
}

