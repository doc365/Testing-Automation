import { test, expect } from '../../src/fixtures/page.fixture';
import { LoginPage } from '../../src/pages/login.page';

test.describe('Algorithmic Catalog Sorting & Filtering', () => {

  test.describe('Standard User Sorting Assertions', () => {
    test.beforeEach(async ({ inventoryPage }) => {
      // Uses pre-authenticated storageState
      await inventoryPage.goto();
    });

    test('Default Sorting State: Verified as Name (A to Z) on initial page load @smoke', async ({ inventoryPage }) => {
      const activeText = await inventoryPage.getActiveSortText();
      expect(activeText).toBe('Name (A to Z)');

      // Verify item count is 6
      const names = await inventoryPage.getAllProductNames();
      expect(names.length).toBe(6);

      // Verify the list matches natural A to Z sort
      const expectedSorted = [...names].sort((a, b) => a.localeCompare(b));
      expect(names).toEqual(expectedSorted);
    });

    test('Sort Name (A to Z): Alphabetical ascending order validation @regression', async ({ inventoryPage }) => {
      // Explicitly select A to Z
      await inventoryPage.selectSort('az');
      expect(await inventoryPage.getActiveSortText()).toBe('Name (A to Z)');

      const names = await inventoryPage.getAllProductNames();
      const expectedSorted = [...names].sort((a, b) => a.localeCompare(b));

      expect(names).toEqual(expectedSorted);
    });

    test('Sort Name (Z to A): Alphabetical descending order validation @regression', async ({ inventoryPage }) => {
      await inventoryPage.selectSort('za');
      expect(await inventoryPage.getActiveSortText()).toBe('Name (Z to A)');

      const names = await inventoryPage.getAllProductNames();
      const expectedSorted = [...names].sort((a, b) => b.localeCompare(a));

      expect(names).toEqual(expectedSorted);
      expect(names[0]).toBe('Test.allTheThings() T-Shirt (Red)');
    });

    test('Sort Price (low to high): Numeric ascending order validation @regression', async ({ inventoryPage }) => {
      await inventoryPage.selectSort('lohi');
      expect(await inventoryPage.getActiveSortText()).toBe('Price (low to high)');

      const pricesInCents = await inventoryPage.getAllProductPricesInCents();
      const expectedPrices = [...pricesInCents].sort((a, b) => a - b);

      expect(pricesInCents).toEqual(expectedPrices);
      // Smallest item is Onesie at $7.99 (799 cents)
      expect(pricesInCents[0]).toBe(799);
      // Largest item is Fleece Jacket at $49.99 (4999 cents)
      expect(pricesInCents[pricesInCents.length - 1]).toBe(4999);
    });

    test('Sort Price (high to low): Numeric descending order validation @regression', async ({ inventoryPage }) => {
      await inventoryPage.selectSort('hilo');
      expect(await inventoryPage.getActiveSortText()).toBe('Price (high to low)');

      const pricesInCents = await inventoryPage.getAllProductPricesInCents();
      const expectedPrices = [...pricesInCents].sort((a, b) => b - a);

      expect(pricesInCents).toEqual(expectedPrices);
      // Highest item is Fleece Jacket at $49.99 (4999 cents)
      expect(pricesInCents[0]).toBe(4999);
      // Lowest item is Onesie at $7.99 (799 cents)
      expect(pricesInCents[pricesInCents.length - 1]).toBe(799);
    });
  });

  test.describe('Special Persona Sorting Validations (Isolated Session)', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('problem_user: Asserts known defect where catalog sorting is broken @persona', async ({
      page,
      inventoryPage,
    }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login('problem_user', 'secret_sauce');

      // Attempt to sort Price (low to high)
      await inventoryPage.selectSort('lohi');

      const pricesInCents = await inventoryPage.getAllProductPricesInCents();
      const expectedPrices = [...pricesInCents].sort((a, b) => a - b);

      // On SauceDemo, problem_user's sort select is broken (fails to reorder products correctly)
      // We assert that the displayed order does NOT match the expected ascending sort
      expect(pricesInCents).not.toEqual(expectedPrices);
    });
  });
});
