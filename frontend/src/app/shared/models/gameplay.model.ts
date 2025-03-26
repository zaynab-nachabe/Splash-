export interface Gameplay {
    accuracy: number; // Typing accuracy in percentage
    errors: number; // Number of typing errors
    speed: number; // Typing speed in words per minute (wpm)
    grade: string; // Grade for math questions
    heatmap: { [key: string]: number }; 
}

export class GameplayModel implements Gameplay {
    accuracy: number;
    errors: number;
    speed: number;
    grade: string;
    heatmap: { [key: string]: number };

    constructor(
        accuracy: number = 0,
        errors: number = 0,
        speed: number = 0,
        grade: string = 'F',
        heatmap: { [key: string]: number } = {}
    ) {
        this.accuracy = accuracy;
        this.errors = errors;
        this.speed = speed;
        this.grade = grade;
        this.heatmap = heatmap;
    }

    calculatePerformance(): string {
        return `Accuracy: ${this.accuracy}%, Speed: ${this.speed} WPM, Errors: ${this.errors}`;
    }
}