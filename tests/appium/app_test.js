const { remote } = require('webdriverio');
const path = require('path');
const fs = require('fs');

// Target APK location in project build directory
const apkPath = path.resolve(__dirname, '../../app/build/outputs/apk/debug/app-debug.apk');

// Results output file for report generators
const resultsFile = path.resolve(__dirname, '../results.json');
const screenshotsDir = path.resolve(__dirname, '../screenshots');

// Appium configuration capabilities
const wdOpts = {
    hostname: '127.0.0.1',
    port: 4723,
    logLevel: 'info',
    capabilities: {
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': 'Android Emulator',
        'appium:app': apkPath,
        'appium:appPackage': 'com.example.furcariskai',
        'appium:appActivity': '.MainActivity',
        'appium:noReset': false
    }
};

// Test results tracker
const testResults = {
    suiteName: 'FurcaRiskAI Android Appium E2E',
    buildNumber: process.env.GITHUB_RUN_NUMBER || 'local',
    executionDate: new Date().toISOString(),
    platform: 'Android',
    apkPath: apkPath,
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

async function runTest(name, fn, client) {
    const start = Date.now();
    try {
        await fn();
        const duration = Date.now() - start;
        testResults.tests.push({ name, status: 'PASS', duration, error: null });
        testResults.passed++;
        console.log(`  ✓ PASS [${duration}ms] ${name}`);
    } catch (err) {
        const duration = Date.now() - start;
        testResults.tests.push({ name, status: 'FAIL', duration, error: err.message });
        testResults.failed++;
        console.error(`  ✗ FAIL [${duration}ms] ${name}: ${err.message}`);
        // Take screenshot on failure
        if (client) {
            try {
                if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
                const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const screenshotPath = path.join(screenshotsDir, `fail_${safeName}_${Date.now()}.png`);
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
    const dir = path.dirname(resultsFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2), 'utf8');
    console.log(`\nTest results saved to: ${resultsFile}`);
}

async function runAppiumTest() {
    console.log(`Starting Appium E2E Android test for APK: ${apkPath}`);
    console.log('Connecting to Appium Server on port 4723...');

    let client;
    try {
        client = await remote(wdOpts);
        console.log('Appium session initialized. Launching FurcaRiskAI...');

        // TEST 1: App launch & welcome screen
        await runTest('App Launch – Welcome Screen Loaded', async () => {
            const bypassButton = await client.$('id:com.example.furcariskai:id/btn_bypass');
            await bypassButton.waitForExist({ timeout: 15000 });
        }, client);

        // TEST 2: Bypass login
        await runTest('Bypass Login Button – Click and Navigate to Dashboard', async () => {
            const bypassButton = await client.$('id:com.example.furcariskai:id/btn_bypass');
            await bypassButton.click();
        }, client);

        // TEST 3: Verify bottom navigation
        await runTest('Dashboard – Bottom Navigation Visible', async () => {
            const bottomNav = await client.$('id:com.example.furcariskai:id/bottom_navigation');
            await bottomNav.waitForExist({ timeout: 10000 });
        }, client);

        // TEST 4: Verify dashboard title text
        await runTest('Dashboard – Title Text Element Displayed', async () => {
            const dashboardTitle = await client.$('android=new UiSelector().textContains("Dashboard")');
            const isDisplayed = await dashboardTitle.isDisplayed();
            if (!isDisplayed) throw new Error('Dashboard screen text elements not displayed after bypass login.');
        }, client);

    } catch (error) {
        console.error('ERROR: Fatal Appium session error:', error.message);
        testResults.tests.push({ name: 'Appium Session Setup', status: 'FAIL', duration: 0, error: error.message });
        testResults.failed++;
        testResults.totalTests++;
    } finally {
        if (client) {
            console.log('Terminating Appium session...');
            await client.deleteSession();
        }
        saveResults();

        if (testResults.failed > 0) {
            console.error(`\n❌ ${testResults.failed} test(s) failed out of ${testResults.totalTests}.`);
            process.exitCode = 1;
        } else {
            console.log(`\n✅ All ${testResults.totalTests} tests passed.`);
        }
    }
}

runAppiumTest();
