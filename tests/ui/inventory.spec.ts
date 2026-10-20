import { test, expect } from '@playwright/test';
import { InventoryPage } from '../../src/pages/inventory.page';

test.describe('UI Regression Suite - Shopping Cart Flow', () => {
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    inventoryPage = new InventoryPage(page);

    // Arrange: Pre-authenticated! Go straight to inventory without login form
    await inventoryPage.goto();
  });

  test('Add Product - should update cart badge to 1', async () => {
    // Act: Add the backpack product to cart
    await inventoryPage.addBackpackToCart();

    // Assert: Web-first assertion ensuring badge is visible and shows count 1
    await expect(inventoryPage.shoppingCartBadge).toBeVisible();
    await expect(inventoryPage.shoppingCartBadge).toHaveText('1');
  });

  test('Remove Product - should remove cart badge when product is removed', async () => {
    // Arrange: Add item first
    await inventoryPage.addBackpackToCart();
    await expect(inventoryPage.shoppingCartBadge).toHaveText('1');

    // Act: Remove item
    await inventoryPage.removeBackpackFromCart();

    // Assert: Badge element should no longer be visible or attached in the DOM
    await expect(inventoryPage.shoppingCartBadge).not.toBeVisible();
  });
});
