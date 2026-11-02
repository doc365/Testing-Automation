import { test, expect } from '../../src/fixtures/page.fixture';
import { LoginPage } from '../../src/pages/login.page';

test.describe('Network Resilience & Fault Injection', () => {

  test.describe('Client Asset Resilience & Degraded Network', () => {
    test.beforeEach(async ({ inventoryPage }) => {
      await inventoryPage.goto();
    });

    test('Asset Fault Injection: Page remains operable when all image assets are blocked @resilience', async ({
      page,
      inventoryPage,
    }) => {
      // Intercept and abort all image requests (png, jpg, svg, webp)
      await page.route('**/*.{png,jpg,jpeg,svg,webp}', (route) => route.abort());

      await inventoryPage.goto();

      // Assert core DOM elements and interactive controls remain fully visible and usable
      await expect(inventoryPage.titleHeader).toHaveText('Products');
      expect(await inventoryPage.getItemCount()).toBe(6);

      // Verify user can still interact with buttons despite blocked images
      await inventoryPage.addBackpackToCart();
      expect(await inventoryPage.getCartCount()).toBe('1');
    });

    test('Stylesheet Fault Injection: Semantic HTML and navigation operate under blocked CSS @resilience', async ({
      page,
      inventoryPage,
    }) => {
      // Intercept and abort external CSS stylesheets
      await page.route('**/*.css', (route) => route.abort());

      await inventoryPage.goto();

      // Verify that critical semantic elements still load into the DOM
      const title = await inventoryPage.titleHeader.textContent();
      expect(title).toBe('Products');

      const itemsCount = await inventoryPage.getItemCount();
      expect(itemsCount).toBe(6);
    });

    test('Offline Mode Simulation: Verify application state when connection is severed @resilience', async ({
      page,
      inventoryPage,
      context,
    }) => {
      // 1. Initial load while online
      await inventoryPage.goto();
      await expect(inventoryPage.titleHeader).toHaveText('Products');

      // 2. Sever network connection
      await context.setOffline(true);

      // 3. Client-side actions still operate within cached SPA memory
      await inventoryPage.addBackpackToCart();
      expect(await inventoryPage.getCartCount()).toBe('1');

      // 4. Attempting a full page reload offline throws network disconnect
      let reloadFailed = false;
      try {
        await page.reload({ timeout: 3000 });
      } catch (err: any) {
        reloadFailed = true;
        expect(err.message).toMatch(/(ERR_INTERNET_DISCONNECTED|net::ERR_|NS_ERROR_OFFLINE)/i);
      }
      expect(reloadFailed).toBeTruthy();

      // 5. Restore connection
      await context.setOffline(false);
    });
  });

  test.describe('API Layer Fault Injection (ReqRes Backend)', () => {
    test('Backend API Outage Simulation: Synthetic 500 Internal Server Error injection @resilience', async ({
      page,
    }) => {
      // Intercept in-page fetch/XHR network calls
      await page.route('**/api/users*', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'InternalServerError',
            message: 'Synthetic failure injected by QA test automation',
          }),
        });
      });

      // Trigger the request inside the page execution context where page.route applies
      const response = await page.evaluate(async () => {
        const res = await fetch('https://reqres.in/api/users?page=1');
        return {
          status: res.status,
          body: await res.json(),
        };
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('InternalServerError');
      expect(response.body.message).toContain('Synthetic failure injected');
    });

    test('Backend Service Unavailable Simulation: Synthetic 503 Gateway Down injection @resilience', async ({
      page,
    }) => {
      await page.route('**/api/users/2', async (route) => {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'ServiceUnavailable',
            message: 'Database connection pool exhausted',
          }),
        });
      });

      const response = await page.evaluate(async () => {
        const res = await fetch('https://reqres.in/api/users/2');
        return {
          status: res.status,
          body: await res.json(),
        };
      });

      expect(response.status).toBe(503);
      expect(response.body.error).toBe('ServiceUnavailable');
    });
  });

  test.describe('Performance Degradation & User Persona Benchmarks', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('performance_glitch_user: Differential login latency benchmark vs standard baseline @persona', async ({
      page,
      inventoryPage,
    }) => {
      const loginPage = new LoginPage(page);

      // 1. Measure standard_user duration until inventory items are rendered
      await loginPage.goto();
      const standardStart = Date.now();
      await loginPage.login('standard_user', 'secret_sauce');
      await inventoryPage.inventoryItems.first().waitFor({ state: 'visible' });
      const standardDuration = Date.now() - standardStart;

      // Clear cookies and storage for a fresh session
      await page.context().clearCookies();
      await page.evaluate(() => {
        window.localStorage.clear();
        window.sessionStorage.clear();
      });

      // 2. Measure performance_glitch_user duration until inventory items are rendered
      await loginPage.goto();
      const glitchStart = Date.now();
      await loginPage.login('performance_glitch_user', 'secret_sauce');
      await inventoryPage.inventoryItems.first().waitFor({ state: 'visible' });
      const glitchDuration = Date.now() - glitchStart;

      // 3. Assert differential benchmark:
      // SauceDemo holds back inventory rendering by 5000ms for performance_glitch_user
      const latencyDelta = glitchDuration - standardDuration;
      expect(latencyDelta).toBeGreaterThanOrEqual(3000);
      expect(glitchDuration).toBeGreaterThanOrEqual(4500);
    });
  });
});
