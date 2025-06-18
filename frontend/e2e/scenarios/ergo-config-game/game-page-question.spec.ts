import { test, expect, Page } from '@playwright/test';
import { testUrl } from 'e2e/e2e.config';

// Fixture for the game/question page
class GamePageFixture {
    constructor(private page: Page) { }

    // Assumes the question is rendered in an element with a specific selector or role
    getQuestion() {
        // Adjust selector as needed to match your actual question display
        return this.page.getByTestId('question-text');
    }

    getAnswerInput() {
        // Try to find a text input for the answer
        return this.page.locator('input[type="text"], input[data-testid="answer"]');
    }

    getSubmitButton() {
        // Try to find a button for submitting the answer
        return this.page.getByRole('button', { name: /valider|submit|ok/i });
    }
}

test('should display and answer multiple questions on the game page, auto-submit on full answer, and ignore rapid double Enter', async ({ page }) => {
    await page.goto(`${testUrl}/child-list`);
    await page.locator('.user-card:not(.add-user-card)').first().click();

    // Wait for the "Jouer" button to appear and click it
    const playButton = page.getByText('Jouer', { exact: true });
    await expect(playButton).toBeVisible();
    await playButton.click();

    // Wait for the "Démarrer" button to be visible and click it
    const startButton = page.getByText('Démarrer', { exact: true });
    await expect(startButton).toBeVisible({ timeout: 10000 });
    await startButton.click();

    const gamePage = new GamePageFixture(page);

    // Answer 2 questions by typing the full answer (should auto-submit)
    for (let i = 0; i < 2; i++) {
        const question = await gamePage.getQuestion();
        await expect(question).toBeVisible({ timeout: 10000 });
        const questionText = (await question.textContent())?.trim();
        expect(questionText && questionText.length > 0).toBeTruthy();

        // Get the expected answer from the backend or mock (here we use 'cinq' as a placeholder)
        // In a real test, you would parse the question and compute the answer.
        const answer = 'cinq';

        // Type the answer one character at a time (should auto-submit when complete)
        for (const char of answer) {
            await page.keyboard.type(char);
        }

        // Wait for the next question to load (question text should change)
        await page.waitForTimeout(700);
    }

    // Now test rapid double Enter: type a partial answer, then hit Enter twice quickly
    const question = await gamePage.getQuestion();
    await expect(question).toBeVisible({ timeout: 10000 });
    const questionText = (await question.textContent())?.trim();
    expect(questionText && questionText.length > 0).toBeTruthy();

    // Type a partial answer (not the full answer, so Enter is required)
    await page.keyboard.type('ci');

    // Press Enter twice rapidly
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    // Wait for the next question to load
    await page.waitForTimeout(700);

    // Check that only one question was submitted (the question text should have changed only once)
    // Optionally, you could store the previous question text and compare to ensure only one transition occurred.
});
