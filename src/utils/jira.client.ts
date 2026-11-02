import * as fs from 'fs';
import * as path from 'path';

export interface JiraBugPayload {
  summary: string;
  testFile: string;
  scenarioName: string;
  errorMessage: string;
  errorStack?: string;
  priority?: 'Highest' | 'High' | 'Medium' | 'Low';
}

export interface JiraIssueResponse {
  id: string;
  key: string;
  self: string;
  isMock?: boolean;
}

export class JiraClient {
  private host: string;
  private email: string;
  private apiToken: string;
  private projectKey: string;
  private isEnabled: boolean;

  constructor() {
    this.host = (process.env.JIRA_HOST || '').replace(/\/$/, '');
    this.email = process.env.JIRA_EMAIL || '';
    this.apiToken = process.env.JIRA_API_TOKEN || '';
    this.projectKey = process.env.JIRA_PROJECT_KEY || 'AUT';
    this.isEnabled = process.env.ENABLE_AUTO_JIRA_BUG === 'true';
  }

  /**
   * Creates a Bug ticket in Jira for a failed test scenario
   */
  async createBug(payload: JiraBugPayload): Promise<JiraIssueResponse | null> {
    if (!this.isEnabled) {
      console.log('[Jira] Auto-ticket logging is disabled in .env (ENABLE_AUTO_JIRA_BUG=false)');
      return null;
    }

    const isMock = !this.apiToken || this.apiToken === 'mock_api_token' || this.host.includes('company.atlassian.net');

    const issueBody = {
      fields: {
        project: {
          key: this.projectKey,
        },
        summary: `[Automation Failure]: ${payload.scenarioName}`,
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'An automated test failure was detected in CI/CD pipeline.',
                  marks: [{ type: 'strong' }],
                },
              ],
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: `Test File: ${payload.testFile}\n` },
                { type: 'text', text: `Scenario: ${payload.scenarioName}\n` },
                { type: 'text', text: `Timestamp: ${new Date().toISOString()}\n` },
              ],
            },
            {
              type: 'codeBlock',
              attrs: { language: 'text' },
              content: [
                {
                  type: 'text',
                  text: payload.errorStack || payload.errorMessage || 'No stack trace available',
                },
              ],
            },
          ],
        },
        issuetype: {
          name: 'Bug',
        },
        labels: ['automation', 'playwright-failure', 'regression-bug'],
        priority: {
          name: payload.priority || 'High',
        },
      },
    };

    // If using mock token or demo mode, record ticket locally
    if (isMock) {
      const mockKey = `${this.projectKey}-${Math.floor(1000 + Math.random() * 9000)}`;
      const mockResponse: JiraIssueResponse = {
        id: Math.floor(Math.random() * 100000).toString(),
        key: mockKey,
        self: `${this.host}/rest/api/3/issue/${mockKey}`,
        isMock: true,
      };

      this.saveLocalTicketRecord(mockKey, issueBody);
      console.log(`\n[Jira Mock] Created Bug Ticket: ${mockKey} -> "${payload.scenarioName}"`);
      return mockResponse;
    }

    // Real Jira Cloud REST API call (v3)
    try {
      const authHeader = Buffer.from(`${this.email}:${this.apiToken}`).toString('base64');
      const response = await fetch(`${this.host}/rest/api/3/issue`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(issueBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ERROR] Failed to create Jira ticket: ${response.status} - ${errorText}`);
        return null;
      }

      const created = (await response.json()) as JiraIssueResponse;
      console.log(`\n[Jira Live] Successfully created ticket: ${created.key} at ${this.host}/browse/${created.key}`);
      return created;
    } catch (err) {
      console.error('[ERROR] Exception occurred while calling Jira API:', err);
      return null;
    }
  }

  /**
   * Stores created ticket details in reports/jira-tickets.json for traceability
   */
  private saveLocalTicketRecord(ticketKey: string, body: any): void {
    const reportDir = path.resolve(process.cwd(), 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const ticketFile = path.join(reportDir, 'jira-tickets.json');
    let tickets: any[] = [];
    if (fs.existsSync(ticketFile)) {
      try {
        tickets = JSON.parse(fs.readFileSync(ticketFile, 'utf-8'));
      } catch {
        tickets = [];
      }
    }

    tickets.push({
      key: ticketKey,
      timestamp: new Date().toISOString(),
      details: body,
    });

    fs.writeFileSync(ticketFile, JSON.stringify(tickets, null, 2), 'utf-8');
  }
}
