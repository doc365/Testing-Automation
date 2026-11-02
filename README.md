# Full-Stack Test Automation Framework

Enterprise-grade test automation framework built with **Playwright** and **TypeScript**, targeting the [SauceDemo](https://www.saucedemo.com/) e-commerce application with full QAOps pipeline integration.

---

## Table of Contents

- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Test Coverage Matrix](#test-coverage-matrix)
- [QAOps Pipeline](#qaops-pipeline)
- [Daily Automated Smoke Test](#daily-automated-smoke-test)
- [Test Expansion Roadmap](#test-expansion-roadmap)
- [Troubleshooting](#troubleshooting)

---

## Architecture

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Language | TypeScript | Type-safe test authoring |
| Test Runner | Playwright Test | Execution, parallelism, assertions |
| UI Design Pattern | Page Object Model (POM) | Decouple locators from test logic |
| API Design Pattern | Service Object Pattern | Reusable API client wrappers |
| Assertions | Playwright web-first assertions | Auto-waiting, retry-enabled |
| Reporting | HTML + Jira + n8n custom reporters | Multi-channel test result delivery |
| Orchestration | n8n (Docker) | Workflow automation, webhook routing |
| CI/CD | GitHub Actions | Pull request validation, scheduled runs |
| Notifications | Slack (via n8n) | Real-time pass/fail alerts |
| Metrics | Google Sheets (via Apps Script) | Live dashboard with pass rate tracking |

---

## Project Structure

```text
testing-automation/
├── .github/workflows/
│   └── test.yml                     # CI/CD pipeline (push + PR triggers)
├── src/
│   ├── api/
│   │   └── user.api.ts              # REST API client (ReqRes.in)
│   ├── pages/                       # Page Object Model classes
│   │   ├── base.page.ts             # Abstract base (shared navigation)
│   │   ├── login.page.ts            # Login form interactions
│   │   ├── inventory.page.ts        # Product catalog interactions
│   │   ├── product-detail.page.ts   # Individual product view [Wave 1]
│   │   ├── cart.page.ts             # Shopping cart management [Wave 1]
│   │   ├── checkout-info.page.ts    # Checkout form (name, postal) [Wave 1]
│   │   ├── checkout-overview.page.ts # Order review + pricing [Wave 1]
│   │   └── checkout-complete.page.ts # Order confirmation [Wave 1]
│   ├── reporters/
│   │   ├── jira.reporter.ts         # Auto-create Jira bug tickets on failure
│   │   └── n8n.reporter.ts          # Dispatch suite results to n8n webhook
│   └── utils/
│       ├── jira.client.ts           # Jira REST API client (mock + live)
│       └── n8n.client.ts            # n8n webhook HTTP client
├── tests/
│   ├── auth.setup.ts                # One-time login, saves storageState
│   ├── api/
│   │   └── users.spec.ts            # API smoke tests (GET, POST, DELETE)
│   └── ui/
│       ├── login.spec.ts            # Login smoke (valid + invalid)
│       ├── inventory.spec.ts        # Cart add/remove regression
│       ├── data-driven-login.spec.ts # CSV-driven multi-user login matrix
│       ├── visual-regression.spec.ts # Pixel-by-pixel screenshot comparison
│       ├── jira-integration.spec.ts  # Jira ticket creation showcase
│       ├── checkout-e2e.spec.ts      # Full checkout flow + pricing [Wave 1]
│       ├── sorting.spec.ts           # Catalog sort verification [Wave 2]
│       ├── responsive-mobile.spec.ts # Mobile viewport + hamburger menu [Wave 3]
│       ├── multi-tab-links.spec.ts   # External links in new tabs [Wave 3]
│       ├── network-resilience.spec.ts # Network mocking + fault injection [Wave 4]
│       └── accessibility.spec.ts     # WCAG 2.1 AA compliance scan [Wave 5]
├── test_data/
│   └── users.csv                    # Data-driven test input matrix
├── scripts/
│   ├── daily-smoke-test.ps1         # Daily automation (start n8n, run, shutdown)
│   └── register-daily-smoke-task.ps1 # One-time Windows Task Scheduler setup
├── docker-compose.yml               # n8n container configuration
├── playwright.config.ts             # Multi-project test runner config
├── .env                             # Environment variables (secrets, URLs)
├── .env.example                     # Template for .env setup
├── TEST_EXPANSION_PLAN.md           # Detailed wave-by-wave expansion checklist
├── PROJECT_PREFERENCES.md           # Team coding standards and conventions
├── AGENTS.md                        # AI agent behavioral rules
└── package.json
```

> Items marked `[Wave N]` are part of the test expansion roadmap. See [TEST_EXPANSION_PLAN.md](TEST_EXPANSION_PLAN.md) for status.

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | >= 20 | JavaScript runtime |
| pnpm | >= 9 | Package manager |
| Docker Desktop | Latest | n8n container hosting |
| Git | Latest | Version control |

---

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd testing-automation
pnpm install
pnpm exec playwright install chromium
```

### 2. Configure Environment

Copy the example file and update values:

```bash
cp .env.example .env
```

Key variables in `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_UI_URL` | `https://www.saucedemo.com` | Target web application |
| `BASE_API_URL` | `https://reqres.in/api/` | Target REST API |
| `N8N_WEBHOOK_URL` | `http://localhost:5678/webhook/test-events` | n8n production webhook |
| `ENABLE_AUTO_JIRA_BUG` | `false` | Toggle Jira auto-ticket creation |

---

## Running Tests

### Quick Commands

| Command | What It Runs |
|---------|-------------|
| `pnpm test` | All tests (API + UI) |
| `pnpm run test:ui` | UI tests only (Chromium) |
| `pnpm run test:api` | API tests only |
| `pnpm run test:headed` | UI tests with visible browser |
| `pnpm run test:visual` | Visual regression screenshots |
| `pnpm run test:report` | Open HTML report in browser |
| `pnpm run clean` | Delete test artifacts |

### Run a Specific Test File

```bash
pnpm exec playwright test tests/ui/checkout-e2e.spec.ts
```

### Run Tests with Tag Filtering

```bash
pnpm exec playwright test --grep "smoke"
pnpm exec playwright test --grep "checkout"
```

### Update Visual Regression Baselines

```bash
pnpm exec playwright test tests/ui/visual-regression.spec.ts --update-snapshots
```

---

## Test Coverage Matrix

### Target Application: [SauceDemo](https://www.saucedemo.com/)

| Page / Feature | Test File | Wave | Status |
|---------------|-----------|------|--------|
| Login (valid + invalid) | `login.spec.ts` | Foundation | DONE |
| Login (CSV multi-user matrix) | `data-driven-login.spec.ts` | Foundation | DONE |
| Login (visual regression) | `visual-regression.spec.ts` | Foundation | DONE |
| Inventory (add/remove cart) | `inventory.spec.ts` | Foundation | DONE |
| Jira ticket on failure | `jira-integration.spec.ts` | Foundation | DONE |
| Full checkout flow + pricing | `checkout-e2e.spec.ts` | Wave 1 | DONE |
| Catalog sorting verification | `sorting.spec.ts` | Wave 2 | DONE |
| Mobile responsive + hamburger | `responsive-mobile.spec.ts` | Wave 3 | DONE |
| External links (new tab) | `multi-tab-links.spec.ts` | Wave 3 | DONE |
| Network mocking + fault injection | `network-resilience.spec.ts` | Wave 4 | DONE |
| Accessibility (WCAG 2.1 AA) | `accessibility.spec.ts` | Wave 5 | DONE |

### Target API: [ReqRes.in](https://reqres.in/)

| Endpoint | Method | Test File | Status |
|----------|--------|-----------|--------|
| `/api/users` | GET | `users.spec.ts` | DONE |
| `/api/users` | POST | `users.spec.ts` | DONE |
| `/api/users/2` | GET | `users.spec.ts` | DONE |
| `/api/users/2` | DELETE | `users.spec.ts` | DONE |

### SauceDemo User Coverage

| Username | Behavior | Tested In |
|----------|----------|-----------|
| `standard_user` | Normal baseline | All test files |
| `locked_out_user` | Login blocked | `data-driven-login.spec.ts` |
| `problem_user` | Broken product images | Wave 3 (planned) |
| `performance_glitch_user` | Slow page loads (3-5s) | Wave 4 (planned) |
| `error_user` | Server errors on forms | Wave 1 (planned) |
| `visual_user` | Layout shifts | Wave 3 (planned) |

---

## QAOps Pipeline

Test results flow through an automated pipeline after every run:

```text
Playwright Test Run
       |
       v
[n8n Reporter] -- POST --> n8n Webhook (Docker)
       |                         |
       |                         ├── Google Sheets (append row + update metrics)
       |                         |
       |                         └── IF Node
       |                              ├── PASSED -> Slack (summary)
       |                              └── FAILED -> Slack (<!here> alert + details)
       |
[Jira Reporter] -- Mock/Live --> Jira Cloud (auto-create Bug ticket)
```

### Start the QAOps Pipeline

```bash
# Start n8n orchestration engine
docker compose up -d

# Open n8n workflow editor
# http://localhost:5678

# Run tests (results auto-dispatched to Slack + Google Sheets)
pnpm test
```

### Stop the Pipeline

```bash
docker compose down
```

---

## Daily Automated Smoke Test

A Windows Task Scheduler job runs the API smoke monitor every morning:

| Setting | Value |
|---------|-------|
| Task Name | `QA Daily Smoke Test` |
| Schedule | Daily at 8:55 AM (UTC+7 Vietnam) |
| Workflow | `Daily 9AM Smoke Monitor` (n8n cron `0 9 * * *`) |
| Auto-Shutdown | Container stops at ~9:02 AM after completion |
| Logs | `logs/daily-smoke-YYYY-MM-DD.log` |

### One-Time Setup (Run as Administrator)

```powershell
powershell -ExecutionPolicy Bypass -File "E:\Documents\Testing Automation\scripts\register-daily-smoke-task.ps1"
```

### Manage the Scheduled Task

```powershell
# View task status
Get-ScheduledTask -TaskName "QA Daily Smoke Test"

# Run manually
Start-ScheduledTask -TaskName "QA Daily Smoke Test"

# Remove task
Unregister-ScheduledTask -TaskName "QA Daily Smoke Test"
```

---

## Test Expansion Roadmap

See [TEST_EXPANSION_PLAN.md](TEST_EXPANSION_PLAN.md) for the full checklist with detailed breakdowns.

| Wave | Focus Area | New Tests | Status |
|------|-----------|-----------|--------|
| Wave 1 | E2E Checkout Flow + Business Logic | 6 scenarios | DONE |
| Wave 2 | Catalog Sorting Verification | 6 scenarios | DONE |
| Wave 3 | Mobile Responsive + Multi-Tab Links | 7 scenarios | DONE |
| Wave 4 | Network Interception + Fault Injection | 6 scenarios | DONE |
| Wave 5 | Accessibility (WCAG 2.1 AA) | 6 scenarios | DONE |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `pnpm: command not found` | Install: `npm install -g pnpm` |
| Playwright browsers not installed | Run: `pnpm exec playwright install chromium` |
| n8n container won't start | Check Docker Desktop is running: `docker ps` |
| Slack notifications not arriving | Verify webhook URL in n8n workflow matches `.env` |
| Tests fail with `storageState` error | Delete `playwright/.auth/` and re-run: `pnpm test` |
| Visual regression fails after intentional UI change | Update baselines: `--update-snapshots` |
| Google Sheets not updating | Check Apps Script webhook URL and execution permissions |
