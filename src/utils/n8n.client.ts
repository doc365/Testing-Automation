export interface TestEventPayload {
  event: 'TEST_PASSED' | 'TEST_FAILED';
  scenarioName: string;
  testFile: string;
  durationMs: number;
  errorMessage?: string;
  errorStack?: string;
  timestamp: string;
}

export interface SuiteSummaryPayload {
  event: 'SUITE_SUMMARY';
  status: 'PASSED' | 'FAILED' | 'TIMEDOUT' | 'INTERRUPTED';
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  durationSeconds: number;
  reportUrl?: string;
  timestamp: string;
  failedScenarios: Array<{
    title: string;
    file: string;
    error: string;
  }>;
}

export class N8nClient {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook-test/test-events';
  }

  /**
   * Dispatches a single test failure event
   */
  async sendTestEvent(payload: TestEventPayload): Promise<boolean> {
    return this.postPayload(payload);
  }

  /**
   * Dispatches the full test suite summary (whether it passed or failed)
   */
  async sendSuiteSummary(payload: SuiteSummaryPayload): Promise<boolean> {
    return this.postPayload(payload);
  }

  private async postPayload(payload: any): Promise<boolean> {
    if (!process.env.N8N_WEBHOOK_URL) {
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log(`📡 [n8n] Test suite summary dispatched successfully to n8n!`);
        return true;
      } else {
        console.warn(`⚠️ [n8n] Webhook responded with status: ${response.status}`);
        return false;
      }
    } catch (err: any) {
      console.log(`ℹ️ [n8n] Webhook server unreachable at ${this.webhookUrl} (n8n might not be running)`);
      return false;
    }
  }
}
