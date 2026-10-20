import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { InventoryPage } from '../../src/pages/inventory.page';

// Clear storageState for login tests so they start unauthenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('UI Smoke Suite - Authentication', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.goto();
  });

  test('Valid Login - should successfully reach products inventory', async ({ page }) => {
    // Act
    await loginPage.login('standard_user', 'secret_sauce');

    // Assert URL and inventory screen
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(inventoryPage.titleHeader).toHaveText('Products');

    // Assert that inventory items are displayed
    const count = await inventoryPage.getItemCount();
    expect(count).toBeGreaterThan(0);
  });

  test('Invalid Login - should display an error message', async () => {
    // Act with invalid credentials
    await loginPage.login('locked_out_user', 'secret_sauce');

    // Assert error state
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Sorry, this user has been locked out.');
  });
});
