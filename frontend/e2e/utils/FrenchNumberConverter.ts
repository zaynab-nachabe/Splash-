export class FrenchNumberConverter {
    static units: { [key: number]: string } = {
        0: 'zéro',
        1: 'un',
        2: 'deux',
        3: 'trois',
        4: 'quatre',
        5: 'cinq',
        6: 'six',
        7: 'sept',
        8: 'huit',
        9: 'neuf',
        10: 'dix',
        11: 'onze',
        12: 'douze',
        13: 'treize',
        14: 'quatorze',
        15: 'quinze',
        16: 'seize',
    };

    static tens: { [key: number]: string } = {
        10: 'dix',
        20: 'vingt',
        30: 'trente',
        40: 'quarante',
        50: 'cinquante',
        60: 'soixante',
        70: 'soixante',
        80: 'quatre-vingt',
        90: 'quatre-vingt',
    };

    static convertToWords(num: number): string {
        if (num < 0) {
            return `moins ${this.convertToWords(Math.abs(num))}`;
        }

        if (num === 0) {
            return 'zéro';
        }

        if (num in this.units) {
            return this.units[num];
        }

        if (num < 100) {
            const tens = Math.floor(num / 10) * 10;
            const ones = num % 10;

            if (tens === 70 || tens === 90) {
                const baseNum = tens === 70 ? 60 : 80;
                const remainder = num - baseNum;

                if (remainder === 1 && tens === 70) {
                    return 'soixante et onze';
                }

                return `${this.tens[baseNum]}-${this.units[remainder]}`;
            }

            if (ones === 0) {
                return this.tens[tens];
            }
            if (ones === 1 && tens !== 80) {
                return `${this.tens[tens]}-et-un`;
            }
            return `${this.tens[tens]}-${this.units[ones]}`;
        }

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

        if (num < 2000) {
            const remainder = num % 1000;
            if (remainder === 0) {
                return 'mille';
            }
            return `mille-${this.convertToWords(remainder)}`;
        }

        return num.toString();
    }
}