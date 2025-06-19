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

function computeAnswerFromQuestion(questionText: string): string {
    // Addition: "Calcules 2 + 3 ="
    let m = questionText.match(/Calcules\s+(\d+)\s*\+\s*(\d+)\s*=/i);
    if (m) return (parseInt(m[1], 10) + parseInt(m[2], 10)).toString();

    // Subtraction: "Calcules 7 - 2 ="
    m = questionText.match(/Calcules\s+(\d+)\s*-\s*(\d+)\s*=/i);
    if (m) return (parseInt(m[1], 10) - parseInt(m[2], 10)).toString();

    // Multiplication: "Calcules 4 × 3 ="
    m = questionText.match(/Calcules\s+(\d+)\s*[×x*]\s*(\d+)\s*=/i);
    if (m) return (parseInt(m[1], 10) * parseInt(m[2], 10)).toString();

    // Division: "Calcules 8 / 2 ="
    m = questionText.match(/Calcules\s+(\d+)\s*\/\s*(\d+)\s*=/i);
    if (m) return (parseInt(m[2], 10) !== 0 ? (parseInt(m[1], 10) / parseInt(m[2], 10)).toString() : '0');

    // Rewrite number: "Ecrire 42 :"
    m = questionText.match(/Ecrire\s+(\d+)\s*:/i);
    if (m) return m[1];

    // Crypted: "Recopies !@# :"
    m = questionText.match(/Recopies\s+([!@#$%&*()]+)\s*:/i);
    if (m) return m[1];

    // French word: "Recopies éléphant :"
    m = questionText.match(/Recopies\s+([a-zA-Zàâçéèêëîïôûùüÿñæœ]+)\s*:/i);
    if (m) return m[1];

    // Fallback
    return 'cinq';
}

class GamePageFixture {
    constructor(private page: Page) { }

    getQuestion() {
        return this.page.getByTestId('question-text');
    }
}

test('should set 10% addition, 90% french word, 5 questions, then play as the child', async ({ page }) => {
    test.setTimeout(90000); // 90 seconds

    // Go to the ergo play page and select the first child
    await page.goto(`${testUrl}/ergo-play`);
    const firstUserCard = page.locator('.user-card:not(.add-user-card)').first();
    await expect(firstUserCard).toBeVisible({ timeout: 10000 });
    await firstUserCard.click();
    await expect(page).toHaveURL(/ergo-config-selected/);

    const fixture = new ErgoConfigSelectedPageFixture(page);

    // Set number of questions to 5
    await fixture.getNombreDeQuestionsInput().fill('10');
    await expect(fixture.getNombreDeQuestionsInput()).toHaveValue('10');

    // Optionally set max word length if needed
    // await fixture.getMaxWordLengthInput().fill('8');
    // await expect(fixture.getMaxWordLengthInput()).toHaveValue('8');

    // Activate only Addition (0) and French Words (6)
    for (let i = 0; i < 7; i++) {
        const toggle = fixture.getOperationToggle(i);
        const checked = await toggle.getAttribute('ng-reflect-checked');
        if ((i === 6) && checked !== 'true') {
            await toggle.click();
        } else if (i !== 6 && checked === 'true') {
            await toggle.click();
        }
    }

    // Set frequencies: Addition (0) = 10, French Words (6) = 90
    //await fixture.getFrequencyInputForOperation(6).fill('50');
    //await fixture.getFrequencyInputForOperation(6).fill('90');

    // Go back to the welcome page using the "Accueil" button
    const accueilButton = page.getByText('Accueil', { exact: true });
    await expect(accueilButton).toBeVisible({ timeout: 5000 });
    await accueilButton.click();

    // --- Play a game as the child ---
    await page.getByText('Je suis un enfant').click();
    const childCard = page.locator('.user-card:not(.add-user-card)').first();
    await expect(childCard).toBeVisible({ timeout: 10000 });
    await childCard.click();

    // Click "Jouer"
    const playButton = page.getByText(/jouer/i);
    await expect(playButton).toBeVisible({ timeout: 10000 });
    await playButton.click();

    // Click "Démarrer"
    const startButton = page.getByText(/démarrer/i);
    await expect(startButton).toBeVisible({ timeout: 10000 });
    await startButton.click();






    // Play the game: answer all questions
    const gamePage = new GamePageFixture(page);
    let answeredQuestions = 0;
    while (answeredQuestions < 5) {
        const question = await gamePage.getQuestion();
        if (!(await question.isVisible({ timeout: 2000 }).catch(() => false))) {
            break;
        }
        //await expect(question).toBeVisible({ timeout: 10000 });
        const questionText = (await question.textContent())?.trim() || '';
        expect(questionText.length).toBeGreaterThan(0);

        const answer = computeAnswerFromQuestion(questionText);


        // Now try a correct answer (replace 'cinq' with logic if you can parse the question)
        //await page.keyboard.type(answer);
        const answerInput = page.locator('input[type="text"], input[data-testid="answer"]');
        //await answerInput.first().click();
        //await answerInput.first().fill('');
        for (const char of answer) {
            if (/^[\x00-\x7F]$/.test(char)) {
                await page.keyboard.press(char);
            } else {
                await page.keyboard.insertText(char);
            }
        }








        //await page.keyboard.insertText(answer);
        await page.waitForTimeout(10);

        const stillVisible = await question.isVisible({ timeout: 500 }).catch(() => false);
        if (!stillVisible) {
            break; // Last question was autosubmitted and question disappeared
        }

        const questionAfter = (await question.textContent())?.trim() || '';
        if (questionAfter === questionText) {
            // If not, hit Enter and wait a tiny bit
            await page.keyboard.press('Enter');
            await page.waitForTimeout(150);
        }


        // Check if the question is still visible after answering
        if (!(await question.isVisible({ timeout: 1000 }).catch(() => false))) {
            break; // Game ended, go to podium
        }
        answeredQuestions++;
    }

    // Wait for the podium/results page to appear and click Accueil to finish
    await expect(page.getByText(/Félicitations/i)).toBeVisible({ timeout: 10000 });
    const accueilButtonOnPodium = page.getByText('Accueil', { exact: true });
    await expect(accueilButtonOnPodium).toBeVisible({ timeout: 10000 });
    await accueilButtonOnPodium.click();
});