const fs = require('fs');
const path = require('path');

function loadWordsFromTSV(tsvPath) {
    const absPath = path.resolve(__dirname, tsvPath);
    const data = fs.readFileSync(absPath, 'utf-8');
    const lines = data.trim().split('\n');
    const headers = lines[0].split('\t');
    // Find the column index for the word (usually "ortho" in Lexique383)
    const wordCol = headers.indexOf('ortho');
    if (wordCol === -1) throw new Error('No "ortho" column found in TSV');
    // Extract just the words
    return lines.slice(1).map(line => line.split('\t')[wordCol].toLowerCase());
}

const words = loadWordsFromTSV('./Lexique383.tsv'); // adjust path if needed
console.log(`Loaded ${words.length} French words.`);
console.log('words are ', words);
class FrenchWordDictionary {
    constructor(words) {
        this.letterToWords = {};
        // Initialize dictionary with 26 letters
        for (let i = 0; i < 26; i++) {
            const letter = String.fromCharCode(97 + i); // 'a' to 'z'
            this.letterToWords[letter] = new Set();
        }
        this.loadWords(words);
    }

    loadWords(words) {
        for (const word of words) {
            // For each letter in the word, add the word to the corresponding set
            const uniqueLetters = new Set(word.replace(/[^a-z]/g, '')); // Only a-z
            for (const letter of uniqueLetters) {
                if (this.letterToWords[letter]) {
                    this.letterToWords[letter].add(word);
                }
            }
        }
    }

    // Example: get all words containing 'e'
    getWordsWithLetter(letter) {
        letter = letter.toLowerCase();
        return this.letterToWords[letter] ? Array.from(this.letterToWords[letter]) : [];
    }
}
module.exports = {
    FrenchWordDictionary,
    words
};