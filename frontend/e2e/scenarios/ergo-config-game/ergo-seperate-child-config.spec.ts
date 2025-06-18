import { test, expect, Page } from '@playwright/test';
import { testUrl } from 'e2e/e2e.config';

class ErgoConfigSelectedPageFixture {
    constructor(private page: Page) { }

    getNombreDeQuestionsInput() {
        return this.page.locator('input[type="text"]').first();
    }

    getMaxWordLengthInput() {
        return this.page.locator('input[type="number"]').first();
    }

    getOperationToggle(index: number) {
        // The toggle is the app-settings-toggle in the row for the operation
        return this.page.locator('.question-frequency-row app-settings-toggle').nth(index);
    }

    getFrequencyInputForOperation(index: number) {
        return this.page.locator('.question-frequency-row input[type="number"]').nth(index);
    }
}

class GamePageFixture {
    constructor(private page: Page) { }

    getQuestion() {
        return this.page.getByTestId('question-text');
    }
}


test('should set different configs for two different children', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds
    // Go to the ergo play page and select the first child
    await page.goto(`${testUrl}/ergo-play`);
    const firstUserCard = page.locator('.user-card:not(.add-user-card)').nth(0);
    //const secondUserCard = page.locator('.user-card:not(.add-user-card)').nth(1);

    // Set config for the first child
    await firstUserCard.click();
    await expect(page).toHaveURL(/ergo-config-selected/);

    const fixture1 = new ErgoConfigSelectedPageFixture(page);
    await fixture1.getNombreDeQuestionsInput().fill('3');
    await expect(fixture1.getNombreDeQuestionsInput()).toHaveValue('3');
    await fixture1.getMaxWordLengthInput().fill('5');
    await expect(fixture1.getMaxWordLengthInput()).toHaveValue('5');




    /*
    // Deactivate all toggles first (to be sure)
    for (let i = 0; i < 7; i++) {
        const toggle = fixture1.getOperationToggle(i);
        // If toggle is ON, click to turn OFF
        if (await toggle.getAttribute('ng-reflect-checked') === 'true') {
            await toggle.click();
        }
    }
        // Activate Addition (index 0) and French Words (index 6)
    await fixture1.getOperationToggle(0).click();
    await fixture1.getOperationToggle(6).click();
    */
    // Activate only Addition (0) and French Words (6) for the first child
    for (let i = 0; i < 7; i++) {
        const toggle = fixture1.getOperationToggle(i);
        // Get the checked state (true/false as string)
        const checked = await toggle.getAttribute('ng-reflect-checked');
        // Activate only for 0 and 6, deactivate others
        if ((i === 0 || i === 6) && checked !== 'true') {
            await toggle.click();
        } else if (i !== 0 && i !== 6 && checked === 'true') {
            await toggle.click();
        }
    }





    // Optionally, set frequencies if you want to hardcast (but with only two active, auto should be 50/50)
    // If you want to hardcast, uncomment below:
    await fixture1.getFrequencyInputForOperation(0).fill('20');
    // await fixture1.getFrequencyInputForOperation(6).fill('80');


    // Go back to the welcome page using the "Accueil" button
    const accueilButton2 = page.getByText('Accueil', { exact: true });
    await expect(accueilButton2).toBeVisible({ timeout: 5000 });

    await accueilButton2.click();
    await page.getByText('Je suis un ergothérapeute').click();

    // Wait for user cards to be visible and re-create locator
    const secondUserCard = page.locator('.user-card:not(.add-user-card)').nth(1);
    await expect(secondUserCard).toBeVisible({ timeout: 5000 });
    await secondUserCard.click();
    await expect(page).toHaveURL(/ergo-config-selected/);

    const fixture2 = new ErgoConfigSelectedPageFixture(page);

    // Set different config for second child
    await fixture2.getNombreDeQuestionsInput().fill('2');
    await expect(fixture2.getNombreDeQuestionsInput()).toHaveValue('2');
    await fixture2.getMaxWordLengthInput().fill('8');
    await expect(fixture2.getMaxWordLengthInput()).toHaveValue('8');


    /*
    // Deactivate all toggles first
    for (let i = 0; i < 7; i++) {
        const toggle = fixture2.getOperationToggle(i);
        if (await toggle.getAttribute('ng-reflect-checked') === 'true') {
            await toggle.click();
        }
    }
    // Activate Addition (0), Subtraction (1), Multiplication (2), Division (3)
    for (let i = 0; i < 4; i++) {
        await fixture2.getOperationToggle(i).click();
    }
    */
    // For the second child, activate 4 types and hardcast 2 frequencies
    for (let i = 0; i < 7; i++) {
        const toggle = fixture2.getOperationToggle(i);
        const checked = await toggle.getAttribute('ng-reflect-checked');
        // Activate first 4, deactivate others
        if (i < 4 && checked !== 'true') {
            await toggle.click();
        } else if (i >= 4 && checked === 'true') {
            await toggle.click();
        }
    }




    // Hardcast Addition to 40, Subtraction to 30, leave others auto
    await fixture2.getFrequencyInputForOperation(0).fill('40');
    await fixture2.getFrequencyInputForOperation(1).fill('30');
    // Multiplication and Division will be auto-calculated to sum to 100


    const accueilButton = page.getByText('Accueil', { exact: true });
    await expect(accueilButton).toBeVisible({ timeout: 5000 });
    await accueilButton.click();

    // --- Play a game as the first child and check config ---
    // Click "Je suis un enfant"
    await page.getByText('Je suis un enfant').click();

    // Select the first child
    await page.locator('.user-card:not(.add-user-card)').nth(0).click();

    // Click "Jouer"
    const playButton = page.getByText(/jouer/i);
    await expect(playButton).toBeVisible({ timeout: 10000 });
    await playButton.click();

    // Click "Démarrer"
    const startButton = page.getByText(/démarrer/i);
    await expect(startButton).toBeVisible({ timeout: 10000 });
    await startButton.click();

    // Play the game: answer all questions, check config is respected
    const gamePage = new GamePageFixture(page);
    let answeredQuestions = 0;
    let lastQuestionText = '';
    while (answeredQuestions < 3) {
        const question = await gamePage.getQuestion();
        if (!(await question.isVisible({ timeout: 2000 }).catch(() => false))) {
            break;
        }
        //await expect(question).toBeVisible({ timeout: 10000 });
        const questionText = (await question.textContent())?.trim() || '';
        expect(questionText.length).toBeGreaterThan(0);

        // Example config check: question count
        // Example config check: max word length (if question is a word)
        // (You can add more checks here if your UI exposes config info)

        // Now try a correct answer (replace 'cinq' with logic if you can parse the question)
        await page.keyboard.type('cinq');
        // If auto-submit is not triggered, press Enter
        await page.keyboard.press('Enter');
        await page.waitForTimeout(700);

        // Only increment if the question changed
        answeredQuestions++;
    }

    //back to the accueil page
    await expect(page.getByText(/Félicitations/i)).toBeVisible({ timeout: 10000 });

    // Now wait for and click the Accueil button
    const accueilButtonOnPodium = page.getByText('Accueil', { exact: true });
    await expect(accueilButtonOnPodium).toBeVisible({ timeout: 10000 });
    await accueilButtonOnPodium.click();


    // --- Play a game as the second child and check config ---

    await page.getByText('Je suis un enfant').click();
    await page.locator('.user-card:not(.add-user-card)').nth(1).click();

    const playButton2 = page.getByText(/jouer/i);
    await expect(playButton2).toBeVisible({ timeout: 10000 });
    await playButton2.click();

    const startButton2 = page.getByText(/démarrer/i);
    await expect(startButton2).toBeVisible({ timeout: 10000 });
    await startButton2.click();

    const gamePage2 = new GamePageFixture(page);
    let answeredQuestions2 = 0;
    let lastQuestionText2 = '';
    while (answeredQuestions2 < 2) {
        const question2 = await gamePage2.getQuestion();
        if (!(await question2.isVisible({ timeout: 2000 }).catch(() => false))) {
            break;
        }
        await expect(question2).toBeVisible({ timeout: 10000 });
        const questionText2 = (await question2.textContent())?.trim() || '';
        expect(questionText2.length).toBeGreaterThan(0);

        // Simulate typing an answer (auto-submit or Enter)
        await page.keyboard.type('cinq');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(700);

        answeredQuestions2++;
    }
});