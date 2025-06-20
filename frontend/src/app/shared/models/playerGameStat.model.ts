import { WordStats } from "./game-statistics.model";

export type PlayerGameStat = {
  accuracy: number;
  errors: number;
  speed: number;
  answerShown: boolean;
  wordsCommonlyMispelled: string[];
  gradePerNotion: { [key: string]: number };
  wordsLeastSuccessful?: WordStats[];
}
