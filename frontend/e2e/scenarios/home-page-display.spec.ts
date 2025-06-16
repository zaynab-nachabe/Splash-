import { test, expect, Page } from '@playwright/test';
import { testUrl } from 'e2e/e2e.config';
import { AppFixture } from 'src/app/app.fixture';


// Fixture for the welcome page
class WelcomePageFixture {
  constructor(private page: Page) {}

  getTitle() {
    // Heading with "SPLASH !!"
    return this.page.getByRole('heading', { name: 'SPLASH !!' });
  }

  getErgoButton() {
    // If <app-big-button> is not a native button, fallback to getByText
    return this.page.getByText('Je suis un ergothérapeute');
  }

  getChildButton() {
    return this.page.getByText('Je suis un enfant');
  }
}

// https://playwright.dev/docs/locators
test.describe('Welcome page display', () => {
  test('Basic test', async ({ page }) => {
    await page.goto(testUrl);
    const welcomePage = new WelcomePageFixture(page);

    // Using locators functions:
    const title = await welcomePage.getTitle();
    const ergoButton = await welcomePage.getErgoButton();
    const childButton = await welcomePage.getChildButton();

    expect(title).toBeVisible();
    expect(ergoButton).toBeVisible();
    expect(childButton).toBeVisible();
  });
});



/*
// https://playwright.dev/docs/locators
test.describe('Home page display', () => {
  test('Basic test', async ({ page }) => {
    await page.goto(testUrl);
    const appComponentFixture = new AppFixture(page);
    // Using locators functions:
    // Using page element role: see the function declaration
    const title = await appComponentFixture.getTitle();

    // Search by text content. Partial and exact text.
    const description1 = await page.getByText('Start your');

    // For exact text: see the function declaration
    const description2 = await appComponentFixture.getDescription();

    // Using page.locator
    const description3 = await page.locator(
      'div.description:has-text("Start your first app!")'
    );

    expect(title).toBeVisible();
    expect(description1).toBeVisible();
    expect(description2).toBeVisible();
    expect(description3).toBeVisible();

    // Error case : uncomment the two lines below : "Starting" does not exist
    // const description4 = await page.getByText('Starting your first app');
    // expect(description4).toBeVisible();

    // Success not visible
    let success = await appComponentFixture.getSuccessMessage();

    // Success message should not be visible - we haven't clicked yet.
    expect(success).not.toBeVisible();

    // Triggers events
    const showSuccessButton = await appComponentFixture.getShowButton();
    await showSuccessButton.click();
    success = await appComponentFixture.getSuccessMessage();

    // Success message should be visible now!
    expect(success).toBeVisible();

    // Another way to click on a button is to expose a function doing the click directly and avoid the two lines 35 and 36.
    await appComponentFixture.clickOnShowButton();
    success = await appComponentFixture.getSuccessMessage();
    // Success message shouldn't be visible again.
    expect(success).not.toBeVisible();
  });

  // TO GO FURTHER :
  // Check the PS6-CORRECTION repo : https://github.com/NablaT/ps6-correction-td1-td2-v2/blob/master/front-end/e2e/scenarios/create-quiz.spec.ts
});

*/