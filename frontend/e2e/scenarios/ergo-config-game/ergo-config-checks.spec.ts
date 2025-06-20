import { test } from '@playwright/test';
import {
    setupAndRunGame,
    ConfigParams
} from '../../utils/SetErgoConfigPlayGame';



test('should play with various configs (no french words)', async ({ page }) => {
    test.setTimeout(3000000);

    
    // Single type, chiffres en lettre
    console.log('Single type, chiffres en lettre');
    await setupAndRunGame(page, {
        numQuestions: 2,
        toggles: [false, false, true, false, false, false, false],
        frequencies: [0, 0, 100, 0, 0, 0, 0],
        afficherScore: false,
        afficherFautes: false,
        chiffresEnLettre: true,
        montrerLesReponses: false,
        expectedRegexes: [
            /Calcules\s+\d+\s*[×x*]\s*\d+\s*=/i
        ]
    });

    // Single type, division
    console.log('Single type, division');
    await setupAndRunGame(page, {
        numQuestions: 2,
        toggles: [false, false, false, true, false, false, false],
        frequencies: [0, 0, 0, 100, 0, 0, 0],
        afficherScore: false,
        afficherFautes: false,
        chiffresEnLettre: false,
        montrerLesReponses: false,
        expectedRegexes: [
            /Calcules\s+\d+\s*\/\s*\d+\s*=/i
        ]
    });

    // Single type, recopies
    console.log('Single type, recopies');
    await setupAndRunGame(page, {
        numQuestions: 2,
        toggles: [false, false, false, false, false, true, false],
        frequencies: [0, 0, 0, 0, 0, 100, 0],
        afficherScore: false,
        afficherFautes: false,
        chiffresEnLettre: false,
        montrerLesReponses: false,
        expectedRegexes: [
            /Recopies\s+[!@#$%&*()]+\s*:/i
        ]
    });

    // Single type, ecrire
    console.log('Single type, ecrire');
    await setupAndRunGame(page, {
        numQuestions: 2,
        toggles: [false, false, false, false, true, false, false],
        frequencies: [0, 0, 0, 0, 100, 0, 0],
        afficherScore: false,
        afficherFautes: false,
        chiffresEnLettre: false,
        montrerLesReponses: false,
        expectedRegexes: [
            /Ecrire\s+\d+\s*:/i
        ]
    });

    // --- Combination configs below ---

    // Addition + Subtraction, afficherScore + afficherFautes
    console.log('Addition + Subtraction, afficherScore + afficherFautes');
    await setupAndRunGame(page, {
        numQuestions: 3,
        toggles: [true, true, false, false, false, false, false],
        frequencies: [50, 50, 0, 0, 0, 0, 0],
        afficherScore: true,
        afficherFautes: true,
        chiffresEnLettre: false,
        montrerLesReponses: false,
        expectedRegexes: [
            /Calcules\s+\d+\s*\+\s*\d+\s*=/i,
            /Calcules\s+\d+\s*-\s*\d+\s*=/i
        ]
    });

    // Addition + Multiplication, chiffresEnLettre + montrerLesReponses
    console.log('Addition + Multiplication, chiffresEnLettre + montrerLesReponses');
    await setupAndRunGame(page, {
        numQuestions: 3,
        toggles: [true, false, true, false, false, false, false],
        frequencies: [60, 0, 40, 0, 0, 0, 0],
        afficherScore: false,
        afficherFautes: false,
        chiffresEnLettre: true,
        montrerLesReponses: true,
        expectedRegexes: [
            /Calcules\s+\d+\s*\+\s*\d+\s*=/i,
            /Calcules\s+\d+\s*[×x*]\s*\d+\s*=/i
        ]
    });

    // Subtraction + Ecrire, afficherFautes + montrerLesReponses
    console.log('Subtraction + Ecrire, afficherFautes + montrerLesReponses');
    await setupAndRunGame(page, {
        numQuestions: 3,
        toggles: [false, true, false, false, true, false, false],
        frequencies: [0, 60, 0, 0, 40, 0, 0],
        afficherScore: false,
        afficherFautes: true,
        chiffresEnLettre: false,
        montrerLesReponses: true,
        expectedRegexes: [
            /Calcules\s+\d+\s*-\s*\d+\s*=/i,
            /Ecrire\s+\d+\s*:/i
        ]
    });

    // Multiplication + Recopies, all toggles on
    console.log('Multiplication + Recopies, all toggles on');
    await setupAndRunGame(page, {
        numQuestions: 3,
        toggles: [false, false, true, false, false, true, false],
        frequencies: [0, 0, 50, 0, 0, 50, 0],
        afficherScore: true,
        afficherFautes: true,
        chiffresEnLettre: true,
        montrerLesReponses: true,
        expectedRegexes: [
            /Calcules\s+\d+\s*[×x*]\s*\d+\s*=/i,
            /Recopies\s+[!@#$%&*()]+\s*:/i
        ]
    });

    // All math types, all toggles off except afficherScore
    console.log('All math types, all toggles off except afficherScore');
    await setupAndRunGame(page, {
        numQuestions: 4,
        toggles: [true, true, true, true, false, false, false],
        frequencies: [25, 25, 25, 25, 0, 0, 0],
        afficherScore: true,
        afficherFautes: false,
        chiffresEnLettre: false,
        montrerLesReponses: false,
        expectedRegexes: [
            /Calcules\s+\d+\s*\+\s*\d+\s*=/i,
            /Calcules\s+\d+\s*-\s*\d+\s*=/i,
            /Calcules\s+\d+\s*[×x*]\s*\d+\s*=/i,
            /Calcules\s+\d+\s*\/\s*\d+\s*=/i
        ]
    });


    // All types, all toggles on
    console.log('All types except french, all toggles on');
    await setupAndRunGame(page, {
        numQuestions: 5,
        toggles: [true, true, true, true, true, true, false],
        frequencies: [15, 15, 15, 15, 15, 15],
        afficherScore: true,
        afficherFautes: true,
        chiffresEnLettre: true,
        montrerLesReponses: true,
        expectedRegexes: [
            /Calcules\s+\d+\s*\+\s*\d+\s*=/i,
            /Calcules\s+\d+\s*-\s*\d+\s*=/i,
            /Calcules\s+\d+\s*[×x*]\s*\d+\s*=/i,
            /Calcules\s+\d+\s*\/\s*\d+\s*=/i,
            /Ecrire\s+\d+\s*:/i,
            /Recopies\s+[!@#$%&*()]+\s*:/i
        ]
    });
    

    // three types, frequency check
    console.log('Three types, frequency check');
    await setupAndRunGame(page, {
        numQuestions: 40,
        toggles: [true, true, true, false, false, false, false],
        frequencies: [70],
        afficherScore: true,
        afficherFautes: true,
        chiffresEnLettre: false,
        montrerLesReponses: true,
        expectedRegexes: [
            /Calcules\s+\d+\s*\+\s*\d+\s*=/i,
            /Calcules\s+\d+\s*-\s*\d+\s*=/i,
            /Calcules\s+\d+\s*[×x*]\s*\d+\s*=/i,
        ]
    });

});