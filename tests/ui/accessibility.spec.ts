import { test, expect } from '../../src/fixtures/page.fixture';
import AxeBuilder from '@axe-core/playwright';

// Known baseline violations allowed per page (can be expanded if upstream site changes)
const KNOWN_A11Y_BASELINES: Record<string, string[]> = {
  login: [],
  inventory: [],
  cart: [],
  checkoutInfo: [],
  checkoutOverview: [],
  checkoutComplete: [],
};

test.describe('Baseline-Aware Accessibility Audits (WCAG 2.1 Level AA)', () => {

  test('Login Page: WCAG 2.1 AA Compliance Audit @a11y', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    // Attach all detected violations as report annotations for audit visibility
    for (const violation of scanResults.violations) {
      test.info().annotations.push({
        type: `[A11Y-${violation.impact?.toUpperCase() || 'INFO'}]`,
        description: `${violation.id}: ${violation.description} (${violation.nodes.length} occurrences)`,
      });
    }

    // Fail only if new critical/serious regressions exceed known baseline
    const unexpectedViolations = scanResults.violations.filter(
      (v) => (v.impact === 'critical' || v.impact === 'serious') && !KNOWN_A11Y_BASELINES.login.includes(v.id)
    );

    expect(unexpectedViolations).toEqual([]);
  });

  test('Inventory Page: WCAG 2.1 AA Compliance Audit @a11y', async ({ inventoryPage, page }) => {
    await inventoryPage.goto();

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    for (const violation of scanResults.violations) {
      test.info().annotations.push({
        type: `[A11Y-${violation.impact?.toUpperCase() || 'INFO'}]`,
        description: `${violation.id}: ${violation.description} (${violation.nodes.length} occurrences)`,
      });
    }

    const unexpectedViolations = scanResults.violations.filter(
      (v) => (v.impact === 'critical' || v.impact === 'serious') && !KNOWN_A11Y_BASELINES.inventory.includes(v.id)
    );

    expect(unexpectedViolations).toEqual([]);
  });

  test('Cart Page: WCAG 2.1 AA Compliance Audit @a11y', async ({ inventoryPage, cartPage, page }) => {
    await inventoryPage.goto();
    await inventoryPage.addBackpackToCart();
    await inventoryPage.openCart();

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    for (const violation of scanResults.violations) {
      test.info().annotations.push({
        type: `[A11Y-${violation.impact?.toUpperCase() || 'INFO'}]`,
        description: `${violation.id}: ${violation.description} (${violation.nodes.length} occurrences)`,
      });
    }

    const unexpectedViolations = scanResults.violations.filter(
      (v) => (v.impact === 'critical' || v.impact === 'serious') && !KNOWN_A11Y_BASELINES.cart.includes(v.id)
    );

    expect(unexpectedViolations).toEqual([]);
  });

  test('Checkout Info Page: WCAG 2.1 AA Compliance Audit @a11y', async ({ checkoutInfoPage, page }) => {
    await checkoutInfoPage.goto();

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    for (const violation of scanResults.violations) {
      test.info().annotations.push({
        type: `[A11Y-${violation.impact?.toUpperCase() || 'INFO'}]`,
        description: `${violation.id}: ${violation.description} (${violation.nodes.length} occurrences)`,
      });
    }

    const unexpectedViolations = scanResults.violations.filter(
      (v) => (v.impact === 'critical' || v.impact === 'serious') && !KNOWN_A11Y_BASELINES.checkoutInfo.includes(v.id)
    );

    expect(unexpectedViolations).toEqual([]);
  });

  test('Checkout Overview Page: WCAG 2.1 AA Compliance Audit @a11y', async ({
    inventoryPage,
    cartPage,
    checkoutInfoPage,
    page,
  }) => {
    await inventoryPage.goto();
    await inventoryPage.addBackpackToCart();
    await inventoryPage.openCart();
    await cartPage.proceedToCheckout();
    await checkoutInfoPage.fillInformation('Alex', 'QA', '70000');
    await checkoutInfoPage.submitContinue();

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    for (const violation of scanResults.violations) {
      test.info().annotations.push({
        type: `[A11Y-${violation.impact?.toUpperCase() || 'INFO'}]`,
        description: `${violation.id}: ${violation.description} (${violation.nodes.length} occurrences)`,
      });
    }

    const unexpectedViolations = scanResults.violations.filter(
      (v) => (v.impact === 'critical' || v.impact === 'serious') && !KNOWN_A11Y_BASELINES.checkoutOverview.includes(v.id)
    );

    expect(unexpectedViolations).toEqual([]);
  });

  test('Checkout Complete Page: WCAG 2.1 AA Compliance Audit @a11y', async ({
    inventoryPage,
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
    page,
  }) => {
    await inventoryPage.goto();
    await inventoryPage.addBackpackToCart();
    await inventoryPage.openCart();
    await cartPage.proceedToCheckout();
    await checkoutInfoPage.fillInformation('Alex', 'QA', '70000');
    await checkoutInfoPage.submitContinue();
    await checkoutOverviewPage.finishOrder();

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    for (const violation of scanResults.violations) {
      test.info().annotations.push({
        type: `[A11Y-${violation.impact?.toUpperCase() || 'INFO'}]`,
        description: `${violation.id}: ${violation.description} (${violation.nodes.length} occurrences)`,
      });
    }

    const unexpectedViolations = scanResults.violations.filter(
      (v) => (v.impact === 'critical' || v.impact === 'serious') && !KNOWN_A11Y_BASELINES.checkoutComplete.includes(v.id)
    );

    expect(unexpectedViolations).toEqual([]);
  });
});
