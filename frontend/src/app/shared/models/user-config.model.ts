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
    chiffresEnLettres: boolean,
    longueurMaximaleDesMots: number,
    nombresDeQuestion: number,
    showLetterColor?: boolean,
    questionFrequency?: { [key: string]: number },
    letterFrequency?: { [key: string]: number }
};
