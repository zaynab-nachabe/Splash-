import { GameEngine } from "./game-engine";
import { Projectile } from "./Projectile";

export class Player {

    private x: number;
    private y: number;
    private width: number; 
    private height: number; 

    private _projectiles: Projectile[] = [];

    private image: HTMLImageElement;

    public isDeadFishActive: boolean = false;
    //public currentImagePath: string = "../../../../assets/images/game/player/yellow_fish.png";
    public currentImagePath: string = "assets/images/game/player/yellow_fish.png";

    public currentLives: number = 5;
    public isInvulnerable: boolean = false;
    private invulnerabilityDuration: number = 2000;

    constructor(private gameEngine: GameEngine, private canvas: HTMLCanvasElement) {
        this.gameEngine = gameEngine;

        this.x = this.canvas.width / 2 - 50;
        this.y = this.canvas.height - 200 - 50;
        this.width = 200,
        this.height = 200
        this._projectiles = [];

        this.image = new Image();
        this.image.src = this.currentImagePath;
    }   
    
    public get position(): {x:number, y:number} {
        return {x: this.x, y: this.y};
    }  

    public get projectiles(): Projectile[] {
        return this._projectiles;
    }

    public shoot(): void {
        this.projectiles.push(new Projectile(this.gameEngine, this.canvas));
    }   

    public update(): void {
        this.projectiles.forEach(projectile => {
            projectile.update();
        });
        this._projectiles = this.projectiles.filter(projectile => !projectile.isMarkedForDeletion);
    }    

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        this.projectiles.forEach(projectile => {
            projectile.draw(ctx);
        });
    }

    public setImage(imagePath: string) {
        this.currentImagePath = imagePath;
        this.image.src = imagePath;
    }

    public takeDamage(): void {
        if (!this.isInvulnerable && !this.isDeadFishActive) {
            this.currentLives--;
            this.isInvulnerable = true;
            
            // Start invulnerability period
            setTimeout(() => {
                this.isInvulnerable = false;
            }, this.invulnerabilityDuration);

            // Notify game engine of life loss
            if (this.gameEngine) {
                this.gameEngine.onLivesChanged(this.currentLives);
            }
        }
    }

    public resetLives(): void {
        this.currentLives = 5;
        if (this.gameEngine) {
            this.gameEngine.onLivesChanged(this.currentLives);
        }
    }
}