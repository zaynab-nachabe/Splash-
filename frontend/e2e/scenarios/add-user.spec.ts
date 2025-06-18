import { test, expect } from '@playwright/test';

test.describe('Add User Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200');
    await page.waitForLoadState('networkidle');
  });

  test('should successfully create a new user', async ({ page }) => {
    try {
      await page.locator('app-big-button', { hasText: 'Je suis un ergothérapeute' }).click();
      await page.waitForTimeout(500);

      await page.locator('.user-card.add-user-card').click();
      
      await page.locator('#firstName').fill('le petit');
      await page.locator('#lastName').fill('enfant');
      await page.locator('#age').fill('8');
      await page.locator('.troubles-dropdown').selectOption('Dyslexie');
      await page.locator('.icon-option').first().click();

      await page.getByText('Sauvegarder').click();
      
      await page.waitForSelector('.user-list-container .user-grid');
      
      const newUserCard = page.locator('.user-grid .user-card .user-content', {
        has: page.locator('.user-name', { hasText: 'le petit enfant' })
      });
      
      await expect(newUserCard).toBeVisible();

      console.log('Test completed successfully');
    } catch (error) {
      console.error('Test failed:', error);
      await page.screenshot({ path: 'test-failure-add-user.png' });
      throw error;
    }
  });

  test('should stay on input page when form is incomplete', async ({ page }) => {
    try {
      await page.locator('app-big-button', { hasText: 'Je suis un ergothérapeute' }).click();
      await page.locator('.user-card.add-user-card').click();
      
      await page.locator('#firstName').fill('le petit');
      
      await page.getByText('Sauvegarder').click();
      
      await expect(page.locator('#firstName')).toBeVisible();
      
      expect(page.url()).toContain('ergo-input-child');

      console.log('Validation test completed successfully');
    } catch (error) {
      console.error('Test failed:', error);
      await page.screenshot({ path: 'test-failure-validation.png' });
      throw error;
    }
  });
});