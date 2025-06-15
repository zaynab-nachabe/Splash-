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
                    if (userConfig.chiffresEnLettres) {
                        answerString = FrenchNumberConverter.convertToWords(nb);
                    } else {
                        answerString = nb.toString();
                    }
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
                    // 1. Get letter frequencies from userConfig.questionFrequency
                    const letterFreqs = userConfig.questionFrequency
                        ? Object.entries(userConfig.questionFrequency)
                            .filter(([k, v]) => /^[a-zA-Z]$/.test(k) && typeof v === 'number' && v > 0 && v <= 1)
                        : [];
                    console.log('Letter frequencies found in config:', letterFreqs);

                    const selectedLetters = [];
                    for (const [letter, freq] of letterFreqs) {
                        const rand = this.seededRandom();
                        const include = rand < freq;
                        console.log(`Letter "${letter}": freq=${freq}, random=${rand}, include=${include}`);
                        if (include) {
                            selectedLetters.push(letter.toLowerCase());
                        }
                    }
                    console.log('Selected letters for this word:', selectedLetters);

                    // 2. Get allowed word lengths from config (as an array of numbers)
                    let allowedLengths = [];
                    if (userConfig.longueurMaximaleDesMots) {
                        // Example: allow all lengths up to the max
                        for (let l = 1; l <= userConfig.longueurMaximaleDesMots; l++) allowedLengths.push(l);
                    }
                    // If you want to allow only a specific set, adjust here

                    console.log('Allowed word lengths:', allowedLengths);

                    // 3. Build sets for each selected letter
                    const letterSets = selectedLetters.map(l => new Set(frenchWordDict.getWordsWithLetter(l)));
                    // 4. Build sets for each allowed length
                    const lengthSets = allowedLengths.map(len => new Set(frenchWordDict.getWordsWithLength(len)));

                    // 5. Union of letter sets
                    let unionLetterSet = new Set();
                    for (const s of letterSets) for (const w of s) unionLetterSet.add(w);

                    // 6. Union of length sets
                    let unionLengthSet = new Set();
                    for (const s of lengthSets) for (const w of s) unionLengthSet.add(w);

                    console.log('Union of letter sets size:', unionLetterSet.size);
                    console.log('Union of length sets size:', unionLengthSet.size);

                    // 7. Intersection of both unions
                    let candidateWords = [];
                    if (unionLetterSet.size && unionLengthSet.size) {
                        candidateWords = Array.from([...unionLetterSet].filter(w => unionLengthSet.has(w)));
                        console.log('Intersection size:', candidateWords.length);
                    } else if (unionLetterSet.size) {
                        candidateWords = Array.from(unionLetterSet);
                        console.log('No length restriction, using union of letter sets:', candidateWords.length);
                    } else if (unionLengthSet.size) {
                        candidateWords = Array.from(unionLengthSet);
                        console.log('No letter restriction, using union of length sets:', candidateWords.length);
                    } else {
                        candidateWords = words;
                        console.log('No restriction, using all words.');
                    }

                    // Fallback: if intersection is empty, use all words
                    if (!candidateWords || candidateWords.length === 0) {
                        candidateWords = words;
                        console.log('No candidate words after intersection, using all words.');
                    }

                    // Pick a random word from candidateWords
                    const randomIndex = Math.floor(this.seededRandom() * candidateWords.length);
                    const word = candidateWords[randomIndex];
                    console.log('Final candidate words count:', candidateWords.length, 'Random index:', randomIndex, 'Chosen word:', word);

                    questionString = `Recopies ${word} : `;
                    answerString = word;
                    notion = QuestionNotion.REWRITE;
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
                    if (userConfig.chiffresEnLettres) {
                        answerString = FrenchNumberConverter.convertToWords(answer);
                    } else {
                        answerString = answer.toString();
                    } notion = questionNotion;
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
// Helper function for combinations
function getCombinations(arr, k) {
    // arr: array of sets, k: size of combination
    const results = [];
    function helper(start, combo) {
        if (combo.length === k) {
            results.push(combo);
            return;
        }
        for (let i = start; i < arr.length; i++) {
            helper(i + 1, combo.concat([arr[i]]));
        }
    }
    helper(0, []);
    return results;
}

module.exports = QuestionGenerator;
