import { test, expect, Page } from '@playwright/test';
import {
    setupConfig,
    computeAnswerFromQuestion,
    ConfigParams,
    runGame,
    setupAndRunGame
} from '../../utils/SetErgoConfigPlayGame';



test('should play with mistakes (wrong letters and enter)', async ({ page }) => {
    test.setTimeout(120000);

    // Example config: Addition + Subtraction, afficherFautes enabled
    console.log('two types, frequency check, show mistakes');
    await setupAndRunGame(page, {
        numQuestions: 40,
        toggles: [true, true, false, false, false, false, false],
        frequencies: [70],
        afficherScore: true,
        afficherFautes: true,
        chiffresEnLettre: false,
        montrerLesReponses: true,
        enableMistakes: true,
        expectedRegexes: [
            /Calcules\s+\d+\s*\+\s*\d+\s*=/i,
            /Calcules\s+\d+\s*-\s*\d+\s*=/i,
        ]
    });

        console.log('two types, frequency check, dont show mistakes');
    await setupAndRunGame(page, {
        numQuestions: 40,
        toggles: [true, true, false, false, false, false, false],
        frequencies: [70],
        afficherScore: true,
        afficherFautes: false,
        chiffresEnLettre: false,
        montrerLesReponses: true,
        enableMistakes: true,
        expectedRegexes: [
            /Calcules\s+\d+\s*\+\s*\d+\s*=/i,
            /Calcules\s+\d+\s*-\s*\d+\s*=/i,
        ]
    });
});