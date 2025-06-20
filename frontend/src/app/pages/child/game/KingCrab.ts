import { Enemy } from "./Enemy";
import { GameEngine } from "./game-engine";

export class KingCrab extends Enemy {
     
    private image: HTMLImageElement;

    constructor(gameEngine: GameEngine,  canvas: HTMLCanvasElement) {
        super(gameEngine, canvas);

        this.image = new Image();
        this.image.src = "../../../../assets/images/game/enemy/king_crab.png";
        this.speed *= 0.4;
        this.score *= 2;
        
        this.image.onerror = () => {
            console.error('Failed to load king crab image:', this.image.src);
        };
        this.image.onload = () => {
            console.log('King crab image loaded successfully');
        };
    }   

    public draw(ctx: CanvasRenderingContext2D): void {
        const scaledWidth = this.width * 2.5;
        const scaledHeight = this.height * 2.5;
        ctx.drawImage(this.image, this.x - scaledWidth / 2, this.y - scaledHeight / 2, scaledWidth, scaledHeight);
        if (this.isDying) {
            const frame = this.deathAnimationFrames[this.deathAnimationFrame];
            if (frame && frame.complete) {
                ctx.drawImage(frame, this.x, this.y, this.width, this.height);
            }
            return;
        }
    }
}