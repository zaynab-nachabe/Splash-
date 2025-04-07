import { GameEngine } from "./game-engine";

export class Projectile {

    private x: number;
    private y: number;
    private width: number; 
    private height: number; 
    private markedForDeletion: boolean;
    private image: HTMLImageElement;

    constructor(private gameEngine: GameEngine, private canvas: HTMLCanvasElement) {

        this.x = this.canvas.width / 2 - 25;
        this.y = this.canvas.height - 270 - 25;
        this.width = 50;
        this.height = 50;
        this.markedForDeletion = false;

        this.image = new Image();
        this.image.src = "../../../../assets/images/game/projectile/bubble.png";
    }   

    public get position(): {x:number, y:number} {
        return {x: this.x, y: this.y};
    }

    public get isMarkedForDeletion(): boolean {
        return this.markedForDeletion;
    }

    public destroy(): void {
        this.markedForDeletion = true;
    }

    public update(): void {
        const target = this.gameEngine.closestEnemy;
        if (!target) return;
    
        const dx = target.position.x - this.x;
        const dy = target.position.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const speed = 10;
    
        if (distance > 0) {
            const moveX = (dx / distance) * speed;
            const moveY = (dy / distance) * speed;
            this.x += moveX;
            this.y += moveY;
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}