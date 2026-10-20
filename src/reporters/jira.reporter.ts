import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import { JiraClient } from '../utils/jira.client';

export default class JiraBugReporter implements Reporter {
  private jiraClient: JiraClient;
  private failedTestsToReport: Array<{ test: TestCase; result: TestResult }> = [];

  constructor() {
    this.jiraClient = new JiraClient();
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    // Only report on the final retry attempt to avoid spamming Jira with transient flakes
    const isFinalAttempt = result.retry === test.retries;

    if ((result.status === 'failed' || result.status === 'timedOut') && isFinalAttempt) {
      this.failedTestsToReport.push({ test, result });
    }
  }

  async onEnd(result: FullResult): Promise<void> {
    if (this.failedTestsToReport.length === 0) {
      return;
    }

    console.log(`\n📋 [Jira Reporter] Processing ${this.failedTestsToReport.length} failed scenario(s) for Jira ticket creation...`);

    for (const item of this.failedTestsToReport) {
      const scenarioTitle = item.test.title;
      const testFilePath = item.test.location.file;
      const errorMessage = item.result.errors.map(e => e.message).join('\n');
      const errorStack = item.result.errors.map(e => e.stack).join('\n');

      await this.jiraClient.createBug({
        summary: `[Automation Failure]: ${scenarioTitle}`,
        scenarioName: scenarioTitle,
        testFile: testFilePath,
        errorMessage: errorMessage,
        errorStack: errorStack,
        priority: 'High',
      });
    }
  }
}
