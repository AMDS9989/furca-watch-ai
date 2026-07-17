'use strict';
/**
 * FurcaRiskAI – Selenium Web E2E Test Suite
 *
 * Tests run against the URL defined in BASE_URL env var:
 *   - CI/CD:  BASE_URL=https://<user>.github.io/<repo>/
 *   - Local:  BASE_URL=http://localhost:8080  (default)
 *
 * Results are written to tests/results.json in the same schema
 * consumed by reporters/generate-report.js and reporters/generate-excel.js.
 */

const { Builder, Browser } = require('selenium-webdriver');
const chrome               = require('selenium-webdriver/chrome');
const fs                   = require('fs');
const path                 = require('path');

const { BASE_URL, HEADLESS, TIMEOUT_MS, SCREENSHOT_DIR } = require('./config');
const LoginPage      = require('./pages/LoginPage');
const DashboardPage  = require('./pages/DashboardPage');
const PatientDbPage  = require('./pages/PatientDbPage');

// ── Constants ───────────────────────────────────────────────────────────────
const RESULTS_FILE = path.resolve(__dirname, '../results.json');
const BUILD_NUMBER = process.env.GITHUB_RUN_NUMBER || 'local';
const PLATFORM     = 'Web (GitHub Pages)';

// ── Chrome Options ───────────────────────────────────────────────────────────
function buildChromeOptions() {
    const opts = new chrome.Options();
    if (HEADLESS) {
        opts.addArguments('--headless=new');
    }
    opts.addArguments(
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1440,900',
        '--disable-extensions',
        '--disable-infobars'
    );
    return opts;
}

// ── Result Helpers ───────────────────────────────────────────────────────────
const results = [];

function recordResult(name, status, durationMs, errorMsg, screenshotPath) {
    results.push({
        name,
        status,                          // 'PASS' | 'FAIL'
        duration: Math.round(durationMs),
        error:    errorMsg  || null,
        screenshot: screenshotPath || null
    });
    const icon = status === 'PASS' ? '✅' : '❌';
    console.log(`  ${icon}  [${status}] ${name}  (${Math.round(durationMs)}ms)`);
    if (errorMsg) console.log(`     ↳ ${errorMsg}`);
}

// ── Individual Test Cases ────────────────────────────────────────────────────

/** TC-01: Page Load & Title Verification */
async function tc01_pageLoad(loginPage, dashboard) {
    const start = Date.now();
    try {
        await loginPage.bypassLogin();
        const title = await dashboard.getTitle();
        if (title !== 'Dashboard Overview') {
            throw new Error(`Expected "Dashboard Overview", got "${title}"`);
        }
        recordResult('TC-01: Page Load & Title Verification', 'PASS', Date.now() - start);
    } catch (e) {
        const ss = await dashboard.screenshot('tc01-fail');
        recordResult('TC-01: Page Load & Title Verification', 'FAIL', Date.now() - start, e.message, ss);
        throw e;   // re-throw so suite knows this test failed (logout guard runs in finally)
    }
}

/** TC-02: Auth Bypass – Dashboard Renders After Token Injection */
async function tc02_authBypass(loginPage, dashboard) {
    const start = Date.now();
    try {
        // Auth bypass already done in TC-01; just confirm dashboard state
        const isDash = await dashboard.isDashboardActive();
        if (!isDash) {
            throw new Error('Dashboard tab not active after auth bypass');
        }
        // Verify a key metric card is present
        const metric = await dashboard.getTotalPatientsMetric();
        if (!metric || metric === '') {
            throw new Error('Total Patients metric card is empty');
        }
        recordResult('TC-02: Auth Bypass – Dashboard Renders', 'PASS', Date.now() - start);
    } catch (e) {
        const ss = await dashboard.screenshot('tc02-fail');
        recordResult('TC-02: Auth Bypass – Dashboard Renders', 'FAIL', Date.now() - start, e.message, ss);
    }
}

/** TC-03: Sidebar Navigation – Patients Tab */
async function tc03_sidebarNavigation(dashboard, patientDb) {
    const start = Date.now();
    try {
        await dashboard.navigateToTab('patients');
        await patientDb.waitUntilActive(TIMEOUT_MS);

        const pageTitle = await dashboard.getTitle();
        if (pageTitle !== 'Patient Database') {
            throw new Error(`Expected "Patient Database", got "${pageTitle}"`);
        }
        recordResult('TC-03: Sidebar Navigation – Patients Tab', 'PASS', Date.now() - start);
    } catch (e) {
        const ss = await dashboard.screenshot('tc03-fail');
        recordResult('TC-03: Sidebar Navigation – Patients Tab', 'FAIL', Date.now() - start, e.message, ss);
    }
}

/** TC-04: Patient List Renders – Pre-Seeded Records */
async function tc04_patientListRenders(patientDb) {
    const start = Date.now();
    try {
        const count = await patientDb.getPatientCount();
        if (count === 0) {
            throw new Error('Patient list is empty – expected pre-seeded mock records');
        }
        console.log(`     ℹ️  Found ${count} patient(s) in list`);
        recordResult('TC-04: Patient List Renders', 'PASS', Date.now() - start);
    } catch (e) {
        const ss = await patientDb.screenshot('tc04-fail');
        recordResult('TC-04: Patient List Renders', 'FAIL', Date.now() - start, e.message, ss);
    }
}

/** TC-05: Patient Profile – Select First Patient */
async function tc05_selectFirstPatient(patientDb) {
    const start = Date.now();
    try {
        await patientDb.selectFirstPatient();
        const name = await patientDb.getActivePatientName();
        if (!name || name.trim() === '') {
            throw new Error('Profile panel shows empty name after selecting first patient');
        }
        console.log(`     ℹ️  Active patient: "${name}"`);
        recordResult('TC-05: Select First Patient – Profile Renders', 'PASS', Date.now() - start);
    } catch (e) {
        const ss = await patientDb.screenshot('tc05-fail');
        recordResult('TC-05: Select First Patient – Profile Renders', 'FAIL', Date.now() - start, e.message, ss);
    }
}

/** TC-06: Add Patient via Dashboard Modal */
async function tc06_addPatientModal(dashboard, patientDb) {
    const start = Date.now();
    // Navigate back to Dashboard first
    await dashboard.navigateToTab('dashboard');
    await dashboard.waitForTitle('Dashboard Overview');

    try {
        await dashboard.clickAddPatient();

        await dashboard.fillPatientForm({
            name:     'E2E Selenium Patient',
            age:      '38',
            phone:    '+1 (555) 999-8888',
            tooth:    '26',
            diabetes: true
        });

        await dashboard.submitPatientForm();

        // After submit, app should auto-navigate to Patient Database
        await dashboard.waitForTitle('Patient Database', TIMEOUT_MS);

        const activePatient = await patientDb.getActivePatientName();
        if (activePatient !== 'E2E Selenium Patient') {
            throw new Error(`Expected profile name "E2E Selenium Patient", got "${activePatient}"`);
        }
        recordResult('TC-06: Add Patient via Dashboard Modal', 'PASS', Date.now() - start);
    } catch (e) {
        const ss = await dashboard.screenshot('tc06-fail');
        recordResult('TC-06: Add Patient via Dashboard Modal', 'FAIL', Date.now() - start, e.message, ss);
    }
}

/** TC-07: Patient Search Filter */
async function tc07_patientSearch(patientDb) {
    const start = Date.now();
    try {
        await patientDb.searchPatient('E2E Selenium');
        const count = await patientDb.getPatientCount();
        if (count === 0) {
            throw new Error('Search returned 0 results for "E2E Selenium"');
        }
        recordResult('TC-07: Patient Search Filter', 'PASS', Date.now() - start);
    } catch (e) {
        const ss = await patientDb.screenshot('tc07-fail');
        recordResult('TC-07: Patient Search Filter', 'FAIL', Date.now() - start, e.message, ss);
    }
}

/** TC-08: Sidebar Navigation – AI Diagnostics Tab */
async function tc08_diagnosticsTab(dashboard) {
    const start = Date.now();
    try {
        await dashboard.navigateToTab('diagnostics');
        await dashboard.waitForTitle('AI Diagnostics', TIMEOUT_MS);
        recordResult('TC-08: Sidebar Navigation – AI Diagnostics Tab', 'PASS', Date.now() - start);
    } catch (e) {
        const ss = await dashboard.screenshot('tc08-fail');
        recordResult('TC-08: Sidebar Navigation – AI Diagnostics Tab', 'FAIL', Date.now() - start, e.message, ss);
    }
}

/** TC-09: Sidebar Navigation – AI Assistant Tab */
async function tc09_assistantTab(dashboard) {
    const start = Date.now();
    try {
        await dashboard.navigateToTab('assistant');
        await dashboard.waitForTitle('AI Assistant', TIMEOUT_MS);
        recordResult('TC-09: Sidebar Navigation – AI Assistant Tab', 'PASS', Date.now() - start);
    } catch (e) {
        const ss = await dashboard.screenshot('tc09-fail');
        recordResult('TC-09: Sidebar Navigation – AI Assistant Tab', 'FAIL', Date.now() - start, e.message, ss);
    }
}

/** TC-10: Run AI Scan Button Present on Dashboard */
async function tc10_scanButtonPresent(dashboard) {
    const start = Date.now();
    try {
        await dashboard.navigateToTab('dashboard');
        await dashboard.waitForTitle('Dashboard Overview');

        const exists = await dashboard.scanButtonExists();
        if (!exists) {
            throw new Error('"Run AI Scan" button not found on dashboard');
        }
        recordResult('TC-10: Run AI Scan Button Present', 'PASS', Date.now() - start);
    } catch (e) {
        const ss = await dashboard.screenshot('tc10-fail');
        recordResult('TC-10: Run AI Scan Button Present', 'FAIL', Date.now() - start, e.message, ss);
    }
}

// ── Result Writer ────────────────────────────────────────────────────────────
function writeResults(startTime) {
    const passed    = results.filter(r => r.status === 'PASS').length;
    const failed    = results.filter(r => r.status === 'FAIL').length;
    const total     = results.length;
    const passRate  = total > 0 ? ((passed / total) * 100).toFixed(1) + '%' : '0%';
    const durationMs = Date.now() - startTime;

    const output = {
        suiteName:     'FurcaRiskAI Selenium Web E2E',
        buildNumber:   BUILD_NUMBER,
        executionDate: new Date().toISOString(),
        platform:      PLATFORM,
        baseUrl:       BASE_URL,
        totalTests:    total,
        passed,
        failed,
        skipped:       0,
        passRate,
        durationMs,
        tests:         results
    };

    const dir = path.dirname(RESULTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(output, null, 2), 'utf8');
    console.log(`\n📄  Results written to: ${RESULTS_FILE}`);
    return output;
}

// ── Main Runner ──────────────────────────────────────────────────────────────
async function runSuite() {
    const suiteStart = Date.now();
    console.log('\n══════════════════════════════════════════════════════');
    console.log('  FurcaRiskAI – Selenium Web E2E Test Suite');
    console.log(`  BASE_URL  : ${BASE_URL}`);
    console.log(`  HEADLESS  : ${HEADLESS}`);
    console.log(`  TIMEOUT   : ${TIMEOUT_MS}ms`);
    console.log('══════════════════════════════════════════════════════\n');

    const driver = await new Builder()
        .forBrowser(Browser.CHROME)
        .setChromeOptions(buildChromeOptions())
        .build();

    const loginPage  = new LoginPage(driver);
    const dashboard  = new DashboardPage(driver);
    const patientDb  = new PatientDbPage(driver);

    try {
        // TC-01 is the gate: if page doesn't load, abort
        await tc01_pageLoad(loginPage, dashboard);
        await tc02_authBypass(loginPage, dashboard);
        await tc03_sidebarNavigation(dashboard, patientDb);
        await tc04_patientListRenders(patientDb);
        await tc05_selectFirstPatient(patientDb);
        await tc06_addPatientModal(dashboard, patientDb);
        await tc07_patientSearch(patientDb);
        await tc08_diagnosticsTab(dashboard);
        await tc09_assistantTab(dashboard);
        await tc10_scanButtonPresent(dashboard);

    } catch (fatalErr) {
        console.error('\n🔴 Fatal test error (suite aborted early):', fatalErr.message);
    } finally {
        console.log('\n🔚  Quitting browser...');
        await driver.quit();
    }

    // Write results regardless of failures
    const summary = writeResults(suiteStart);

    // ── Console Summary ──────────────────────────────────────────────────
    console.log('\n══════════════════════════════════════════════════════');
    console.log('  TEST RESULTS SUMMARY');
    console.log(`  Total:    ${summary.totalTests}`);
    console.log(`  Passed:   ${summary.passed}`);
    console.log(`  Failed:   ${summary.failed}`);
    console.log(`  Pass Rate: ${summary.passRate}`);
    console.log(`  Duration: ${(summary.durationMs / 1000).toFixed(2)}s`);
    console.log('══════════════════════════════════════════════════════\n');

    // Exit with failure code if any tests failed
    if (summary.failed > 0) {
        process.exitCode = 1;
    }
}

runSuite().catch(err => {
    console.error('Unhandled error in test suite:', err);
    process.exitCode = 1;
});
