export type Gamestat = {
    accuracy: number; // Typing accuracy in percentage
    numberOfCorrections: number; // Number of typing errors
    speed: number; // Typing speed in words per minute (wpm)
    grade: string;
    reponsesAffichees: string[];
    motsLesMoinsReussis: string[]; // Grade for math questions
}

export class GamestatModel implements Gamestat {
    accuracy: number;
    numberOfCorrections: number;
    speed: number;
    grade: string;
    reponsesAffichees: string[];
    motsLesMoinsReussis: string[];

    constructor(
        accuracy: number = 0,
        numberOfCorrections: number = 0,
        speed: number = 0,
        grade: string = 'F',
        reponsesAffichees: string[] = [],
        motsLesMoinsReussis: string[] = []
    ) {
        this.accuracy = accuracy;
        this.numberOfCorrections = numberOfCorrections;
        this.speed = speed;
        this.grade = grade;
        this.reponsesAffichees = reponsesAffichees;
        this.motsLesMoinsReussis = motsLesMoinsReussis;
    }
}