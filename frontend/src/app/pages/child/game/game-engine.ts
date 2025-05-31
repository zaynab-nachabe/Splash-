import { Enemy } from "./Enemy";
import { Crab } from "./Crab";

import { GameComponent } from "./game.component";
import { Player } from "./Player";
import { HiveCrab } from "./HiveCrab";
import { Drone } from "./Drone";
import { Ui } from "./Ui";
import {FontService} from "../../../shared/services/font.service"
import { ChildConfigService } from '../../../shared/services/child-config.service';

export class GameEngine {
    private ctx: CanvasRenderingContext2D;
    private Ui: Ui;
    public enemies: Enemy[];
    public enemyKilledAudio: HTMLAudioElement;
    //statistics 
    public player : Player;
    public score: number = 0;
    private correctAnswers: number = 0;
    private incorrectAnswers: number = 0;
    private startTime: Date = new Date();
    private totalQuestions: number = 0;
    private wordsTyped: string[] = [];
    private errorsByKey: Map<string, number> = new Map();
    private difficultWords: Map<string, {attempts: number, successes: number}> = new Map();
    private answersShown: number = 0;

    constructor(
        private gameComponent: GameComponent, 
        private canvas: HTMLCanvasElement, 
        private fontService: FontService,
        private childConfigService: ChildConfigService
    ) {
        this.ctx = canvas.getContext('2d')!;
        this.adjustCanvaResolution();
        this.player = new Player(this, canvas);
        this.enemies = [new Crab(this, canvas)];
        this.Ui = new Ui(this, this.fontService);
        this.Ui.setCanvas(canvas);
        this.Ui.ngOnInit();
        this.score = 0;
        this.startGameLoop();
        this.enemyKilledAudio = new Audio('../../../../../assets/audio/killSound.mp3');

        this.childConfigService.effectsEnabled$.subscribe((enabled: boolean) => {
            this.enemyKilledAudio.muted = !enabled;
        });
    }

    private checkCollision(obj1: any, obj2: any): boolean {
        if (!obj1 || !obj2) return false;
        if (!obj1.position || !obj2.position) return false;

        const dx = obj1.position.x - obj2.position.x;
        const dy = obj1.position.y - obj2.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < obj1.width / 2 + obj2.width / 2;
    }

    private kill(enemy: Enemy): void {
        if(enemy instanceof HiveCrab){
            this.enemies.push(new Drone(this,this.canvas, enemy.position.x, enemy.position.y), new Drone(this,this.canvas, enemy.position.x+40, enemy.position.y-40), new Drone(this,this.canvas, enemy.position.x-50, enemy.position.y));
        }
        if (this.childConfigService.getEffectsEnabled()) {
            this.enemyKilledAudio.currentTime = 0;
            this.enemyKilledAudio.play();
        }
        enemy.destroy();
    }

    private addEnemy(): void {
        let newEnemy = Math.random() > 0.3 ? new Crab(this,this.canvas) : new HiveCrab(this, this.canvas);
        this.enemies.push(newEnemy);
    }

    public findClosestEnemy(fromX: number, fromY: number): Enemy | null {
        let closestEnemy: Enemy | null = null;
        let minDistance = Infinity;

        this.enemies.forEach(enemy => {
            const dx = fromX - enemy.position.x;
            const dy = fromY - enemy.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestEnemy = enemy;
            }
        });
    
        return closestEnemy;
    }

    private update(): void {
        this.player.update();
        let minDistance = Infinity;

        this.enemies.forEach(enemy =>{
            enemy.update();
            this.player.projectiles.forEach(projectile => {
                if(this.checkCollision(enemy, projectile)) {
                    this.kill(enemy);
                    projectile.destroy();
                    this.score += enemy.scoreValue;
                }
            });
        });
        this.enemies = this.enemies.filter(enemy => enemy.isAlive);
        if (this.enemies.length < 1) {
            this.addEnemy();
        }
    }

    private draw(ctx: CanvasRenderingContext2D): void {
        this.Ui.draw(ctx);
        this.player.draw(ctx);
        this.enemies.forEach(enemy=>{
            if (enemy instanceof Crab) {
                enemy.draw(ctx);
            } else if (enemy instanceof HiveCrab) {
                enemy.draw(ctx);
            } else if (enemy instanceof Drone) {
                enemy.draw(ctx);
            }
        });
    }

    private adjustCanvaResolution(): void {
        const scale = window.devicePixelRatio;
        this.canvas.width = this.canvas.clientWidth * scale;
        this.canvas.height = this.canvas.clientHeight * scale;
    }

    private startGameLoop(): void {
        const loop = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.update();
            this.draw(this.ctx);
        };
        setInterval(loop, 10);
    }

    public answerCorrectly(): void {
        this.correctAnswers++;
        this.totalQuestions++;
        let closestEnemy: Enemy | null = null;
        let minDistance = Infinity;

        this.enemies.forEach(enemy => {
            const dx = this.player.position.x - enemy.position.x;
            const dy = this.player.position.y - enemy.position.y;

            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
                minDistance = distance;
                closestEnemy = enemy;
            }
        });
        
        if(closestEnemy){
            this.player.shoot();
        }
        
        // Record the successfully answered word
        if (this.gameComponent.question) {
            const answer = this.gameComponent.question.answer;
            this.wordsTyped.push(answer);
            
            // Track word success rate
            if (!this.difficultWords.has(answer)) {
                this.difficultWords.set(answer, {attempts: 1, successes: 1});
            } else {
                const stats = this.difficultWords.get(answer)!;
                stats.attempts++;
                stats.successes++;
                this.difficultWords.set(answer, stats);
            }
        }
    }

    public answerIncorrectly(proposedAnswer: string): void {
        this.incorrectAnswers++;
        this.totalQuestions++;
        
        
        if (this.gameComponent.question) {
            const correctAnswer = this.gameComponent.question.answer;
            if (!this.difficultWords.has(correctAnswer)) {
                this.difficultWords.set(correctAnswer, {attempts: 1, successes: 0});
            } else {
                const stats = this.difficultWords.get(correctAnswer)!;
                stats.attempts++;
                this.difficultWords.set(correctAnswer, stats);
            }
        }
        
        // Track key errors (simplified)
        // This would be more complex in a real implementation
        for (let i = 0; i < proposedAnswer.length; i++) {
            const key = `Key${proposedAnswer[i].toUpperCase()}`;
            this.errorsByKey.set(key, (this.errorsByKey.get(key) || 0) + 1);
        }
    }


    public showAnswer(): void {
        this.answersShown++;
    }
    
    public getGameStatistics(userId: string): any {
        const endTime = new Date();
        const gameTimeMinutes = (endTime.getTime() - this.startTime.getTime()) / 60000;
        
        // Calculate statistics
        const wordsPerMinute = Math.round(this.wordsTyped.length / gameTimeMinutes) || 0;
        const precision = this.totalQuestions > 0 
            ? Math.round((this.correctAnswers / this.totalQuestions) * 100) 
            : 0;
        
        // Format difficult words
        const wordsLeastSuccessful = Array.from(this.difficultWords.entries())
            .map(([word, stats]) => ({
                word,
                successRate: Math.round((stats.successes / stats.attempts) * 100)
            }))
            .sort((a, b) => a.successRate - b.successRate)
            .slice(0, 5);
            
        // Format heatmap data
        const heatmapData = Array.from(this.errorsByKey.entries())
            .map(([keyCode, errorFrequency]) => ({ keyCode, errorFrequency }));
            
        return {
            childId: userId,
            sessionName: `Session ${new Date().toLocaleString()}`,
            date: new Date(),
            score: this.score,
            ranking: 0,
            wordsPerMinute,
            mathNotionUnderstanding: Math.round(precision * 0.8), // Simplified estimation
            wordsLeastSuccessful,
            precision,
            heatmapData,
            numberOfCorrections: this.incorrectAnswers,
            answersShown: this.answersShown
        };
    }
}
