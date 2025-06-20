import { test, expect, Page } from '@playwright/test';
import { testUrl } from 'e2e/e2e.config';
import { runGame, setupAndRunGame } from 'e2e/utils/SetErgoConfigPlayGame';

class ErgoConfigSelectedPageFixture {
    constructor(private page: Page) { }

    getNombreDeQuestionsInput() {
        return this.page.locator('input[type="text"]').first();
    }

    getMaxWordLengthInput() {
        return this.page.locator('input[type="number"]').first();
    }

    getOperationToggle(index: number) {
        return this.page.locator('.question-frequency-row app-settings-toggle').nth(index);
    }

    getFrequencyInputForOperation(index: number) {
        return this.page.locator('.question-frequency-row input[type="number"]').nth(index);
    }
}

function computeAnswerFromQuestion(questionText: string): string {
    let m = questionText.match(/Calcules\s+(\d+)\s*\+\s*(\d+)\s*=/i);
    if (m) return (parseInt(m[1], 10) + parseInt(m[2], 10)).toString();
    m = questionText.match(/Calcules\s+(\d+)\s*-\s*(\d+)\s*=/i);
    if (m) return (parseInt(m[1], 10) - parseInt(m[2], 10)).toString();
    m = questionText.match(/Calcules\s+(\d+)\s*[×x*]\s*(\d+)\s*=/i);
    if (m) return (parseInt(m[1], 10) * parseInt(m[2], 10)).toString();
    m = questionText.match(/Calcules\s+(\d+)\s*\/\s*(\d+)\s*=/i);
    if (m) return (parseInt(m[2], 10) !== 0 ? (parseInt(m[1], 10) / parseInt(m[2], 10)).toString() : '0');
    m = questionText.match(/Ecrire\s+(\d+)\s*:/i);
    if (m) return m[1];
    m = questionText.match(/Recopies\s+([!@#$%&*()]+)\s*:/i);
    if (m) return m[1];
    m = questionText.match(/Recopies\s+([a-zA-Zàâçéèêëîïôûùüÿñæœ]+)\s*:/i);
    if (m) return m[1];
    return 'cinq';
}

class GamePageFixture {
    constructor(private page: Page) { }
    getQuestion() {
        return this.page.getByTestId('question-text');
    }
}




test('should change config, play, then change config again and play with new config', async ({ page }) => {
    test.setTimeout(60000);

    // --- First config: Addition only, 5 questions ---
    await setupAndRunGame(page, {
        numQuestions: 5,
        toggles: [true, false, false, false, false, false, false], // Only addition enabled
        frequencies: [],
        expectedRegexes: [ /Calcules\s+\d+\s*\+\s*\d+\s*=/i ],
    });

    // --- Change config: not french word---
    await setupAndRunGame(page, {
        numQuestions: 3,
        toggles: [false, false, false, false, true, false, false], 
        frequencies: [],
        expectedRegexes: [ /Recopies\s+[!@#$%&*()]+\s*:/i ],
    });
});













/*
test('should change config, play, then change config again and play with new config', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds


    // --- First config: Addition only, 5 questions ---
    await page.goto(`/ergo-play`);
    const childCard = page.locator('.user-card:not(.add-user-card)').first();
    await expect(childCard).toBeVisible({ timeout: 10000 });
    await childCard.click();
    await expect(page).toHaveURL(/ergo-config-selected/);

    const fixture = new ErgoConfigSelectedPageFixture(page);
    await fixture.getNombreDeQuestionsInput().fill('5');
    await expect(fixture.getNombreDeQuestionsInput()).toHaveValue('5');

    // Activate only Addition (0)
    for (let i = 0; i < 7; i++) {
        const toggle = fixture.getOperationToggle(i);
        const checked = await toggle.getAttribute('ng-reflect-checked');
        if (i === 0 && checked !== 'true') {
            await toggle.click();
        } else if (i !== 0 && checked === 'true') {
            await toggle.click();
        }
    }
    await fixture.getFrequencyInputForOperation(0).fill('100');

    // Go back to the welcome page using the "Accueil" button
    const accueilButton = page.getByText('Accueil', { exact: true });
    await expect(accueilButton).toBeVisible({ timeout: 5000 });
    await accueilButton.click();

    // --- Play a game as the child and ensure only addition questions are asked ---
    await page.getByText('Je suis un enfant').click();
    const childCard2 = page.locator('.user-card:not(.add-user-card)').first();
    await expect(childCard2).toBeVisible({ timeout: 10000 });
    await childCard2.click();

    const playButton = page.getByText(/jouer/i);
    await expect(playButton).toBeVisible({ timeout: 10000 });
    await playButton.click();

    const startButton = page.getByText(/démarrer/i);
    await expect(startButton).toBeVisible({ timeout: 10000 });
    await startButton.click();

    const gamePage = new GamePageFixture(page);
    let answeredQuestions = 0;
    while (answeredQuestions < 5) {
        const question = await gamePage.getQuestion();
        if (!(await question.isVisible({ timeout: 2000 }).catch(() => false))) break;
        const questionText = (await question.textContent())?.trim() || '';
        expect(questionText.length).toBeGreaterThan(0);

        // Ensure only addition questions
        expect(questionText).toMatch(/Calcules\s+\d+\s*\+\s*\d+\s*=/i);

        const answer = computeAnswerFromQuestion(questionText);
        await page.keyboard.type(answer);
        await page.waitForTimeout(100);

        const stillVisible = await question.isVisible({ timeout: 500 }).catch(() => false);
        if (!stillVisible) break;
        const questionAfter = (await question.textContent())?.trim() || '';
        if (questionAfter === questionText) {
            await page.keyboard.press('Enter');
            await page.waitForTimeout(150);
        }
        if (!(await question.isVisible({ timeout: 1000 }).catch(() => false))) break;
        answeredQuestions++;
    }

    // Wait for the podium/results page to appear and click Accueil to finish
    await expect(page.getByText(/Félicitations/i)).toBeVisible({ timeout: 10000 });
    const accueilButtonOnPodium = page.getByText('Accueil', { exact: true });
    await expect(accueilButtonOnPodium).toBeVisible({ timeout: 10000 });
    await accueilButtonOnPodium.click();

    // --- Change config: French word only, 3 questions ---
    await page.getByText('Je suis un ergothérapeute').click();
    const childCard3 = page.locator('.user-card:not(.add-user-card)').first();
    await expect(childCard3).toBeVisible({ timeout: 10000 });
    await childCard3.click();
    await expect(page).toHaveURL(/ergo-config-selected/);

    await fixture.getNombreDeQuestionsInput().fill('3');
    await expect(fixture.getNombreDeQuestionsInput()).toHaveValue('3');

    // Activate only French Words (6)
    for (let i = 0; i < 7; i++) {
        const toggle = fixture.getOperationToggle(i);
        const checked = await toggle.getAttribute('ng-reflect-checked');
        if (i === 5 && checked !== 'true') {
            await toggle.click();
        } else if (i !== 5 && checked === 'true') {
            await toggle.click();
        }
    }
    await fixture.getFrequencyInputForOperation(5).fill('100');

    // Go back to the welcome page using the "Accueil" button
    const accueilButton2 = page.getByText('Accueil', { exact: true });
    await expect(accueilButton2).toBeVisible({ timeout: 5000 });
    await accueilButton2.click();

    // --- Play a game as the child and ensure only french word questions are asked ---
    await page.getByText('Je suis un enfant').click();
    const childCard4 = page.locator('.user-card:not(.add-user-card)').first();
    await expect(childCard4).toBeVisible({ timeout: 10000 });
    await childCard4.click();

    const playButton2 = page.getByText(/jouer/i);
    await expect(playButton2).toBeVisible({ timeout: 10000 });
    await playButton2.click();

    const startButton2 = page.getByText(/démarrer/i);
    await expect(startButton2).toBeVisible({ timeout: 10000 });
    await startButton2.click();

    const gamePage2 = new GamePageFixture(page);
    let answeredQuestions2 = 0;
    while (answeredQuestions2 < 3) {
        const question2 = await gamePage2.getQuestion();
        if (!(await question2.isVisible({ timeout: 2000 }).catch(() => false))) break;
        const questionText2 = (await question2.textContent())?.trim() || '';
        expect(questionText2.length).toBeGreaterThan(0);

        // Ensure only french word questions
        expect(questionText2).toMatch(/Recopies\s+[!@#$%&*()]+\s*:/i);

        const answer = computeAnswerFromQuestion(questionText2);
        await page.keyboard.type(answer);
        await page.waitForTimeout(100);

        const stillVisible = await question2.isVisible({ timeout: 500 }).catch(() => false);
        if (!stillVisible) break;
        const questionAfter = (await question2.textContent())?.trim() || '';
        if (questionAfter === questionText2) {
            await page.keyboard.press('Enter');
            await page.waitForTimeout(150);
        }
        if (!(await question2.isVisible({ timeout: 1000 }).catch(() => false))) break;
        answeredQuestions++;
    }

    await expect(page.getByText(/Félicitations/i)).toBeVisible({ timeout: 10000 });
    const accueilButtonOnPodium2 = page.getByText('Accueil', { exact: true });
    await expect(accueilButtonOnPodium2).toBeVisible({ timeout: 10000 });
    await accueilButtonOnPodium2.click();
});
*/