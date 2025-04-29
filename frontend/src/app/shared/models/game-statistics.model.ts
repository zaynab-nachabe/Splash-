export interface WordStats {
  word: string;
  successRate: number; // percentage (0-100)
}

export interface HeatmapData {
  keyCode: string; // The keyboard key
  errorFrequency: number; // how many errors on this key (normalized 0-100)
}

export interface GameStatistics {
  id: string;
  childId: string;
  sessionName: string; // e.g., "Session 1", "Session 2", "Session 3", "TOTAL" (for average)
  date?: Date; // optional date for sessions (not needed for TOTAL)
  ranking: number; // 1st, 2nd, 3rd, etc.
  wordsPerMinute: number;
  mathNotionUnderstanding: number; // percentage (0-100)
  wordsLeastSuccessful: WordStats[]; // Array of words and their success rates
  precision: number; // percentage (0-100)
  heatmapData: HeatmapData[]; // keyboard heatmap data
  numberOfCorrections: number;
  answersShown: number;
  isTotal?: boolean; // flag to identify if this is the average/total record
}
