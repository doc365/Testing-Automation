import { test, expect } from '../../src/fixtures/page.fixture';
import { CurrencyUtil } from '../../src/utils/currency.util';
import { LoginPage } from '../../src/pages/login.page';

test.describe('E2E Checkout & Purchase Flow', () => {

  test.describe('Standard User Happy Path & Calculations', () => {
    test.beforeEach(async ({ inventoryPage }) => {
      // Pre-authenticated session via storageState
      await inventoryPage.goto();
    });

    test('Single-Item Checkout: Purchase Sauce Labs Backpack with verified tax calculation @smoke @checkout', async ({
      inventoryPage,
      cartPage,
      checkoutInfoPage,
      checkoutOverviewPage,
      checkoutCompletePage,
    }) => {
      // 1. Add item to cart
      await inventoryPage.addBackpackToCart();
      expect(await inventoryPage.getCartCount()).toBe('1');

      // 2. Navigate to cart
      await inventoryPage.openCart();
      await expect(cartPage.titleHeader).toHaveText('Your Cart');
      expect(await cartPage.getItemCount()).toBe(1);

      // 3. Step 1: Customer Information
      await cartPage.proceedToCheckout();
      await expect(checkoutInfoPage.titleHeader).toHaveText('Checkout: Your Information');
      await checkoutInfoPage.fillInformation('Alex', 'QA', '70000');
      await checkoutInfoPage.submitContinue();

      // 4. Step 2: Overview & Calculation Integrity
      await expect(checkoutOverviewPage.titleHeader).toHaveText('Checkout: Overview');
      expect(await checkoutOverviewPage.getItemCount()).toBe(1);

      const itemSumCents = await checkoutOverviewPage.getItemPricesSumInCents();
      const subtotalCents = await checkoutOverviewPage.getSubtotalInCents();
      const taxCents = await checkoutOverviewPage.getTaxInCents();
      const totalCents = await checkoutOverviewPage.getTotalInCents();

      // Assert price integrity with integer cents arithmetic
      expect(subtotalCents).toBe(itemSumCents);
      const expectedTaxCents = CurrencyUtil.calculateTaxInCents(subtotalCents);
      expect(taxCents).toBe(expectedTaxCents);
      expect(totalCents).toBe(subtotalCents + taxCents);

      // 5. Complete Order
      await checkoutOverviewPage.finishOrder();
      await expect(checkoutCompletePage.titleHeader).toHaveText('Checkout: Complete!');
      const confirmationText = await checkoutCompletePage.getConfirmationMessage();
      expect(confirmationText.toLowerCase()).toContain('thank you for your order');
    });

    test('Multi-Item Checkout: Add 3 items and assert itemized math integrity @regression', async ({
      inventoryPage,
      cartPage,
      checkoutInfoPage,
      checkoutOverviewPage,
      checkoutCompletePage,
    }) => {
      // 1. Add multiple items
      await inventoryPage.addMultipleItemsToCart();
      expect(await inventoryPage.getCartCount()).toBe('3');

      // 2. Open cart and proceed
      await inventoryPage.openCart();
      expect(await cartPage.getItemCount()).toBe(3);
      await cartPage.proceedToCheckout();

      // 3. Fill shipping info
      await checkoutInfoPage.fillInformation('Jane', 'Smith', '94105');
      await checkoutInfoPage.submitContinue();

      // 4. Verify multi-item pricing math
      expect(await checkoutOverviewPage.getItemCount()).toBe(3);

      const itemSumCents = await checkoutOverviewPage.getItemPricesSumInCents();
      const subtotalCents = await checkoutOverviewPage.getSubtotalInCents();
      const taxCents = await checkoutOverviewPage.getTaxInCents();
      const totalCents = await checkoutOverviewPage.getTotalInCents();

      expect(subtotalCents).toBe(itemSumCents);
      expect(taxCents).toBe(CurrencyUtil.calculateTaxInCents(subtotalCents));
      expect(totalCents).toBe(subtotalCents + taxCents);

      // 5. Finish and return home
      await checkoutOverviewPage.finishOrder();
      await expect(checkoutCompletePage.titleHeader).toHaveText('Checkout: Complete!');
      await checkoutCompletePage.backToHome();
      await expect(inventoryPage.titleHeader).toHaveText('Products');
    });

    test('Navigation Cancel: Cancel buttons safely route to previous steps @regression', async ({
      inventoryPage,
      cartPage,
      checkoutInfoPage,
      checkoutOverviewPage,
      page,
    }) => {
      await inventoryPage.addBackpackToCart();
      await inventoryPage.openCart();

      // Cancel from Step 1 -> Should return to Cart
      await cartPage.proceedToCheckout();
      await checkoutInfoPage.cancelCheckout();
      await expect(page).toHaveURL(/.*cart\.html/);

      // Cancel from Step 2 -> Should return to Inventory
      await cartPage.proceedToCheckout();
      await checkoutInfoPage.fillInformation('Test', 'User', '12345');
      await checkoutInfoPage.submitContinue();
      await expect(page).toHaveURL(/.*checkout-step-two\.html/);

      await checkoutOverviewPage.cancelOrder();
      await expect(page).toHaveURL(/.*inventory\.html/);
    });

    test('Form Boundary Validations: Validates required fields with specific error messages @regression', async ({
      inventoryPage,
      cartPage,
      checkoutInfoPage,
    }) => {
      await inventoryPage.addBackpackToCart();
      await inventoryPage.openCart();
      await cartPage.proceedToCheckout();

      // 1. Missing first name
      await checkoutInfoPage.fillInformation('', 'Tester', '12345');
      await checkoutInfoPage.submitContinue();
      expect(await checkoutInfoPage.getErrorMessage()).toContain('First Name is required');

      // 2. Missing last name
      await checkoutInfoPage.fillInformation('Tester', '', '12345');
      await checkoutInfoPage.submitContinue();
      expect(await checkoutInfoPage.getErrorMessage()).toContain('Last Name is required');

      // 3. Missing postal code
      await checkoutInfoPage.fillInformation('Tester', 'QA', '');
      await checkoutInfoPage.submitContinue();
      expect(await checkoutInfoPage.getErrorMessage()).toContain('Postal Code is required');
    });
  });

  test.describe('Special Persona Validations (Isolated Sessions)', () => {
    // These tests use custom logins without reusing standard_user auth state
    test.use({ storageState: { cookies: [], origins: [] } });

    test('problem_user: Asserts known defect on checkout last name field @persona', async ({
      page,
      inventoryPage,
      cartPage,
      checkoutInfoPage,
    }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login('problem_user', 'secret_sauce');

      await inventoryPage.addBackpackToCart();
      await inventoryPage.openCart();
      await cartPage.proceedToCheckout();

      // On SauceDemo, problem_user locks the Last Name input field (cannot be modified)
      await checkoutInfoPage.fillInformation('John', 'Doe', '12345');
      await checkoutInfoPage.submitContinue();

      // Expect the known bug: Last Name remains empty or throws validation error
      const errorMsg = await checkoutInfoPage.getErrorMessage();
      expect(errorMsg).toContain('Last Name is required');
    });

    test('error_user: Asserts known defect where order completion is blocked @persona', async ({
      page,
      inventoryPage,
      cartPage,
      checkoutInfoPage,
      checkoutOverviewPage,
      checkoutCompletePage,
    }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login('error_user', 'secret_sauce');

      await inventoryPage.addBackpackToCart();
      await inventoryPage.openCart();
      await cartPage.proceedToCheckout();

      await checkoutInfoPage.fillInformation('Jane', 'Error', '54321');
      await checkoutInfoPage.submitContinue();

      await expect(checkoutOverviewPage.titleHeader).toHaveText('Checkout: Overview');

      // On SauceDemo, error_user fails when clicking finish
      await checkoutOverviewPage.finishOrder();

      // Verify that finish did NOT reach complete page successfully (known defect)
      const isCompleteVisible = await checkoutCompletePage.completeHeader.isVisible().catch(() => false);
      expect(isCompleteVisible).toBeFalsy();
    });
  });
});
