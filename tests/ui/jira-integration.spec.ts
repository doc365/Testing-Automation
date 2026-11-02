import { test, expect } from '@playwright/test';
import { JiraClient } from '../../src/utils/jira.client';

test.describe('Jira Integration Showcase', () => {
  const jira = new JiraClient();

  test('Scenario-based Defect Detection: Condition triggers custom ticket', async () => {
    // Simulate checking a critical business rule (e.g., product price mismatch)
    const expectedPrice: number = 29.99;
    const actualPrice: number = 39.99; // Simulating a bug found in calculation

    if (actualPrice !== expectedPrice) {
      // Create Jira ticket immediately based on the specific business scenario
      const ticket = await jira.createBug({
        summary: 'Pricing Calculation Error in Checkout',
        scenarioName: 'Pricing Calculation Mismatch',
        testFile: 'tests/ui/jira-integration.spec.ts',
        errorMessage: `Business Rule Violation: Expected $${expectedPrice}, but found $${actualPrice}`,
        priority: 'Highest',
      });

      console.log(`Reported scenario bug to Jira: ${ticket?.key}`);
    }

    // Now fail the assertion to mark the test red
    expect(actualPrice).toBe(expectedPrice);
  });
});
