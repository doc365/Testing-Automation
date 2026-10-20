export interface TestEventPayload {
  event: 'TEST_PASSED' | 'TEST_FAILED';
  scenarioName: string;
  testFile: string;
  durationMs: number;
  errorMessage?: string;
  errorStack?: string;
  timestamp: string;
}

export class N8nClient {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook-test/test-events';
  }

  /**
   * Dispatches a test event payload to your local or cloud n8n webhook
   */
  async sendTestEvent(payload: TestEventPayload): Promise<boolean> {
    if (!process.env.N8N_WEBHOOK_URL) {
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s safety timeout

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log(`📡 [n8n] Successfully dispatched "${payload.scenarioName}" to n8n webhook`);
        return true;
      } else {
        console.warn(`⚠️ [n8n] Webhook responded with status: ${response.status}`);
        return false;
      }
    } catch (err: any) {
      // Gracefully handle if n8n is not running so tests never crash
      console.log(`ℹ️ [n8n] Webhook server unreachable at ${this.webhookUrl} (n8n might not be started)`);
      return false;
    }
  }
}
