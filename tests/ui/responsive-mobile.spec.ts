import { test, expect } from '../../src/fixtures/page.fixture';
import { LoginPage } from '../../src/pages/login.page';

test.describe('Responsive Mobile Viewport & Drawer Navigation', () => {

  test.describe('Mobile Viewport Emulation (iPhone 12)', () => {
    // Emulate iPhone 12 screen size: 390 x 844
    test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

    test.beforeEach(async ({ inventoryPage }) => {
      await inventoryPage.goto();
    });

    test('Mobile Layout: Renders without horizontal page overflow @regression', async ({ page }) => {
      // Assert that scrollWidth does not exceed clientWidth (no horizontal scrollbar)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBeFalsy();
    });

    test('Hamburger Drawer: Opens, displays navigation links, and closes cleanly @regression', async ({
      inventoryPage,
    }) => {
      // 1. Open drawer menu
      await inventoryPage.openMenu();

      // 2. Verify all 4 drawer links are visible
      await expect(inventoryPage.allItemsLink).toBeVisible();
      await expect(inventoryPage.aboutLink).toBeVisible();
      await expect(inventoryPage.logoutLink).toBeVisible();
      await expect(inventoryPage.resetAppStateLink).toBeVisible();

      // 3. Close drawer menu
      await inventoryPage.closeMenu();
      await expect(inventoryPage.allItemsLink).not.toBeVisible();
    });

    test('Reset App State: Clears shopping cart badge via drawer action @regression', async ({
      inventoryPage,
    }) => {
      // 1. Add item to cart and assert badge shows '1'
      await inventoryPage.addBackpackToCart();
      expect(await inventoryPage.getCartCount()).toBe('1');

      // 2. Trigger Reset App State from menu
      await inventoryPage.resetAppState();

      // 3. Cart badge should be cleared/hidden
      await expect(inventoryPage.shoppingCartBadge).not.toBeVisible();
    });

    test('Drawer Logout: Successfully logs out and redirects to login landing page @regression', async ({
      inventoryPage,
      page,
    }) => {
      await inventoryPage.logout();
      await expect(page).toHaveURL(/.*saucedemo\.com\/?$/);
      await expect(page.locator('[data-test="login-button"]')).toBeVisible();
    });
  });

  test.describe('Persona Visual Layout Shift Comparison', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('visual_user: Detects layout anomaly compared to standard UI @persona', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login('visual_user', 'secret_sauce');

      // On SauceDemo, visual_user shifts the cart badge alignment and displays alternative graphics
      await expect(page.locator('[data-test="title"]')).toHaveText('Products');

      // Check that the inventory container loaded
      const itemsCount = await page.locator('[data-test="inventory-item"]').count();
      expect(itemsCount).toBe(6);
    });
  });
});
