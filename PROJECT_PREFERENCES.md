# Project Preferences & Architecture Memory

## 0. User & Regional Settings
* **Location / Timezone:** Vietnam (UTC+7 / `Asia/Ho_Chi_Minh`).
* **Formula Syntax Preference:** Semicolon (`;`) delimiter for regional spreadsheet functions (e.g. `=TEXT(COUNTIF(B2:B; "PASSED") / COUNTA(B2:B); "0.0%")`).

## 1. Environment & Package Manager Preferences
* **Preferred Package Manager:** `pnpm` (fallback to `npm` / `npx` only when strictly necessary).
* **Storage Locations (Always E: Drive):**
  * Project Root: `E:\Documents\Testing Automation`
  * Global Store: `E:\.pnpm-store`
  * Cache & DLX: `E:\.pnpm-cache`
  * State: `E:\.pnpm-state`
  * n8n Persistent Data Volume: `E:\Documents\Testing Automation\n8n-data`

## 2. Docker & n8n Architecture Rules
* **Runner:** Docker Compose (`docker compose up -d` / `docker compose down`).
* **Active Webhook URL:** Always use the **Production** path `http://localhost:5678/webhook/test-events` (do NOT use `/webhook-test/` unless interactively debugging with "Listen for test event").
* **n8n HTTP Request to Slack Rule:**
  * In the HTTP Request node body, always use `={{ JSON.stringify({ ... }) }}`.
  * Never use unescaped raw multiline strings inside the "JSON Body" parameter to prevent `The value in the "JSON Body" field is not valid JSON` errors.

## 3. Playwright Testing Standards
* **Design Pattern:** Page Object Model (POM) in `src/pages/`.
* **API Testing:** Service Object pattern using `APIRequestContext` in `src/api/`.
* **Fast Authentication:** Reusable `storageState` session snapshot in `tests/auth.setup.ts`.
* **Data-Driven Testing (DDT):** Synchronous parsing from `test_data/users.csv` using `csv-parse`.
* **Visual Regression:** Pixel comparison against golden screenshots in `-snapshots/` using `toHaveScreenshot()`.
* **Defect Reporting:**
  * Custom `jira.reporter.ts` automatically creates Jira tickets on final retry.
  * Custom `n8n.reporter.ts` dispatches full test suite summaries to n8n on `onEnd`.
* **Notification Routing (n8n IF Node):**
  * `PASSED` -> Green celebratory report.
  * `FAILED` -> Red alert tagging `<!here>` with failed scenario breakdown.
