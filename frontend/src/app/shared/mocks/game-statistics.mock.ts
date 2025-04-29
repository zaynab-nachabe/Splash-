// src/app/shared/mocks/game-statistics.mock.ts

import { GameStatistics, HeatmapData, WordStats } from '../models/game-statistics.model';

// Common heatmap data for keyboard keys
const generateHeatmapData = (intensity: number = 1): HeatmapData[] => {
  const baseHeatmap: HeatmapData[] = [
    { keyCode: 'KeyA', errorFrequency: 15 * intensity },
    { keyCode: 'KeyS', errorFrequency: 22 * intensity },
    { keyCode: 'KeyD', errorFrequency: 8 * intensity },
    { keyCode: 'KeyF', errorFrequency: 12 * intensity },
    { keyCode: 'KeyG', errorFrequency: 35 * intensity },
    { keyCode: 'KeyH', errorFrequency: 18 * intensity },
    { keyCode: 'KeyJ', errorFrequency: 25 * intensity },
    { keyCode: 'KeyK', errorFrequency: 30 * intensity },
    { keyCode: 'KeyL', errorFrequency: 10 * intensity },
    { keyCode: 'KeyQ', errorFrequency: 28 * intensity },
    { keyCode: 'KeyW', errorFrequency: 15 * intensity },
    { keyCode: 'KeyE', errorFrequency: 5 * intensity },
    { keyCode: 'KeyR', errorFrequency: 20 * intensity },
    { keyCode: 'KeyT', errorFrequency: 12 * intensity },
    { keyCode: 'KeyY', errorFrequency: 32 * intensity },
  ];

  // Normalize to ensure values stay in range 0-100
  return baseHeatmap.map(key => {
    return {
      ...key,
      errorFrequency: Math.min(100, Math.max(0, key.errorFrequency))
    };
  });
};

// Common difficult words for math exercises
const generateDifficultWords = (intensity: number = 1): WordStats[] => {
  const baseWords: WordStats[] = [
    { word: 'multiplication', successRate: 65 - (10 * intensity) },
    { word: 'division', successRate: 70 - (8 * intensity) },
    { word: 'équation', successRate: 55 - (12 * intensity) },
    { word: 'fraction', successRate: 60 - (9 * intensity) },
    { word: 'pourcentage', successRate: 50 - (15 * intensity) }
  ];

  // Normalize success rates to be between 0-100
  return baseWords.map(word => {
    return {
      ...word,
      successRate: Math.min(100, Math.max(0, word.successRate))
    };
  });
};

// Generate statistics for a single child
const generateChildStatistics = (childId: string, childName: string): GameStatistics[] => {
  // Create 3 session statistics
  const sessions: GameStatistics[] = [
    {
      id: `game-${childId}-1`,
      childId: childId,
      sessionName: 'Session 1',
      date: new Date(2024, 3, 15), // April 15, 2024
      ranking: 3,
      wordsPerMinute: 22,
      mathNotionUnderstanding: 68,
      wordsLeastSuccessful: generateDifficultWords(1.2),
      precision: 75,
      heatmapData: generateHeatmapData(0.8),
      numberOfCorrections: 12,
      answersShown: 5
    },
    {
      id: `game-${childId}-2`,
      childId: childId,
      sessionName: 'Session 2',
      date: new Date(2024, 3, 22), // April 22, 2024
      ranking: 2,
      wordsPerMinute: 25,
      mathNotionUnderstanding: 72,
      wordsLeastSuccessful: generateDifficultWords(1.0),
      precision: 80,
      heatmapData: generateHeatmapData(0.7),
      numberOfCorrections: 10,
      answersShown: 4
    },
    {
      id: `game-${childId}-3`,
      childId: childId,
      sessionName: 'Session 3',
      date: new Date(2024, 3, 29), // April 29, 2024
      ranking: 1,
      wordsPerMinute: 28,
      mathNotionUnderstanding: 78,
      wordsLeastSuccessful: generateDifficultWords(0.8),
      precision: 85,
      heatmapData: generateHeatmapData(0.6),
      numberOfCorrections: 8,
      answersShown: 3
    }
  ];

  // Calculate averages for the total/average record
  const totalRecord: GameStatistics = {
    id: `game-${childId}-total`,
    childId: childId,
    sessionName: 'TOTAL',
    ranking: Math.round(sessions.reduce((acc, session) => acc + session.ranking, 0) / sessions.length),
    wordsPerMinute: Math.round(sessions.reduce((acc, session) => acc + session.wordsPerMinute, 0) / sessions.length),
    mathNotionUnderstanding: Math.round(sessions.reduce((acc, session) => acc + session.mathNotionUnderstanding, 0) / sessions.length),
    wordsLeastSuccessful: generateDifficultWords(0.9), // Average difficulty
    precision: Math.round(sessions.reduce((acc, session) => acc + session.precision, 0) / sessions.length),
    heatmapData: generateHeatmapData(0.7), // Average heatmap
    numberOfCorrections: Math.round(sessions.reduce((acc, session) => acc + session.numberOfCorrections, 0) / sessions.length),
    answersShown: Math.round(sessions.reduce((acc, session) => acc + session.answersShown, 0) / sessions.length),
    isTotal: true
  };

  // Return all 4 statistics objects (3 sessions + 1 total)
  return [...sessions, totalRecord];
};

// In game-statistics.mock.ts
export const GAME_STATISTICS_MOCK: GameStatistics[] = [
  // Eli KOPTER's statistics
  ...generateChildStatistics('1', 'Eli KOPTER'),

  // Other children
  ...generateChildStatistics('2', 'Judas BRICOT'),
  ...generateChildStatistics('3', 'Lucie FERT'),
  ...generateChildStatistics('4', 'Justin BRACAGE')
];

// Helper function to get statistics for a specific child
export const getChildStatistics = (childId: string): GameStatistics[] => {
  return GAME_STATISTICS_MOCK.filter(stat => stat.childId === childId);
};

// Helper function to get a specific session for a child
export const getChildSession = (childId: string, sessionName: string): GameStatistics | undefined => {
  return GAME_STATISTICS_MOCK.find(
    stat => stat.childId === childId && stat.sessionName === sessionName
  );
};

// Helper function to get the total/average for a child
export const getChildTotal = (childId: string): GameStatistics | undefined => {
  return GAME_STATISTICS_MOCK.find(
    stat => stat.childId === childId && stat.isTotal
  );
};
