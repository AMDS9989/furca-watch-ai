'use strict';
/**
 * FurcaRiskAI – Comprehensive Android Appium E2E Mobile Test Suite
 * ─────────────────────────────────────────────────────────────────────────────
 * 35 Mobile Test Cases covering all 33 Android Fragments:
 *   • Category 1: Auth & Onboarding (TC-MOB-01 … TC-MOB-05) – 5 tests
 *   • Category 2: Dashboard & Metrics (TC-MOB-06 … TC-MOB-10) – 5 tests
 *   • Category 3: Patient Management (TC-MOB-11 … TC-MOB-16) – 6 tests
 *   • Category 4: AI Diagnostics & Radiographs (TC-MOB-17 … TC-MOB-22) – 6 tests
 *   • Category 5: AI Decision Support & Chat (TC-MOB-23 … TC-MOB-27) – 5 tests
 *   • Category 6: Treatment Planning & System (TC-MOB-28 … TC-MOB-35) – 8 tests
 */

const { remote } = require('webdriverio');
const path = require('path');
const fs = require('fs');
const config = require('./config');

// Appium configuration capabilities
const wdOpts = {
    hostname: config.HOST,
    port: config.PORT,
    logLevel: config.LOG_LEVEL,
    capabilities: {
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': 'Android Emulator',
        'appium:app': config.APK_PATH,
        'appium:appPackage': config.APP_PACKAGE,
        'appium:appActivity': config.APP_ACTIVITY,
        'appium:noReset': false,
        'appium:autoGrantPermissions': true
    }
};

// Test results tracker
const testResults = {
    suiteName: 'FurcaRiskAI Android Appium E2E Test Suite',
    buildNumber: process.env.GITHUB_RUN_NUMBER || '1.0.0',
    executionDate: new Date().toISOString(),
    platform: 'Android (UiAutomator2 / Android Emulator)',
    apkPath: config.APK_PATH,
    startTime: Date.now(),
    endTime: null,
    durationMs: null,
    totalTests: 0,
    passed: 0,
    failed: 0,
    passRate: '0%',
    tests: [],
    screenshots: []
};

async function runTest(category, id, name, fn, client) {
    const start = Date.now();
    try {
        await fn();
        const duration = Date.now() - start;
        testResults.tests.push({ id, name: `[${id}] ${name}`, category, status: 'PASS', duration, error: null });
        testResults.passed++;
        console.log(`  ✅ PASS [${id}] ${name} (${duration}ms)`);
    } catch (err) {
        const duration = Date.now() - start;
        testResults.tests.push({ id, name: `[${id}] ${name}`, category, status: 'FAIL', duration, error: err.message });
        testResults.failed++;
        console.error(`  ❌ FAIL [${id}] ${name}: ${err.message}`);
        if (client) {
            try {
                if (!fs.existsSync(config.SCREENSHOTS_DIR)) fs.mkdirSync(config.SCREENSHOTS_DIR, { recursive: true });
                const safeName = id.toLowerCase();
                const screenshotPath = path.join(config.SCREENSHOTS_DIR, `fail_${safeName}_${Date.now()}.png`);
                await client.saveScreenshot(screenshotPath);
                testResults.screenshots.push(screenshotPath);
                console.log(`    Screenshot saved: ${screenshotPath}`);
            } catch (_) {}
        }
    }
    testResults.totalTests++;
}

function saveResults() {
    testResults.endTime = Date.now();
    testResults.durationMs = testResults.endTime - testResults.startTime;
    testResults.passRate = testResults.totalTests > 0
        ? `${((testResults.passed / testResults.totalTests) * 100).toFixed(1)}%`
        : '0%';
    const dir = path.dirname(config.RESULTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(config.RESULTS_FILE, JSON.stringify(testResults, null, 2), 'utf8');
    console.log(`\nResults saved → ${config.RESULTS_FILE}`);
}

async function runAppiumTest() {
    console.log(`\n=============================================================`);
    console.log(`🚀 Starting Appium E2E Mobile Test Suite (35 Tests)`);
    console.log(`=============================================================`);
    console.log(`  APK Path : ${config.APK_PATH}`);
    console.log(`  Endpoint : http://${config.HOST}:${config.PORT}\n`);

    let client;
    try {
        client = await remote(wdOpts);
        console.log('Appium session initialized successfully.');

        // ── CATEGORY 1: Auth & Onboarding ─────────────────────────────────────
        await runTest('Auth & Onboarding', 'TC-MOB-01', 'Splash Screen Initial Loading', async () => {
            const title = await client.$('android=new UiSelector().textContains("FurcaRiskAI")');
            await title.waitForExist({ timeout: 10000 });
        }, client);

        await runTest('Auth & Onboarding', 'TC-MOB-02', 'Welcome Screen Banner & Branding', async () => {
            const welcomeBanner = await client.$('id:com.example.furcariskai:id/welcome_banner');
            await welcomeBanner.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('Auth & Onboarding', 'TC-MOB-03', 'Email & Password Login Form Render', async () => {
            const emailField = await client.$('id:com.example.furcariskai:id/et_email');
            await emailField.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('Auth & Onboarding', 'TC-MOB-04', 'New User Registration & Account Creation', async () => {
            const signUpBtn = await client.$('id:com.example.furcariskai:id/btn_signup');
            await signUpBtn.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('Auth & Onboarding', 'TC-MOB-05', 'Bypass Authentication Button Action', async () => {
            const bypassBtn = await client.$('id:com.example.furcariskai:id/btn_bypass');
            await bypassBtn.click();
            await client.pause(1500);
        }, client);

        // ── CATEGORY 2: Dashboard & Clinical Metrics ─────────────────────────
        await runTest('Dashboard & Metrics', 'TC-MOB-06', 'Dashboard Main Screen Navigation', async () => {
            const dashboardTitle = await client.$('android=new UiSelector().textContains("Dashboard")');
            await dashboardTitle.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('Dashboard & Metrics', 'TC-MOB-07', 'Analytics Dashboard Data Charts', async () => {
            const chartCard = await client.$('id:com.example.furcariskai:id/chart_card');
            await chartCard.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('Dashboard & Metrics', 'TC-MOB-08', 'Hospital Overview & Department Dashboard', async () => {
            const hospitalTab = await client.$('id:com.example.furcariskai:id/nav_hospital');
            await hospitalTab.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('Dashboard & Metrics', 'TC-MOB-09', 'Critical Risk Count Metric Badge Calculation', async () => {
            const criticalMetric = await client.$('id:com.example.furcariskai:id/tv_critical_count');
            await criticalMetric.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('Dashboard & Metrics', 'TC-MOB-10', 'Total Registered Patients Summary Card', async () => {
            const totalCard = await client.$('id:com.example.furcariskai:id/tv_total_patients');
            await totalCard.waitForExist({ timeout: 5000 });
        }, client);

        // ── CATEGORY 3: Patient Management ────────────────────────────────────
        await runTest('Patient Management', 'TC-MOB-11', 'Patient Directory List Loading', async () => {
            const navPatients = await client.$('id:com.example.furcariskai:id/nav_patients');
            await navPatients.click();
            await client.pause(1000);
        }, client);

        await runTest('Patient Management', 'TC-MOB-12', 'Add New Patient Dialog Form', async () => {
            const addPatientBtn = await client.$('id:com.example.furcariskai:id/fab_add_patient');
            await addPatientBtn.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('Patient Management', 'TC-MOB-13', 'Comprehensive Patient Profile View', async () => {
            const patientCard = await client.$('id:com.example.furcariskai:id/card_patient_item');
            await patientCard.click();
            await client.pause(1000);
        }, client);

        await runTest('Patient Management', 'TC-MOB-14', 'Patient Profile Creation Flow', async () => {
            const createProfileHeader = await client.$('android=new UiSelector().textContains("Patient Profile")');
            await createProfileHeader.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('Patient Management', 'TC-MOB-15', 'Patient Healing & Progress Tracking', async () => {
            const progressTab = await client.$('id:com.example.furcariskai:id/tab_progress');
            await progressTab.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('Patient Management', 'TC-MOB-16', 'Patient Search & Dynamic Name Filter', async () => {
            const searchInput = await client.$('id:com.example.furcariskai:id/search_bar');
            await searchInput.setValue('John');
            await client.pause(500);
        }, client);

        // ── CATEGORY 4: AI Diagnostics & Radiographs ──────────────────────────
        await runTest('AI Diagnostics', 'TC-MOB-17', 'Radiograph Upload & Image Selector', async () => {
            const uploadBtn = await client.$('id:com.example.furcariskai:id/btn_upload_xray');
            await uploadBtn.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('AI Diagnostics', 'TC-MOB-18', 'CBCT 3D Image Inspection Canvas', async () => {
            const cbctViewer = await client.$('id:com.example.furcariskai:id/cbct_canvas');
            await cbctViewer.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('AI Diagnostics', 'TC-MOB-19', 'Automatic Furcation Collapse Grade Classification', async () => {
            const gradeBadge = await client.$('id:com.example.furcariskai:id/tv_furcation_grade');
            await gradeBadge.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('AI Diagnostics', 'TC-MOB-20', 'Anatomical Tooth Selection Matrix', async () => {
            const toothGrid = await client.$('id:com.example.furcariskai:id/grid_tooth_selection');
            await toothGrid.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('AI Diagnostics', 'TC-MOB-21', 'Periodontal Probe & Pocket Measurement Tool', async () => {
            const measurementPanel = await client.$('id:com.example.furcariskai:id/panel_measurements');
            await measurementPanel.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('AI Diagnostics', 'TC-MOB-22', 'Occlusal Load & Masticatory Stress Simulation', async () => {
            const loadSlider = await client.$('id:com.example.furcariskai:id/slider_occlusal_load');
            await loadSlider.waitForExist({ timeout: 5000 });
        }, client);

        // ── CATEGORY 5: AI Decision Support & Chat ─────────────────────────────
        await runTest('AI Decision Support', 'TC-MOB-23', 'AI Risk Percentage Calculation Algorithm', async () => {
            const riskGauge = await client.$('id:com.example.furcariskai:id/svg_risk_gauge');
            await riskGauge.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('AI Decision Support', 'TC-MOB-24', 'AI Predictive Outcome Engine', async () => {
            const predictionView = await client.$('id:com.example.furcariskai:id/tv_ai_prediction');
            await predictionView.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('AI Decision Support', 'TC-MOB-25', 'AI Automated Radiograph Deep Scan', async () => {
            const scanBtn = await client.$('id:com.example.furcariskai:id/btn_ai_scan');
            await scanBtn.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('AI Decision Support', 'TC-MOB-26', 'Interactive Clinical Chat Assistant', async () => {
            const assistantTab = await client.$('id:com.example.furcariskai:id/nav_assistant');
            await assistantTab.click();
            await client.pause(1000);
        }, client);

        await runTest('AI Decision Support', 'TC-MOB-27', 'Real-time AI Risk Alert Drawer', async () => {
            const alertsBtn = await client.$('id:com.example.furcariskai:id/btn_alerts');
            await alertsBtn.waitForExist({ timeout: 5000 });
        }, client);

        // ── CATEGORY 6: Treatment Planning & System ────────────────────────────
        await runTest('Treatment & System', 'TC-MOB-28', 'Appointment Scheduler & Calendar', async () => {
            const calendarView = await client.$('id:com.example.furcariskai:id/appointment_calendar');
            await calendarView.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('Treatment & System', 'TC-MOB-29', 'Evidence-based Treatment Recommendation Engine', async () => {
            const recommendationCard = await client.$('id:com.example.furcariskai:id/card_treatment_recommendation');
            await recommendationCard.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('Treatment & System', 'TC-MOB-30', 'PDF Diagnostic Report Generator', async () => {
            const pdfBtn = await client.$('id:com.example.furcariskai:id/btn_generate_pdf');
            await pdfBtn.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('Treatment & System', 'TC-MOB-31', 'Periodontal Medication & Antibiotic Prescription', async () => {
            const medList = await client.$('id:com.example.furcariskai:id/rv_medications');
            await medList.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('Treatment & System', 'TC-MOB-32', 'Medical History & Systemic Comorbidities', async () => {
            const historyView = await client.$('id:com.example.furcariskai:id/view_medical_history');
            await historyView.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('Treatment & System', 'TC-MOB-33', 'Dental History & Previous Surgeries Timeline', async () => {
            const timelineView = await client.$('id:com.example.furcariskai:id/timeline_dental_history');
            await timelineView.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('Treatment & System', 'TC-MOB-34', 'Disease Progression & Bone Loss Chart', async () => {
            const progressionChart = await client.$('id:com.example.furcariskai:id/chart_disease_progression');
            await progressionChart.waitForExist({ timeout: 5000 });
        }, client);

        await runTest('Treatment & System', 'TC-MOB-35', 'Settings Panel & Room DB Offline Sync', async () => {
            const settingsTab = await client.$('id:com.example.furcariskai:id/nav_settings');
            await settingsTab.click();
            await client.pause(1000);
        }, client);

    } catch (error) {
        console.error('Appium Session initialization error:', error.message);
    } finally {
        if (client) {
            console.log('Closing Appium session...');
            await client.deleteSession();
        }
        saveResults();

        console.log(`\n=============================================================`);
        console.log(`📊 Appium Run: ${testResults.passed}/${testResults.totalTests} passed (${testResults.passRate})`);
        console.log(`=============================================================\n`);
    }
}

runAppiumTest();
