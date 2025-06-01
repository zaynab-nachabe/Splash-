export type UserConfig = {
    showAnswer: boolean,
    addition: boolean,
    subtraction: boolean,
    multiplication: boolean,
    division: boolean,
    rewrite: boolean,
    encryption: boolean,
    word: boolean,
    showScore: boolean,
    nombresDeQuestion: number,
    questionFrequency?: { [key: string]: number }
};
