import { Question } from '../models/question.model';

export function generateQuestions(count: number = 10): Question[] {
  const randomSeed = Math.floor(Math.random() * 1000000);
  Question.resetSeed(randomSeed);

  return Array.from({ length: count }, () => new Question(
        true,  // addition
        true,  // rewrite
        true,  // crypted
        true,  // subtraction
        true,  // multiplication
        true,  // division
        false  // equations
    ));
}

// You can then use this instead of MOCK_QUESTIONS
export const MOCK_QUESTIONS = generateQuestions();
