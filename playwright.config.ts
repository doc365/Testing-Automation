import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Read from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './tests',
  /* Maximum time one test can run for */
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI (2 retries), local dev (0 retries for fast feedback) */
  retries: process.env.CI ? 2 : 0,
  /* Worker optimization: CI gets 2 workers, local machine gets 4 workers */
  workers: process.env.CI ? 2 : 4,
  /* Output directory for test artifacts */
  outputDir: './test-results',
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
    ['./src/reporters/jira.reporter.ts'],
    ['./src/reporters/n8n.reporter.ts']
  ],
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_UI_URL || 'https://www.saucedemo.com',

    /* Collect trace & video only when failed to conserve disk space */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    /* Action timeout: fail fast on stuck clicks (10s max) */
    actionTimeout: 10 * 1000,
    navigationTimeout: 15 * 1000,
  },

  /* Configure projects for major browsers */
  projects: [
    // 1. Setup project to authenticate once
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // 2. API tests (runs fast without browser)
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: process.env.BASE_API_URL || 'https://reqres.in/api/',
      },
    },
    // 3. UI tests reusing authenticated session
    {
      name: 'chromium',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
    },
  ],
});
