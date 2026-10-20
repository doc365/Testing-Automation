import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/login.page';

const authFile = 'playwright/.auth/user.json';

setup('authenticate user once', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Perform login once
  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');

  // Verify successful authentication
  await expect(page).toHaveURL(/.*inventory.html/);

  // Save authenticated cookies & storage to disk
  await page.context().storageState({ path: authFile });
});
