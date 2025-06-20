import { test, expect, Page } from '@playwright/test';
import {
    setupConfig,
    computeAnswerFromQuestion,
    ConfigParams,
    runGame,
    setupAndRunGame
} from '../../utils/SetErgoConfigPlayGame';

// Auxiliary function to navigate to the statistics page for the current user
async function goToErgoStatistics(page: Page, childIndex: number) {
    // From the home/splash screen, click "Je suis un ergothérapeute"
    await page.getByText('Je suis un ergothérapeute').click();

    // Wait for user cards to appear, then click the first user card
    const childCard = page.locator('.user-card:not(.add-user-card)').nth(childIndex);
    await expect(childCard).toBeVisible({ timeout: 10000 });
    await childCard.click();

    // Click the "Statistiques" button in the navbar or menu
    await page.getByText('Statistiques', { exact: false }).click();

    // Wait for statistics box to appear
    await expect(page.locator('app-statistics-box')).toBeVisible({ timeout: 10000 });
}

// Auxiliary function to check statistics for the last session
async function checkLastSessionStats(page: Page, expectedNumQuestions: number, expectedWrongAnswers: number, expectedScore?: number) {
    // Wait for statistics box to load
    const statBox = page.locator('app-statistics-box');
    await expect(statBox).toBeVisible({ timeout: 10000 });

    // Wait for the "Dernière partie" tab to be active
    await expect(page.getByText('Dernière partie')).toHaveClass(/active/);

    // Check the score and number of corrections (mistakes)
    const scoreText = await statBox.locator('.stat-item span', { hasText: 'Score:' }).textContent();
    const correctionsText = await statBox.locator('.stat-item span', { hasText: 'Nombre de corrections:' }).textContent();

    // Optionally check score if provided
    if (expectedScore !== undefined && scoreText) {
        const scoreMatch = scoreText.match(/Score:\s*(\d+)/);
        expect(scoreMatch).not.toBeNull();
        expect(Number(scoreMatch![1])).toBe(expectedScore);
    }

    // Check that the number of corrections matches the expected number or 5, whichever is lower
    if (correctionsText) {
        const corrMatch = correctionsText.match(/Nombre de corrections:\s*(\d+)/);
        expect(corrMatch).not.toBeNull();
        const expectedCorrections = Math.min(expectedWrongAnswers, 5);
        expect(Number(corrMatch![1])).toBe(expectedCorrections);
    }
    // Check that the number of questions matches (score or another field)
    // You may want to check for more fields as needed
}

test('should play a game with mistakes and view statistics in ergo statistics page', async ({ page }) => {
    test.setTimeout(120000);

    const numQuestions = 8;
    const numWrongAnswersChild0 = 1;
    const numWrongAnswersChild1 = 2;

    // Play as child 0
    await setupAndRunGame(page, {
        numQuestions,
        toggles: [true, true, false, false, false, false, false],
        frequencies: [70, 30],
        afficherScore: true,
        afficherFautes: true,
        chiffresEnLettre: false,
        montrerLesReponses: true,
        enableMistakes: false,
        numWrongAnswersToSubmit: numWrongAnswersChild0,
        childIndex: 0,
        expectedRegexes: [
            /Calcules\s+\d+\s*\+\s*\d+\s*=/i,
            /Calcules\s+\d+\s*-\s*\d+\s*=/i,
        ]
    });

    // Play as child 1
    await setupAndRunGame(page, {
        numQuestions,
        toggles: [true, true, false, false, false, false, false],
        frequencies: [70, 30],
        afficherScore: true,
        afficherFautes: true,
        chiffresEnLettre: false,
        montrerLesReponses: true,
        enableMistakes: false,
        numWrongAnswersToSubmit: numWrongAnswersChild1,
        childIndex: 1,
        expectedRegexes: [
            /Calcules\s+\d+\s*\+\s*\d+\s*=/i,
            /Calcules\s+\d+\s*-\s*\d+\s*=/i,
        ]
    });

    // Check statistics for child 0
    await goToErgoStatistics(page, 0);
    await checkLastSessionStats(page, numQuestions, numWrongAnswersChild0);

    // Go back to splash/home
    await page.getByText('Accueil', { exact: true }).click();

    // Check statistics for child 1
    await goToErgoStatistics(page, 1);
    await checkLastSessionStats(page, numQuestions, numWrongAnswersChild1);
});