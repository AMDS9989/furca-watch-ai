# FurcaRiskAI – Test Suite

Selenium Web E2E tests for the **FurcaRiskAI** static web application.

---

## 📁 Folder Structure

```
tests/
├── selenium/
│   ├── config.js            # BASE_URL, HEADLESS, TIMEOUT config
│   ├── web_test.js          # Main Selenium test runner (10 test cases)
│   └── pages/
│       ├── BasePage.js      # Shared driver utilities
│       ├── LoginPage.js     # Auth bypass via localStorage injection
│       ├── DashboardPage.js # Dashboard interactions & Add Patient modal
│       └── PatientDbPage.js # Patient Database tab interactions
├── reporters/
│   ├── generate-report.js   # Generates Test Results/HTML/execution-report.html
│   ├── generate-excel.js    # Generates Test Results/Excel/Automation_Test_Report.xlsx
│   └── generate-summary.js  # Generates GitHub Actions Step Summary + summary.md
├── appium/
│   └── app_test.js          # Android Appium tests (separate pipeline)
├── results.json             # Written by web_test.js, read by reporters
└── package.json
```

---

## 🧪 Test Cases

| # | Test Case | Description |
|---|-----------|-------------|
| TC-01 | Page Load & Title Verification | Loads `BASE_URL`, verifies `#page-title = "Dashboard Overview"` |
| TC-02 | Auth Bypass – Dashboard Renders | Confirms dashboard renders after `localStorage` token injection |
| TC-03 | Sidebar Navigation – Patients Tab | Clicks sidebar Patients link, verifies tab becomes active |
| TC-04 | Patient List Renders | Confirms pre-seeded mock patients appear in `#patients-list-container` |
| TC-05 | Select First Patient – Profile Renders | Selects first patient, verifies `#prof-name` is not empty |
| TC-06 | Add Patient via Dashboard Modal | Fills and submits Add Patient form, verifies new patient in Profile |
| TC-07 | Patient Search Filter | Searches for "E2E Selenium", expects ≥ 1 result |
| TC-08 | Sidebar Navigation – AI Diagnostics Tab | Clicks Diagnostics link, verifies title |
| TC-09 | Sidebar Navigation – AI Assistant Tab | Clicks Assistant link, verifies title |
| TC-10 | Run AI Scan Button Present | Confirms `#btn-scan-quick` exists on Dashboard |

---

## 🏃 Local Execution Guide

### Prerequisites

- **Node.js** ≥ 18
- **Google Chrome** installed and accessible in `PATH`
- `chromedriver` is managed automatically by `selenium-webdriver` ≥ 4.22

### 1. Install dependencies

```bash
cd tests
npm install
```

### 2. Serve the web app locally

```bash
# Option A – Python (no install needed)
cd web
python -m http.server 8080

# Option B – npx serve
npx serve web -p 8080
```

### 3. Run tests (against localhost)

```bash
# Defaults to BASE_URL=http://localhost:8080
cd tests
npm run test:web
```

### 4. Run tests with visible browser window

```bash
HEADLESS=false npm run test:web
```

### 5. Run tests against GitHub Pages directly

```bash
BASE_URL=https://<your-username>.github.io/<your-repo>/ npm run test:web
```

### 6. Generate reports after test run

```bash
npm run generate:reports
```

Reports are written to:

```
Test Results/
├── Excel/Automation_Test_Report.xlsx
├── HTML/execution-report.html
├── Screenshots/              (failure screenshots)
├── Logs/                     (CI run logs)
└── Summary/summary.md
```

---

## 🚀 CI/CD Execution Guide

### GitHub Repository Setup

**Step 1 – Enable GitHub Pages (first time only)**

1. Go to **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. Save

**Step 2 – Push to main**

The workflow `.github/workflows/deploy-and-test.yml` triggers automatically on every push.

**Step 3 – View results**

- **Actions tab** → Select the latest run of *"Deploy & Live E2E Tests"*
- **Summary tab** – Shows pass/fail counts and the live deployment URL
- **Artifacts** – Download `furcariskai-web-e2e-reports-<build>` for Excel + HTML reports

### Workflow Overview

```
push → build-and-deploy job
         ├── Copy web/ → dist/
         ├── Upload Pages artifact
         └── Deploy to GitHub Pages
                │
                ▼
       selenium-e2e job
         ├── npm ci
         ├── Poll URL until HTTP 200 (max 3 min)
         ├── Verify URL returns 200
         ├── Run Selenium tests (headless Chrome)
         ├── Generate HTML + Excel + Summary reports
         ├── Upload artifacts (always, even on failure)
         └── Write Step Summary
```

### Environment Variables (in workflow)

| Variable | Value | Description |
|----------|-------|-------------|
| `BASE_URL` | `${{ needs.build-and-deploy.outputs.page_url }}` | Live GitHub Pages URL |
| `GITHUB_PAGES_URL` | Same as `BASE_URL` | Used in report footer links |
| `HEADLESS` | `true` | Headless Chrome in CI |
| `TIMEOUT_MS` | `20000` | Per-element wait timeout |
| `SCREENSHOT_DIR` | `$GITHUB_WORKSPACE/Test Results/Screenshots` | Failure screenshots |

### Required Repository Settings

| Setting | Value |
|---------|-------|
| Pages Source | **GitHub Actions** (not branch) |
| Pages Environment | `github-pages` (created automatically) |
| Permissions | `pages: write`, `id-token: write` |

> **No secrets required** for the basic web E2E pipeline. The GitHub token
> is provided automatically by GitHub Actions.

---

## 🔧 Customisation

### Change the test user account

Edit `tests/selenium/pages/LoginPage.js`:

```js
const TEST_USER = JSON.stringify({
    id:        'test-e2e-001',
    name:      'Dr. E2E Test',
    specialty: 'Clinical Periodontist',
    email:     'e2e@furcariskai.test'
});
```

### Adjust timeouts

```bash
TIMEOUT_MS=30000 npm run test:web
```

### Add a new test case

1. Add a new function `async function tcXX_myTest(dashboard, patientDb)` in `web_test.js`
2. Call it in the `runSuite()` function body
3. Use `recordResult(name, 'PASS'|'FAIL', duration, errorMsg, screenshotPath)` to log the result
