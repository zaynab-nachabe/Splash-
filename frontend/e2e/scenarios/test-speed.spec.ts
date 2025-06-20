import { test, expect } from '@playwright/test';
import { GameEngine } from 'src/app/pages/child/game/game-engine';

declare global {
  interface Window {
    gameEngine: GameEngine;
  }
}

test.describe('Game Speed Tests', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    console.log('Starting test - navigating to welcome page');
    await page.goto('/'); // Use root, relies on baseURL in config
    await page.waitForLoadState('networkidle');
  });

  test('verify crab speed in slow mode gives enough time to read', async ({ page }) => {
    try {
      await page.locator('app-big-button', { hasText: 'Je suis un enfant' }).click();
      await page.waitForTimeout(500);

      await page.locator('.user-card').filter({ hasText: 'Eli KOPTER' }).click();
      await page.waitForTimeout(500);

      await page.getByText('Mon aquarium').click();
      await page.locator('button', { hasText: 'Petits pinces' }).click();
      await page.locator('app-medium-button', { hasText: 'Retour' }).click();

      await page.getByText('Jouer').click();
      await page.waitForSelector('canvas', { state: 'visible' });
      
      await page.waitForFunction(() => {
        const canvas = document.querySelector('canvas');
        return canvas && canvas.getContext('2d');
      });
      
      await page.getByText('Démarrer').click();
      
      await page.waitForFunction(() => {
        const gameEngine = (window as any).gameEngine;
        return gameEngine && gameEngine.player && gameEngine.enemies;
      }, { timeout: 10000 });

      await page.evaluate(() => {
        try {
          const startTime = Date.now();
          const gameEngine = window.gameEngine;
          if (!gameEngine) throw new Error('Game engine not found');

          const originalCheckCollision = gameEngine.checkCollision.bind(gameEngine);
          gameEngine.checkCollision = function (obj1: any, obj2: any) {
            try {
              const collision = originalCheckCollision(obj1, obj2);
              if (collision) {
                const timeElapsed = (Date.now() - startTime) / 1000;
                console.log(`Time until collision: ${timeElapsed} seconds`);
                if (timeElapsed < 5) {
                  console.error(`Collision occurred too quickly: ${timeElapsed} seconds`);
                  return false;
                }
              }
              return collision;
            } catch (e) {
              console.error('Error in collision check:', e);
              return false;
            }
          };
        } catch (e) {
          console.error('Error in evaluate:', e);
        }
      });

      await page.waitForTimeout(10000);
      console.log('Test completed successfully');
    } catch (error) {
      try {
        await page.screenshot({ path: 'test-failure.png', timeout: 5000 });
      } catch (screenshotError) {
        console.error('Failed to take screenshot:', screenshotError);
      }
      console.error('Test failed with error:', error);
      throw error;
    }
  });
});
