import { Reporter, TestCase, TestResult, FullResult, FullConfig, Suite } from '@playwright/test/reporter';
import { N8nClient, SuiteSummaryPayload } from '../utils/n8n.client';

export default class N8nReporter implements Reporter {
  private n8nClient: N8nClient;
  private totalTests = 0;
  private passed = 0;
  private failed = 0;
  private skipped = 0;
  private startTime = 0;
  private failedScenarios: Array<{ title: string; file: string; error: string }> = [];

  constructor() {
    this.n8nClient = new N8nClient();
  }

  onBegin(config: FullConfig, suite: Suite): void {
    this.totalTests = suite.allTests().length;
    this.startTime = Date.now();
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const isFinalAttempt = result.retry === test.retries;

    if (result.status === 'passed') {
      this.passed++;
    } else if (result.status === 'skipped') {
      this.skipped++;
    } else if ((result.status === 'failed' || result.status === 'timedOut') && isFinalAttempt) {
      this.failed++;
      this.failedScenarios.push({
        title: test.title,
        file: test.location.file,
        error: result.errors.map(e => e.message).join('\n') || 'Unknown test failure',
      });
    }
  }

  async onEnd(result: FullResult): Promise<void> {
    const durationSeconds = Math.round((Date.now() - this.startTime) / 1000);
    const overallStatus = result.status === 'passed' ? 'PASSED' : 'FAILED';

    const summaryPayload: SuiteSummaryPayload = {
      event: 'SUITE_SUMMARY',
      status: overallStatus,
      totalTests: this.totalTests,
      passed: this.passed,
      failed: this.failed,
      skipped: this.skipped,
      durationSeconds: durationSeconds,
      timestamp: new Date().toISOString(),
      failedScenarios: this.failedScenarios,
    };

    console.log(`\n📊 [n8n Reporter] Test run completed with status: ${overallStatus} (${this.passed} passed, ${this.failed} failed)`);
    await this.n8nClient.sendSuiteSummary(summaryPayload);
  }
}
