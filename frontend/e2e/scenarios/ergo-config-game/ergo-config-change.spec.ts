import { test, expect, Page } from '@playwright/test';
import { testUrl } from 'e2e/e2e.config';

class ErgoConfigSelectedPageFixture {
    constructor(private page: Page) {}

    getShowAnswerToggle() {
        return this.page.locator('app-settings-toggle').nth(0);
    }

    getShowScoreToggle() {
        return this.page.locator('app-settings-toggle').nth(1);
    }

    getNombreDeQuestionsInput() {
        return this.page.locator('input[type="text"]').first();
    }

    getMaxWordLengthInput() {
        return this.page.locator('input[type="number"]').nth(0);
    }

    getFrequencyInputForOperation(index: number) {
        // The frequency inputs for operations are after the general settings
        return this.page.locator('.question-frequency-row input[type="number"]').nth(index);
    }

    getSaveConfirmation() {
        return this.page.locator('.save-confirmation');
    }
}

test('should navigate to ergo config selected page and change configs', async ({ page }) => {
    // Go to the ergo play page and select the first user
    await page.goto(`${testUrl}/ergo-play`);
    await page.locator('.user-card:not(.add-user-card)').first().click();

    // Should now be on the config selected page
    await expect(page).toHaveURL(/ergo-config-selected/);

    const fixture = new ErgoConfigSelectedPageFixture(page);

    // Toggle "Montrer les réponses"
    const showAnswerToggle = fixture.getShowAnswerToggle();
    await showAnswerToggle.click();

    // Toggle "Afficher le score"
    const showScoreToggle = fixture.getShowScoreToggle();
    await showScoreToggle.click();

    // Change "Nombre de questions"
    const nombreInput = fixture.getNombreDeQuestionsInput();
    await nombreInput.fill('12');

    // Change "Longueur maximale des mots"
    const maxWordLengthInput = fixture.getMaxWordLengthInput();
    await maxWordLengthInput.fill('8');

    // Change frequency for the first operation (Addition)
    const freqInput = fixture.getFrequencyInputForOperation(0);
    await freqInput.fill('50');


});
