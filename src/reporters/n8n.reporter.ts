import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import { N8nClient, TestEventPayload } from '../utils/n8n.client';

export default class N8nReporter implements Reporter {
  private n8nClient: N8nClient;

  constructor() {
    this.n8nClient = new N8nClient();
  }

  async onTestEnd(test: TestCase, result: TestResult): Promise<void> {
    // Only forward failed tests on their final retry
    const isFinalAttempt = result.retry === test.retries;

    if ((result.status === 'failed' || result.status === 'timedOut') && isFinalAttempt) {
      const payload: TestEventPayload = {
        event: 'TEST_FAILED',
        scenarioName: test.title,
        testFile: test.location.file,
        durationMs: result.duration,
        errorMessage: result.errors.map(e => e.message).join('\n'),
        errorStack: result.errors.map(e => e.stack).join('\n'),
        timestamp: new Date().toISOString(),
      };

      await this.n8nClient.sendTestEvent(payload);
    }
  }
}
