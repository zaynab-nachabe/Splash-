const FrenchNumberConverter = require('./FrenchNumberConverter.js');
const { QuestionNotion } = require('./QuestionNotionEnum.js');
const QuestionAndAnswer = require('./QuestionAndAnswer.model.js');
const { validateUser } = require('../models/user.model.js');
const { FrenchWordDictionary, words } = require('./FrenchWordDictionary.js');
const frenchWordDict = new FrenchWordDictionary(words);

class QuestionGenerator {
    constructor(seed) {
        this.seed = (seed !== undefined ? seed : Date.now()) % 100000;
        if (isNaN(this.seed)) {
            console.error('Seed is NaN, resetting to 1');
            this.seed = 1;
        }
    }

    // Seeded random number generator
    seededRandom() {
        const x = Math.sin(this.seed += 1) * 10000;
        const result = x - Math.floor(x);
        if (isNaN(result)) {
            console.error('seededRandom produced NaN, seed:', this.seed);
            return Math.random(); // fallback to Math.random
        }
        return result;
    }

    chooseType(typeSet) {
        const types = Array.from(typeSet);
        return types[Math.floor(this.seededRandom() * types.length)];
    }

    static convertToOperand(type) {
        const operands = {
            addition: ['+', QuestionNotion.ADDITION],
            subtraction: ['-', QuestionNotion.SUBTRACTION],
            multiplication: ['×', QuestionNotion.MULTIPLICATION],
            division: ['/', QuestionNotion.DIVISION],
        };
        return operands[type] || ['NA', QuestionNotion.REWRITE];
    }

    chooseTupleOfInputs(nbNumbers = 2, minValue = 1, maxValue = 10, notion) {
        if (notion === QuestionNotion.DIVISION) {
            const quotient = Math.floor(this.seededRandom() * (maxValue - minValue + 1)) + minValue;
            const divisor = Math.floor(this.seededRandom() * (maxValue - minValue + 1)) + minValue + 1;
            const dividend = quotient * divisor;
            if (divisor === 0) {
                console.error('Division by zero detected, fixing divisor to 1');
                return [dividend, 1];
            }
            return [dividend, divisor];
        }

        return Array.from({ length: nbNumbers }, () => Math.floor(this.seededRandom() * (maxValue - minValue + 1)) + minValue);
    }

    static stringifyQuestion(valuePair, operand) {
        return `${valuePair[0]} ${operand} ${valuePair[1]} = `;
    }

    static getAnswer(valuePair, operand) {
        switch (operand) {
            case '+':
                return valuePair[0] + valuePair[1];
            case '-':
                return valuePair[0] - valuePair[1];
            case '×':
                return valuePair[0] * valuePair[1];
            case '/':
                if (valuePair[1] === 0) {
                    console.error('Attempted division by zero in getAnswer', valuePair);
                    return 0;
                }
                return valuePair[0] / valuePair[1];
            default:
                return valuePair[0];
        }
    }

    generateRandomString(length) {
        const characters = '!@#$%&*()';
        return Array.from({ length }, () => characters.charAt(Math.floor(this.seededRandom() * characters.length))).join('');
    }

    generateQnA(userConfig) {
        try {
            // Validate the user input
            // const validatedUser = validateUser(user);
            console.log('generateQnA called with userConfig:', userConfig);

            // const { userConfig } = validatedUser;
            const allowedTypes = [];
            if (userConfig.addition) allowedTypes.push('addition');
            if (userConfig.subtraction) allowedTypes.push('subtraction');
            if (userConfig.multiplication) allowedTypes.push('multiplication');
            if (userConfig.division) allowedTypes.push('division');
            if (userConfig.rewrite) allowedTypes.push('rewrite');
            if (userConfig.encryption) allowedTypes.push('crypted');
            if (userConfig.word) allowedTypes.push('word');

            console.log('Allowed types:', allowedTypes);

            if (allowedTypes.length === 0) {
                throw new Error('No question types are enabled in the configuration');
            }


            // --- Weighted random selection based on questionFrequency ---
            let weights = [];
            let totalSpecified = 0;
            let unspecifiedTypes = [];

            if (userConfig.questionFrequency) {
                for (const type of allowedTypes) {
                    const freq = userConfig.questionFrequency[type];
                    if (freq !== undefined && freq > 0) {
                        weights.push(freq);
                        totalSpecified += freq;
                    } else {
                        weights.push(null); // treat 0 or undefined as unspecified
                        unspecifiedTypes.push(type);
                    }
                }
            } else {
                // No frequencies specified, all equal
                weights = Array(allowedTypes.length).fill(null);
                unspecifiedTypes = allowedTypes.slice();
            }

            // Assign remaining probability equally to unspecified types
            const remaining = 1 - totalSpecified;
            const perUnspecified = unspecifiedTypes.length > 0 ? remaining / unspecifiedTypes.length : 0;
            weights = weights.map(w => w === null ? perUnspecified : w);

            // Normalize weights (in case of rounding errors)
            const sumWeights = weights.reduce((a, b) => a + b, 0);
            if (sumWeights > 0) {
                weights = weights.map(w => w / sumWeights);
            } else {
                // fallback: all equal
                console.log('No weights specified, using equal distribution');
                weights = Array(allowedTypes.length).fill(1 / allowedTypes.length);
            }
            console.log('Weights after processing:', weights);

            // Weighted random selection
            let r = this.seededRandom();
            let acc = 0;
            let selectedIndex = 0;
            for (let i = 0; i < weights.length; i++) {
                acc += weights[i];
                if (r < acc) {
                    selectedIndex = i;
                    break;
                }
            }

            const type = allowedTypes[selectedIndex];
            console.log('Selected type:', type, 'with weights:', weights);


            let questionString = '';
            let answerString = '';
            let notion;

            switch (type) {
                case 'rewrite': {
                    const nb = this.chooseTupleOfInputs(1, 0, 50, QuestionNotion.REWRITE)[0];
                    questionString = `Ecrire ${nb} : `;
                    answerString = FrenchNumberConverter.convertToWords(nb);
                    notion = QuestionNotion.REWRITE;
                    break;
                }

                case 'crypted': {
                    const length = Math.floor(this.seededRandom() * 4) + 1;
                    const crypt = this.generateRandomString(length);
                    questionString = `Recopies ${crypt} : `;
                    answerString = crypt;
                    notion = QuestionNotion.ENCRYPTION;
                    break;
                }

                case 'word': {
                    // Pick a random word from the dictionary
                    const allWords = words; // or: Object.values(frenchWordDict.letterToWords).flat()
                    const randomIndex = Math.floor(this.seededRandom() * allWords.length);
                    const word = allWords[randomIndex];
                    questionString = `Recopies ${word} : `;
                    answerString = word;
                    notion = QuestionNotion.REWRITE; // or create a new notion if you want
                    break;
                }


                default: {
                    const [op, questionNotion] = QuestionGenerator.convertToOperand(type);
                    const pairOfValues = this.chooseTupleOfInputs(2, 1, 10, questionNotion);
                    console.log('pairOfValues:', pairOfValues, 'op:', op, 'notion:', questionNotion);
                    const answer = QuestionGenerator.getAnswer(pairOfValues, op);
                    console.log('Raw answer:', answer);
                    if (!isFinite(answer)) {
                        console.error('Generated answer is not finite:', answer, 'pairOfValues:', pairOfValues, 'op:', op);
                        throw new Error('Generated answer is not a finite number');
                    }
                    questionString = `Calcules ${QuestionGenerator.stringifyQuestion(pairOfValues, op)}`;
                    answerString = FrenchNumberConverter.convertToWords(answer);
                    notion = questionNotion;
                }
            }
            console.log('Generated QnA:', { questionString, answerString, notion });

            return new QuestionAndAnswer(questionString, answerString, notion);
        }
        catch (err) {
            console.error('Error in generateQnA:', err);
            throw err;
        }
    }
}

module.exports = QuestionGenerator;
