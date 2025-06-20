/*

import { Question } from '../models/question.model';

export function generateQuestions(count: number = 10): Question[] {
  const randomSeed = Math.floor(Math.random() * 1000000);
  Question.resetSeed(randomSeed);

  return Array.from({ length: count }, () => new Question(
        false,  // addition
        true,  // rewrite
        false,  // crypted
        false,  // subtraction
        false,  // multiplication
        false //division
    ));
}

// You can then use this instead of MOCK_QUESTIONS
export const MOCK_QUESTIONS = generateQuestions();


*/
