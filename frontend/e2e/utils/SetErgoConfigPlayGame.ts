import { expect, Page } from '@playwright/test';
import { testUrl } from 'e2e/e2e.config';
import { FrenchNumberConverter } from './FrenchNumberConverter';


export class ErgoConfigSelectedPageFixture {
    constructor(private page: Page) { }

    getNombreDeQuestionsInput() {
        return this.page.locator('input[type="text"]').first();
    }

    getOperationToggle(index: number) {
        return this.page.locator('.question-frequency-row app-settings-toggle').nth(index);
    }

    getFrequencyInputForOperation(index: number) {
        return this.page.locator('.question-frequency-row input[type="number"]').nth(index);
    }

    getAfficherScoreToggle() {
        return this.page.locator('.advanced-stat-cell', { hasText: 'Afficher le score' }).locator('app-settings-toggle');
    }
    getAfficherFautesToggle() {
        return this.page.locator('.advanced-stat-cell', { hasText: 'Afficher les fautes' }).locator('app-settings-toggle');
    }
    getChiffresEnLettreToggle() {
        return this.page.locator('.advanced-stat-cell', { hasText: 'Chiffres en lettres' }).locator('app-settings-toggle');
    }
    getMontrerLesReponsesToggle() {
        return this.page.locator('.advanced-stat-cell', { hasText: 'Montrer les réponses' }).locator('app-settings-toggle');
    }
}

export type ConfigParams = {
    numQuestions: number;
    toggles: boolean[];
    frequencies: number[];
    afficherScore?: boolean;
    afficherFautes?: boolean;
    chiffresEnLettre?: boolean;
    montrerLesReponses?: boolean;
    enableMistakes?: boolean;
    numWrongAnswersToSubmit?: number;
    childIndex?: number;
};

export function computeAnswerFromQuestion(questionText: string, chiffresEnLettre = false): string {
    let m = questionText.match(/Calcules\s+(\d+)\s*\+\s*(\d+)\s*=/i);
    if (m) {
        const result = parseInt(m[1], 10) + parseInt(m[2], 10);
        return chiffresEnLettre ? FrenchNumberConverter.convertToWords(result) : result.toString();
    }
    m = questionText.match(/Calcules\s+(\d+)\s*-\s*(\d+)\s*=/i);
    if (m) {
        const result = parseInt(m[1], 10) - parseInt(m[2], 10);
        return chiffresEnLettre ? FrenchNumberConverter.convertToWords(result) : result.toString();
    }
    m = questionText.match(/Calcules\s+(\d+)\s*[×x*]\s*(\d+)\s*=/i);
    if (m) {
        const result = parseInt(m[1], 10) * parseInt(m[2], 10);
        return chiffresEnLettre ? FrenchNumberConverter.convertToWords(result) : result.toString();
    }
    m = questionText.match(/Calcules\s+(\d+)\s*\/\s*(\d+)\s*=/i);
    if (m) {
        const result = parseInt(m[2], 10) !== 0 ? (parseInt(m[1], 10) / parseInt(m[2], 10)) : 0;
        return chiffresEnLettre ? FrenchNumberConverter.convertToWords(result) : result.toString();
    }
    m = questionText.match(/Ecrire\s+(\d+)\s*:/i);
    if (m) {
        return chiffresEnLettre ? FrenchNumberConverter.convertToWords(parseInt(m[1], 10)) : m[1];
    }
    m = questionText.match(/Recopies\s+([!@#$%&*()]+)\s*:/i);
    if (m) return m[1];
    return 'cinq';
}

export async function setupConfig(
    page: Page,
    { numQuestions, toggles, frequencies, afficherScore, afficherFautes, chiffresEnLettre, montrerLesReponses, childIndex }: ConfigParams
) {
    const userCards = await page.locator('.user-card:not(.add-user-card)').count();
    if (userCards < 3) {
        await addChild(page, 'Eli', 'KOPTER', '9');
        await addChild(page, 'Judas', 'BRICOT', '9');
        await addChild(page, 'Lucie', 'FERT', '9');
    }



    await page.goto(`${testUrl}/ergo-play`);
    //await page.waitForSelector('.user-card:not(.add-user-card)', { timeout: 10000 });
    const userCardsCount = await page.locator('.user-card:not(.add-user-card)').count();
    console.log('User cards found:', userCardsCount);
    // Use childIndex if provided, otherwise default to first child
    const childCard = typeof childIndex === 'number'
        ? page.locator('.user-card:not(.add-user-card)').nth(childIndex)
        : page.locator('.user-card:not(.add-user-card)').first();
    await expect(childCard).toBeVisible({ timeout: 10000 });
    await childCard.click();
    await expect(page).toHaveURL(/ergo-config-selected/);

    const fixture = new ErgoConfigSelectedPageFixture(page);
    await fixture.getNombreDeQuestionsInput().fill(numQuestions.toString());
    await expect(fixture.getNombreDeQuestionsInput()).toHaveValue(numQuestions.toString());

    // Set toggles
    for (let i = 0; i < toggles.length; i++) {
        const toggle = fixture.getOperationToggle(i);
        const checked = await toggle.getAttribute('ng-reflect-checked');
        if (toggles[i] && checked !== 'true') {
            await toggle.click();
        } else if (!toggles[i] && checked === 'true') {
            await toggle.click();
        }
    }

    /*
    // Set frequencies
    for (let i = 0; i < frequencies.length; i++) {
        if (toggles[i]) {
            const freqInput = fixture.getFrequencyInputForOperation(i);
            await expect(freqInput).toBeVisible({ timeout: 5000 });
            await expect(freqInput).toBeEnabled({ timeout: 5000 });
            await freqInput.fill(frequencies[i].toString());
        }
    }
        */
    let freqIdx = 0;
    for (let i = 0; i < toggles.length; i++) {
        if (toggles[i] && frequencies[freqIdx] !== undefined) {
            const freqInput = fixture.getFrequencyInputForOperation(i);
            await expect(freqInput).toBeVisible({ timeout: 5000 });
            await expect(freqInput).toBeEnabled({ timeout: 5000 });
            await freqInput.fill(frequencies[freqIdx].toString());
            freqIdx++;
        }
    }


    // Set afficher le score
    if (afficherScore !== undefined) {
        const scoreToggle = fixture.getAfficherScoreToggle();
        const checked = await scoreToggle.getAttribute('ng-reflect-checked');
        if (afficherScore && checked !== 'true') {
            await scoreToggle.click();
        } else if (!afficherScore && checked === 'true') {
            await scoreToggle.click();
        }
    }

    // Set afficher les fautes
    if (afficherFautes !== undefined) {
        const fautesToggle = fixture.getAfficherFautesToggle();
        const checked = await fautesToggle.getAttribute('ng-reflect-checked');
        if (afficherFautes && checked !== 'true') {
            await fautesToggle.click();
        } else if (!afficherFautes && checked === 'true') {
            await fautesToggle.click();
        }
    }

    // Set chiffres en lettre
    if (chiffresEnLettre !== undefined) {
        const chiffresToggle = fixture.getChiffresEnLettreToggle();
        const checked = await chiffresToggle.getAttribute('ng-reflect-checked');
        if (chiffresEnLettre && checked !== 'true') {
            await chiffresToggle.click();
        } else if (!chiffresEnLettre && checked === 'true') {
            await chiffresToggle.click();
        }
    }
    // Set montrer les réponses
    if (montrerLesReponses !== undefined) {
        const montrerToggle = fixture.getMontrerLesReponsesToggle();
        const checked = await montrerToggle.getAttribute('ng-reflect-checked');
        if (montrerLesReponses && checked !== 'true') {
            await montrerToggle.click();
        } else if (!montrerLesReponses && checked === 'true') {
            await montrerToggle.click();
        }
    }
}

export async function runGame(
    page: Page,
    expectedRegexes: RegExp[],
    numQuestions: number,
    options: {
        afficherScore?: boolean;
        afficherFautes?: boolean;
        chiffresEnLettre?: boolean;
        frequencies?: number[];
        toggles?: boolean[];
        enableMistakes?: boolean;
        numWrongAnswersToSubmit?: number;
        childIndex?: number;
    } = {}
) {
    const { afficherScore, afficherFautes, chiffresEnLettre, frequencies, enableMistakes, numWrongAnswersToSubmit, childIndex } = options;

    // Go to home and select child
    const accueilButton = page.getByText('Accueil', { exact: true });
    await expect(accueilButton).toBeVisible({ timeout: 5000 });
    await accueilButton.click();

    await page.getByText('Je suis un enfant').click();
    const childCard2 = typeof childIndex === 'number'
        ? page.locator('.user-card:not(.add-user-card)').nth(childIndex)
        : page.locator('.user-card:not(.add-user-card)').first();
    await expect(childCard2).toBeVisible({ timeout: 10000 });
    await childCard2.click();
    await page.getByText(/jouer/i).click();
    await page.getByText(/démarrer/i).click();
    const gamePage = page.getByTestId('question-text');
    let answeredQuestions = 0;

    // For frequency check
    const questionTypeCounts: number[] = Array(expectedRegexes.length).fill(0);
    let wrongAnswersSubmitted = 0;
    const maxWrongAnswers = numWrongAnswersToSubmit ?? 0;

    while (answeredQuestions < numQuestions) {
        const podiumVisible = await page.getByText(/Félicitations/i).isVisible({ timeout: 500 }).catch(() => false);
        if (podiumVisible) break;

        if (!(await gamePage.isVisible({ timeout: 2000 }).catch(() => false))) break;
        const questionText = (await gamePage.textContent())?.trim() || '';
        expect(questionText.length).toBeGreaterThan(0);

        // Accept any enabled type and count which type was picked
        let matchedType = -1;
        for (let idx = 0; idx < expectedRegexes.length; idx++) {
            if (expectedRegexes[idx].test(questionText)) {
                matchedType = idx;
                questionTypeCounts[idx]++;
                break;
            }
        }
        expect(matchedType !== -1, `Unexpected question: "${questionText}"`).toBeTruthy();

        const answer = computeAnswerFromQuestion(questionText, !!chiffresEnLettre);
        const inputSpans = page.locator('.answer span');
        const spanCount = await inputSpans.count();
        let submittedWrong = false;

        // --- SUBMIT WRONG ANSWER IF NEEDED ---
        if (wrongAnswersSubmitted < maxWrongAnswers) {
            // Type a wrong answer (e.g., all 'a's or wrong digits)
            for (let i = 0; i < answer.length && i < spanCount; i++) {
                // Pick a wrong char (not the correct one)
                let wrongChar = answer[i] === 'a' ? 'b' : 'a';
                if (/\d/.test(answer[i])) {
                    wrongChar = answer[i] === '1' ? '2' : '1';
                }
                await page.keyboard.press(wrongChar);
                await page.waitForTimeout(30);
            }
            // Submit the wrong answer
            await page.keyboard.press('Enter');
            await page.waitForTimeout(200);

            wrongAnswersSubmitted++;
            answeredQuestions++;
            continue;
        }

        // --- NORMAL ANSWER FLOW ---
        for (let i = 0; i < answer.length; i++) {
            const char = answer[i];

            // --- MISTAKE LOGIC not submitted ---
            if (enableMistakes) {
                if (i === 0 && answeredQuestions % 2 === 1) {
                    const wrongChar = char === 'a' ? 'b' : 'a';
                    await page.keyboard.press(wrongChar);
                    await page.waitForTimeout(50);

                    if (afficherFautes) {
                        const currentSpan = inputSpans.nth(i);
                        const classList = await currentSpan.getAttribute('class');
                        // Accept 'wrong', 'pending', or 'pending cursor' for mistake
                        expect(classList).toMatch(/wrong|pending|cursor/);
                    }

                    await page.keyboard.press('Backspace');
                    await page.waitForTimeout(50);
                }
            }

            await page.keyboard.press(char);
            await page.waitForTimeout(10);

            // If this is the last character, sometimes press Enter instead of waiting for autosubmit
            if (enableMistakes && i === answer.length - 1 && answeredQuestions % 3 === 2) {
                await page.keyboard.press('Enter');
                await page.waitForTimeout(100);
                break;
            }

            // If this is the last character, check if the question was autosubmitted or changed
            if (i === answer.length - 1) {
                const stillVisible = await gamePage.isVisible({ timeout: 500 }).catch(() => false);
                const currentQuestionText = stillVisible ? (await gamePage.textContent())?.trim() : '';
                if (!stillVisible || currentQuestionText !== questionText) {
                    // Autosubmitted or question changed (possibly same question generated twice): skip color check for this character
                    continue;
                }
            }

            // Check the color of the current letter
            const currentSpan = inputSpans.nth(i);
            const classList = await currentSpan.getAttribute('class');
            if (afficherFautes) {
                if (char === answer[i]) {
                    // Accept 'pending', 'pending cursor', or 'correct'
                    expect(classList).toMatch(/pending|cursor|correct/);
                } else {
                    // Accept 'pending', 'pending cursor', or 'wrong'
                    expect(classList).toMatch(/pending|cursor|wrong/);
                }
            } else {
                if (!classList?.includes('pending')) {
                    expect(classList).toContain('neutral');
                }
            }
        }
        await page.waitForTimeout(40);

        const stillVisible = await gamePage.isVisible({ timeout: 500 }).catch(() => false);
        if (!stillVisible) break;
        const questionAfter = (await gamePage.textContent())?.trim() || '';
        if (questionAfter === questionText) {
            await page.keyboard.press('Enter');
            await page.waitForTimeout(50);
        }
        if (!(await gamePage.isVisible({ timeout: 1000 }).catch(() => false))) break;
        answeredQuestions++;
    }
    await expect(page.getByText(/Félicitations/i)).toBeVisible({ timeout: 10000 });
    const accueilButtonOnPodium = page.getByText('Accueil', { exact: true });
    await expect(accueilButtonOnPodium).toBeVisible({ timeout: 10000 });
    await accueilButtonOnPodium.click();

    // Frequency check (only if enough questions and frequencies are provided)
    if (numQuestions >= 20 && Array.isArray(frequencies) && frequencies.length === expectedRegexes.length) {
        const totalFreq = frequencies.reduce((a, b) => a + b, 0);
        for (let idx = 0; idx < frequencies.length; idx++) {
            const expectedRatio = frequencies[idx] / totalFreq;
            const observedRatio = questionTypeCounts[idx] / answeredQuestions;
            // Allow a 15% margin due to randomness
            const margin = 0.15;
            if (frequencies[idx] > 0) {
                expect(
                    Math.abs(observedRatio - expectedRatio) < margin,
                    `Observed ratio for type ${idx} (${observedRatio}) differs from expected (${expectedRatio}) by more than ${margin}`
                ).toBeTruthy();
            }
        }
    }
}
async function addChild(page: Page, firstName: string, lastName: string, age: string) {
    await page.goto(`${testUrl}/ergo-play`);
    await page.locator('.add-user-card').click();
    await page.fill('input#lastName', lastName);
    await page.fill('input#firstName', firstName);
    await page.fill('input#age', age);
    // Select at least one condition if required by your form
    await page.locator('.troubles-dropdown').selectOption({ index: 0 });
    await page.getByText('Sauvegarder').click();
    // Wait for navigation or confirmation
    //await expect(page).toHaveURL(/ergo-stat-selected/);
    // Go back to /ergo-play for next child
    await page.goto(`${testUrl}/ergo-play`);
    console.log(`Added child: ${firstName} ${lastName}, age ${age}`);
}

export async function setupAndRunGame(
    page: Page,
    config: ConfigParams & {
        expectedRegexes: RegExp[];
        numQuestions: number;
        runGameOptions?: { afficherScore?: boolean; afficherFautes?: boolean; chiffresEnLettre?: boolean; frequencies?: number[]; toggles?: boolean[], enableMistakes?: boolean; childIndex?: number; numWrongAnswersToSubmit?: number; };
    }
) {
    await setupConfig(page, config);
    await runGame(
        page,
        config.expectedRegexes,
        config.numQuestions,
        config.runGameOptions ?? {
            afficherScore: config.afficherScore,
            afficherFautes: config.afficherFautes,
            chiffresEnLettre: config.chiffresEnLettre,
            frequencies: config.frequencies,
            toggles: config.toggles,
            enableMistakes: config.enableMistakes,
            numWrongAnswersToSubmit: config.numWrongAnswersToSubmit,
            childIndex: config.childIndex
        }
    );
}