import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  reporter: [['html', { open: 'always' }]],
  workers: 1,
  use: {
    //headless: false,
baseURL: process.env['PLAYWRIGHT_TEST_BASE_URL'] || 'http://frontend-test',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
    launchOptions: {
      //slowMo: 1000,
    }
  },
};

export default config;