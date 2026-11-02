import { test, expect } from '../../src/fixtures/page.fixture';

test.describe('External Social Links & Multi-Tab Handling', () => {

  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('Footer Links: Validate DOM href attributes and target=_blank safety @regression', async ({
    inventoryPage,
  }) => {
    // 1. Twitter/X Link Validation
    await expect(inventoryPage.twitterLink).toHaveAttribute('href', 'https://x.com/saucelabs');
    await expect(inventoryPage.twitterLink).toHaveAttribute('target', '_blank');

    // 2. Facebook Link Validation
    await expect(inventoryPage.facebookLink).toHaveAttribute('href', 'https://www.facebook.com/saucelabs');
    await expect(inventoryPage.facebookLink).toHaveAttribute('target', '_blank');

    // 3. LinkedIn Link Validation
    await expect(inventoryPage.linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/company/sauce-labs/');
    await expect(inventoryPage.linkedinLink).toHaveAttribute('target', '_blank');
  });

  test('Multi-Tab Instantiation: Controlled popup event verification @regression', async ({
    page,
    inventoryPage,
  }) => {
    // Intercept outbound navigation on new pages to prevent loading 3rd-party auth walls
    const pagePromise = page.context().waitForEvent('page');

    await inventoryPage.twitterLink.click();

    const popup = await pagePromise;

    // Verify popup tab was created with target URL
    await popup.waitForLoadState('domcontentloaded');
    expect(popup.url()).toContain('x.com');

    // Close the popup tab to avoid memory leak
    await popup.close();

    // Assert parent page remains intact on inventory
    await expect(inventoryPage.titleHeader).toHaveText('Products');
  });
});
