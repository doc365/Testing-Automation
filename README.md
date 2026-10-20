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
npm install
npx playwright install chromium
```

### 2. Run Tests

* **Run all tests (UI + API):**
  ```bash
  npm test
  ```

* **Run only API tests:**
  ```bash
  npm run test:api
  ```

* **Run only UI tests:**
  ```bash
  npm run test:ui
  ```

* **Run UI tests in headed browser (watch tests execute):**
  ```bash
  npm run test:headed
  ```

* **View HTML Test Report:**
  ```bash
  npm run test:report
  ```
