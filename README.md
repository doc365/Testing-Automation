# Full-Stack Automation Framework (Playwright + TypeScript)

This repository contains an enterprise-standard full-stack test automation framework covering both **API testing** and **Web UI End-to-End (E2E) testing**.

## 🏗 Architecture & Design Patterns

* **Language:** TypeScript
* **Test Runner:** Playwright Test Runner
* **UI Design Pattern:** Page Object Model (POM)
* **API Pattern:** Service Object Pattern (`src/api/*`)
* **Assertions:** Playwright web-first assertions
* **Reporting:** Built-in Playwright HTML Reporter with trace & video on failure

## 📂 Project Structure

```text
├── .github/workflows/          # CI/CD GitHub Actions workflow
├── src/
│   ├── api/                    # API client services & payload interfaces
│   │   └── user.api.ts
│   └── pages/                  # Page Object classes (UI locators & methods)
│       ├── base.page.ts
│       ├── login.page.ts
│       └── inventory.page.ts
├── tests/
│   ├── api/                    # API smoke & regression tests
│   │   └── users.spec.ts
│   └── ui/                     # UI E2E tests
│       └── login.spec.ts
├── .env                        # Environment secrets & base URLs
├── .env.example
├── playwright.config.ts        # Test runner & multi-project configuration
├── tsconfig.json               # TypeScript compiler config & path aliases
└── package.json
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pnpm install
pnpm exec playwright install chromium
```

*(Fallback with npm: `npm install && npx playwright install chromium`)*

### 2. Run Tests

* **Run all tests (UI + API):**
  ```bash
  pnpm test
  ```

* **Run only API tests:**
  ```bash
  pnpm run test:api
  ```

* **Run only UI tests:**
  ```bash
  pnpm run test:ui
  ```

* **Run UI tests in headed browser (watch tests execute):**
  ```bash
  pnpm run test:headed
  ```

* **View HTML Test Report:**
  ```bash
  pnpm run test:report
  ```

### 3. Run n8n Workflow Automation (Docker)

* **Start n8n in background:**
  ```bash
  docker compose up -d
  ```

* **Open n8n Web UI in browser:**
  👉 **[http://localhost:5678](http://localhost:5678)**

* **Production Webhook URL used by Playwright:**
  `http://localhost:5678/webhook/test-events`

* **Check status & logs:**
  ```bash
  docker ps
  docker logs -f n8n-automation
  ```

* **Stop n8n:**
  ```bash
  docker compose down
  ```

*(Fallback without Docker: `pnpm dlx n8n` or `npx n8n`)*

## 🧩 Advanced Features & QAOps Integrations

* **Data-Driven Testing (CSV):** `tests/ui/data-driven-login.spec.ts` dynamically parses `test_data/users.csv`.
* **Visual Regression Testing:** `tests/ui/visual-regression.spec.ts` pixel comparison against golden baselines (`--update-snapshots`).
* **Jira Defect Logging:** Custom `jira.reporter.ts` automatically logs bug tickets on final retry.
* **Slack Real-Time Notifications:** n8n routes passing suites (green checkmark) and failing suites (urgent `<!here>` alert).
* **Google Sheets Live Dashboard:** Auto-appends formatted execution rows, pass rates, and donut chart updates via Apps Script.
