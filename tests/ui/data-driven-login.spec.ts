import { test, expect } from '@playwright/test';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import { LoginPage } from '../../src/pages/login.page';
import { InventoryPage } from '../../src/pages/inventory.page';

// 1. Read and parse the CSV dataset synchronously before test definitions
const csvFilePath = path.resolve(__dirname, '../../test_data/users.csv');
const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
const records = parse(fileContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
}) as Array<{
  description: string;
  username: string;
  password: string;
  shouldSucceed: string;
  expectedError: string;
}>;

// 2. Each login test must start with a clean session (no pre-saved auth)
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Data-Driven Testing (CSV) - Multi-User Login Matrix', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // 3. Loop through every row in the CSV file
  for (const row of records) {
    const isSuccessExpected = row.shouldSucceed === 'true';

    test(`[CSV Matrix]: ${row.description} -> User: "${row.username}"`, async ({ page }) => {
      // Act: Attempt login with credentials from CSV
      await loginPage.login(row.username, row.password);

      if (isSuccessExpected) {
        // Assert: Successful login reaches inventory
        await expect(page).toHaveURL(/.*inventory.html/);
        const inventory = new InventoryPage(page);
        await expect(inventory.titleHeader).toHaveText('Products');
      } else {
        // Assert: Error message contains expected text
        await expect(loginPage.errorMessage).toBeVisible();
        await expect(loginPage.errorMessage).toContainText(row.expectedError);
      }
    });
  }
});
