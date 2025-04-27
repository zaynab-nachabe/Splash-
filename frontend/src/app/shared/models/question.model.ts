export enum QuestionNotion {
    MULTIPLICATION = 'MULTIPLICATION',
    ENCRYPTION = 'ENCRYPTION',
    ADDITION = 'ADDITION',
    SUBSTRACTION = 'SUBSTRACTION',
    DIVISION = 'DIVISION',
    REWRITING = 'REWRITING'
}

export class Question {
    question: string;
    answer: string;
    notion: QuestionNotion;
    private static seed = 1;

    constructor(
        public addition = true,
        public rewrite = true,
        public crypted = false,
        public subtraction = false,
        public multiplication = false,
        public division = false,
        public equations = false
    ) {
        const result = this.generateQnA(
            addition,
            rewrite,
            crypted,
            subtraction,
            multiplication,
            division,
            equations
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

    chooseTupleOfInputs(nbNumbers = 2, minValue = 1, maxValue = 10): number[] {
      if (this.division) {
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
        addition = true,
        rewrite = true,
        crypted = false,
        subtraction = false,
        multiplication = false,
        division = false,
        equations = false
    ): { question: string; answer: string; notion: QuestionNotion } {
        const typeSet = new Set(
            Object.entries({
                addition,
                rewrite,
                crypted,
                subtraction,
                multiplication,
                division,
                equations,
            })
                .filter(([, value]) => value)
                .map(([key]) => key)
        );

        const type = this.chooseType(typeSet);
        let questionString = "";
        let answerString = "";
        let notion = QuestionNotion.REWRITING;

        if (type === "rewrite") {
            const nb = this.chooseTupleOfInputs(1, 0, 50)[0];
            questionString = `${nb} :\xa0`;
            answerString = FrenchNumberConverter.convertToWords(nb);
            notion = QuestionNotion.REWRITING;
        } else if (type === "crypted") {
            const length = Math.floor(this.seededRandom() * 4) + 1;

          const crypt = this.generateRandomString(length);
            questionString = "";
            answerString = crypt;
            notion = QuestionNotion.ENCRYPTION;
        } else {
            const [op, questionNotion] = this.convertToOperand(type);
            const pairOfValues = this.chooseTupleOfInputs();
            const answer = this.getAnswer(pairOfValues, op);
            questionString = this.stringifyQuestion(pairOfValues, op);
            answerString = FrenchNumberConverter.convertToWords(answer);
            notion = questionNotion;
        }

        return { question: questionString, answer: answerString, notion };
    }

    // Static method to reset the seed
    static resetSeed(seed: number = 1) {
        Question.seed = seed;
    }
}

export class FrenchNumberConverter {
    private static readonly units: { [key: number]: string } = {
        0: 'zéro', 1: 'un', 2: 'deux', 3: 'trois', 4: 'quatre',
        5: 'cinq', 6: 'six', 7: 'sept', 8: 'huit', 9: 'neuf',
        10: 'dix', 11: 'onze', 12: 'douze', 13: 'treize', 14: 'quatorze',
        15: 'quinze', 16: 'seize'
    };

    private static readonly tens: { [key: number]: string } = {
        20: 'vingt', 30: 'trente', 40: 'quarante',
        50: 'cinquante', 60: 'soixante', 70: 'soixante',
        80: 'quatre-vingt', 90: 'quatre-vingt'
    };

    static convertToWords(num: number): string {
        // Handle negative numbers
        if (num < 0) {
            return 'moins ' + this.convertToWords(Math.abs(num));
        }

        // Handle zero
        if (num === 0) {
            return 'zéro';
        }

        // Handle direct conversions (1-16)
        if (num in this.units) {
            return this.units[num];
        }

        // Handle numbers 17-99
        if (num < 100) {
            const tens = Math.floor(num / 10) * 10;
            const ones = num % 10;

            // Special cases for 70s and 90s
            if (tens === 70 || tens === 90) {
                const baseNum = tens === 70 ? 60 : 80;
                const remainder = num - baseNum;

                if (remainder === 1 && tens === 70) {
                    return 'soixante et onze';
                }

                return `${this.tens[baseNum]}-${this.units[remainder]}`;
            }

            // Regular cases
            if (ones === 0) {
                return this.tens[tens];
            } else if (ones === 1 && tens !== 80) {
                return `${this.tens[tens]}-et-un`;
            } else {
                return `${this.tens[tens]}-${this.units[ones]}`;
            }
        }

        // Handle numbers 100-999
        if (num < 1000) {
            const hundreds = Math.floor(num / 100);
            const remainder = num % 100;

            let result = hundreds === 1 ? 'cent' : `${this.units[hundreds]}-cent`;

            if (remainder === 0) {
                if (hundreds > 1) {
                    result += 's';
                }
                return result;
            }

            return `${result}-${this.convertToWords(remainder)}`;
        }

        // Handle numbers 1000+
        if (num < 2000) {
            const remainder = num % 1000;
            if (remainder === 0) {
                return 'mille';
            }
            return `mille-${this.convertToWords(remainder)}`;
        }

        // For numbers >= 2000, we'll return the number itself
        // You might want to add more cases if needed
        return num.toString();
    }
}
