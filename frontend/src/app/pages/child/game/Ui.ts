import { GameEngine } from "./game-engine";
import { FontService} from "../../../shared/services/font.service"
import {Injectable, OnInit} from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class Ui implements OnInit{
    
    private fontSize: number;
    private fontFamily: string;
    private fontColor: string;

    constructor(private gameEngine: GameEngine, private canvas: HTMLCanvasElement , private fontService: FontService) {
        this.gameEngine = gameEngine;
        
        this.fontSize = 50;
        this.fontFamily = 'Arial';
        this.fontColor = '#000000';
    }

    
    ngOnInit(){
        console.log('ui intialized a subscribing to configService');
        this.fontService.selectedFont$.subscribe((font) => {
            console.log('Font received in Ui: ', font);
            this.fontFamily = font;
            this.redraw();
        });
    }

    private redraw(): void{
        const ctx = this.canvas.getContext('2d');
        if(ctx){
            console.log('redraw called');
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.draw(ctx);
        }else{
            console.error('canvas context is not available');
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void{
        ctx.save();
        ctx.fillStyle = this.fontColor;
        ctx.font = this.fontSize + 'px ' + this.fontFamily;
        console.log('Drawing text with font ', ctx.font);
        ctx.fillText(`Score: ${this.gameEngine.scoreValue}`, this.canvas.width/2 - 75, 350);

        ctx.restore();
    }
}