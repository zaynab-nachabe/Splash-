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

    //constructor has private canvas: HTMLCanvasElement before
    constructor(private gameEngine: GameEngine, private fontService: FontService) {
        this.gameEngine = gameEngine;
        
        this.fontSize = 70;
        this.fontFamily = 'Arial';
        this.fontColor = '#000000';
    }

    private canvas!: HTMLCanvasElement;

    public setCanvas(canvas: HTMLCanvasElement): void{
        this.canvas = canvas;
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
        ctx.fillText(`Score: ${this.gameEngine.score}`, this.canvas.width-350, this.canvas.height-70);

        ctx.restore();
    }
}