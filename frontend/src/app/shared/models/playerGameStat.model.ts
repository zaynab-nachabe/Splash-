export type PlayerGameStat = {
    accuracy: number; // Typing accuracy in percentage
    errors: number; // Number of typing errors
    speed: number; // Typing speed in words per minute (wpm)
  answerShown: boolean;
  wordsCommonlyMispelled: string[];
  gradePerNotion: { [key: string]: number };
}
