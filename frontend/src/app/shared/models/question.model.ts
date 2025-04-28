import {FrenchNumberConverter} from "./QuestionGenerationUtils/FrenchNumberConverter";
import {QuestionNotion} from "./QuestionGenerationUtils/QuestionNotionEnum";
import {QuestionAndAnswer} from "./QuestionGenerationUtils/QuestionAndAnswer.model";
import { Injectable } from '@angular/core';
import { QuestionConfigService } from '../services/question-config.service';


@Injectable({
  providedIn: 'root'
})

export class Question {
  question: string;
  answer: string;
  notion: QuestionNotion;
  private static seed = 1;

  constructor(private questionConfigService: QuestionConfigService) {
    const config = this.questionConfigService.getCurrentConfig();
    const result = this.generateQnA(
      config.addition,
      config.rewrite,
      config.crypted,
      config.subtraction,
      config.multiplication,
      config.division
    );


    this.question = result.question;
    this.answer = result.answer;
    this.notion = result.notion;
  }

  // Seeded random number generator
  private seededRandom(): number {
    const x = Math.sin(Question.seed++) * 10000;
    return x - Math.floor(x);
  }

  chooseType(typeSet: Set<string>): string {
    const types = Array.from(typeSet);
    return types[Math.floor(this.seededRandom() * types.length)];
  }

  convertToOperand(type: string): [string, QuestionNotion] {
    const operands: { [key: string]: [string, QuestionNotion] } = {
      addition: ["+", QuestionNotion.ADDITION],
      subtraction: ["-", QuestionNotion.SUBSTRACTION],
      multiplication: ["×", QuestionNotion.MULTIPLICATION],
      division: ["/", QuestionNotion.DIVISION],
    };
    return operands[type] || ["NA", QuestionNotion.REWRITING];
  }

  chooseTupleOfInputs(nbNumbers = 2, minValue = 1, maxValue = 10,  notion: QuestionNotion): number[] {
    if (notion == QuestionNotion.DIVISION) {
      // For division, first generate the quotient (result we want)
      const quotient = Math.floor(this.seededRandom() * (maxValue - minValue + 1)) + minValue;
      // Then generate the divisor
      const divisor = Math.floor(this.seededRandom() * (maxValue - minValue + 1)) + minValue;
      // Calculate dividend
      const dividend = quotient * divisor;
      return [dividend, divisor];
    }

    return Array.from({ length: nbNumbers }, () =>
      Math.floor(this.seededRandom() * (maxValue - minValue + 1)) + minValue
    );

  }

  stringifyQuestion(valuePair: number[], operand: string): string {
    return `${valuePair[0]} ${operand} ${valuePair[1]} =\xa0`;
  }

  getAnswer(valuePair: number[], operand: string): number {
    switch (operand) {
      case "+":
        return valuePair[0] + valuePair[1];
      case "-":
        return valuePair[0] - valuePair[1];
      case "×":
        return valuePair[0] * valuePair[1];
      case "/":
        const dividend = valuePair[0] / valuePair[1];
        return dividend;
      default:
        return valuePair[0];
    }
  }

  generateRandomString(length: number): string {
    const characters = "!@#$%&*()";
    return Array.from({ length }, () =>
      characters.charAt(Math.floor(this.seededRandom() * characters.length))
    ).join("");
  }

  generateQnA(
    addition : boolean,
    rewrite: boolean,
    crypted: boolean,
    subtraction: boolean,
    multiplication: boolean,
    division: boolean
  ): QuestionAndAnswer {
    let questionString = "";
    let answerString = "";
    let notion: QuestionNotion;



    do {
      const allowedTypes: string[] = [];
      if (addition) allowedTypes.push("addition");
      if (subtraction) allowedTypes.push("subtraction");
      if (multiplication) allowedTypes.push("multiplication");
      if (division) allowedTypes.push("division");
      if (rewrite) allowedTypes.push("rewrite");
      if (crypted) allowedTypes.push("crypted");
      if (allowedTypes.length === 0) {
        throw new Error("No question types are enabled in the configuration");
      }

      const type = allowedTypes[Math.floor(this.seededRandom() * allowedTypes.length)];

      switch (type) {
        case "rewrite":
          const nb = this.chooseTupleOfInputs(1, 0, 50, QuestionNotion.REWRITING)[0];
          questionString = `${nb} :\xa0`;
          answerString = FrenchNumberConverter.convertToWords(nb);
          notion = QuestionNotion.REWRITING;
          break;

        case "crypted":
          const length = Math.floor(this.seededRandom() * 4) + 1;

          const crypt = this.generateRandomString(length);
          questionString = "";
          answerString = crypt;
          notion = QuestionNotion.ENCRYPTION;
          break;

        default:
          const [op, questionNotion] = this.convertToOperand(type);
          const pairOfValues = this.chooseTupleOfInputs(2, 1, 10, questionNotion);
          const answer = this.getAnswer(pairOfValues, op);
          questionString = this.stringifyQuestion(pairOfValues, op);
          answerString = FrenchNumberConverter.convertToWords(answer);
          notion = questionNotion;
      }
    } while (answerString.length > 20);


    return {
      question: questionString,
      answer: answerString,
      notion: notion
    };

  }

  // Static method to reset the seed
  static resetSeed(seed: number = 1) {
    Question.seed = seed;
  }
}
