import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { InventoryPage } from '../../src/pages/inventory.page';

test.describe('UI Regression Suite - Shopping Cart Flow', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);

    // Arrange: Precondition - user must be logged in
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test('Add Product - should update cart badge to 1', async () => {
    // Act: Add the backpack product to cart
    await inventoryPage.addBackpackToCart();

    // Assert: Web-first assertion ensuring badge is visible and shows count 1
    await expect(inventoryPage.shoppingCartBadge).toBeVisible();
    await expect(inventoryPage.shoppingCartBadge).toHaveText('1');
  });
});
