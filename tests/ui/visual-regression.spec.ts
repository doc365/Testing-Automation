import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';

// Visual regression testing on login screen requires unauthenticated state
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Visual Regression Testing - Pixel-by-Pixel Verification', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    // Ensure login button is fully rendered and stable before taking snapshots
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('Component Visual Check: Login Button matches design specs', async () => {
    // Captures only the button element and compares against golden screenshot
    await expect(loginPage.loginButton).toHaveScreenshot('login-button-baseline.png', {
      maxDiffPixelRatio: 0.02, // Allow up to 2% pixel tolerance for font anti-aliasing
    });
  });

  test('Page Visual Check: Entire Login Landing Page matches design baseline', async ({ page }) => {
    // Captures full page screenshot and validates DOM styling, layout, alignment
    await expect(page).toHaveScreenshot('login-page-full-baseline.png', {
      maxDiffPixelRatio: 0.03,
      animations: 'disabled', // Freezes CSS animations for deterministic comparison
    });
  });
});
