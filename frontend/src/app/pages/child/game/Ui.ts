import { GameEngine } from "./game-engine";
import { ConfigService} from "../../../shared/services/config.service"
import {Injectable, OnInit} from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class Ui implements OnInit{
    
    private fontSize: number;
    private fontFamily: string;
    private fontColor: string;

    constructor(private gameEngine: GameEngine, private canvas: HTMLCanvasElement , private configService: ConfigService) {
        this.gameEngine = gameEngine;
        this.fontSize = 50;
        this.fontFamily = 'Arial';
        this.fontColor = '#000000';
    }

    public draw(ctx: CanvasRenderingContext2D): void{
        ctx.save();
        ctx.fillStyle = this.fontColor;
        ctx.font = this.fontSize + 'px ' + this.fontFamily;

        ctx.fillText(`Score: ${this.gameEngine.scoreValue}`, this.canvas.width/2 - 75, 350);

        ctx.restore();
    }

    ngOnInit(){
        this.configService.selectedFont$.subscribe((font) => {
            this.fontFamily = font;
        });
    }
}