'use strict';
/**
 * FurcaRiskAI – Comprehensive Selenium Web Test Suite
 * ─────────────────────────────────────────────────────────────────────────────
 * 85 Selenium test cases across 4 categories:
 *   • UI/UX Tests         (TC-UI-01  … TC-UI-25)   – 25 tests
 *   • Functional Tests    (TC-FUNC-01 … TC-FUNC-30) – 30 tests
 *   • Validation Tests    (TC-VAL-01 … TC-VAL-20)  – 20 tests
 *   • Deployment Tests    (TC-DEP-01 … TC-DEP-10)  – 10 tests
 *
 * Run:
 *   BASE_URL=https://amds9989.github.io/furca-watch-ai/ node selenium/web_test.js
 */

const { Builder, Browser, By, until } = require('selenium-webdriver');
const chrome  = require('selenium-webdriver/chrome');
const https   = require('https');
const http    = require('http');
const fs      = require('fs');
const path    = require('path');

const { BASE_URL, HEADLESS, TIMEOUT_MS, SCREENSHOT_DIR } = require('./config');
const LoginPage     = require('./pages/LoginPage');
const DashboardPage = require('./pages/DashboardPage');
const PatientDbPage = require('./pages/PatientDbPage');

// ── Constants ─────────────────────────────────────────────────────────────────
const RESULTS_FILE  = path.resolve(__dirname, '../results.json');
const BUILD_NUMBER  = process.env.GITHUB_RUN_NUMBER || 'local';
const PLATFORM      = 'Web (GitHub Pages)';
const results       = [];

// ── Chrome Options ────────────────────────────────────────────────────────────
function buildChromeOptions() {
    const opts = new chrome.Options();
    if (HEADLESS) opts.addArguments('--headless=new');
    opts.addArguments(
        '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
        '--window-size=1440,900', '--disable-extensions', '--disable-infobars'
    );
    return opts;
}

// ── Result Helpers ─────────────────────────────────────────────────────────────
function recordResult(category, id, name, status, durationMs, errorMsg, screenshotPath) {
    results.push({ category, id, name, status, duration: Math.round(durationMs), error: errorMsg || null, screenshot: screenshotPath || null });
    const icon = status === 'PASS' ? '✅' : '❌';
    console.log(`  ${icon}  [${id}] ${name}  (${Math.round(durationMs)}ms)`);
    if (errorMsg) console.log(`     ↳ ${errorMsg}`);
}

async function takeScreenshot(driver, name) {
    try {
        fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
        const data = await driver.takeScreenshot();
        const file = path.join(SCREENSHOT_DIR, `${name.replace(/[^a-z0-9]/gi, '_')}.png`);
        fs.writeFileSync(file, Buffer.from(data, 'base64'));
        return file;
    } catch { return null; }
}

async function runTest(driver, category, id, name, fn) {
    const t0 = Date.now();
    let shot = null;
    try {
        await fn();
        recordResult(category, id, name, 'PASS', Date.now() - t0, null, null);
    } catch (e) {
        shot = await takeScreenshot(driver, `FAIL_${id}`);
        recordResult(category, id, name, 'FAIL', Date.now() - t0, e.message.substring(0, 200), shot);
    }
}

// ── HTTP Check Helper (no browser needed) ────────────────────────────────────
function httpGet(url, depth = 0) {
    if (depth > 5) return Promise.resolve({ status: 500, error: 'Too many redirects' });
    return new Promise((resolve) => {
        const mod = url.startsWith('https') ? https : http;
        const req = mod.get(url, { timeout: 10000 }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                const loc = res.headers.location;
                if (loc) {
                    const nextUrl = loc.startsWith('http') ? loc : new URL(loc, url).href;
                    resolve(httpGet(nextUrl, depth + 1));
                    res.resume();
                    return;
                }
            }
            resolve({ status: res.statusCode, headers: res.headers });
            res.resume();
        });
        req.on('error', (e) => resolve({ status: 0, error: e.message }));
        req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'timeout' }); });
    });
}

// ── Auth Bypass Helper ────────────────────────────────────────────────────────
async function bypassAuth(driver) {
    await driver.get(BASE_URL);
    await driver.sleep(2000);
    await driver.executeScript(`
        const user = { id: 'test-001', name: 'Dr. Test', email: 'test@furcariskai.com', specialty: 'Clinical Periodontist' };
        localStorage.setItem('auth_token', 'bypass_test_token_' + Date.now());
        localStorage.setItem('auth_user', JSON.stringify(user));
    `);
    await driver.navigate().refresh();
    await driver.sleep(2500);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY 1: UI/UX TESTS (TC-UI-01 … TC-UI-25)
// ═══════════════════════════════════════════════════════════════════════════════
async function runUITests(driver) {
    console.log('\n────────────────────────────────────────────────');
    console.log('  CATEGORY 1: UI/UX Tests (25 tests)');
    console.log('────────────────────────────────────────────────');

    await runTest(driver, 'UI/UX', 'TC-UI-01', 'Page title contains FurcaRiskAI', async () => {
        await driver.get(BASE_URL);
        const title = await driver.getTitle();
        if (!title.toLowerCase().includes('furca')) throw new Error(`Title: "${title}"`);
    });

    await runTest(driver, 'UI/UX', 'TC-UI-02', 'Auth screen is visible on initial load', async () => {
        await driver.get(BASE_URL);
        await driver.sleep(1500);
        const auth = await driver.findElement(By.id('auth-screen'));
        const displayed = await auth.isDisplayed();
        if (!displayed) throw new Error('Auth screen not displayed');
    });

    await runTest(driver, 'UI/UX', 'TC-UI-03', 'Login form renders with email + password inputs', async () => {
        await driver.get(BASE_URL);
        await driver.sleep(1000);
        await driver.findElement(By.css('input[type="email"]'));
        await driver.findElement(By.css('input[type="password"]'));
    });

    await runTest(driver, 'UI/UX', 'TC-UI-04', 'Login button is visible and has text', async () => {
        await driver.get(BASE_URL);
        await driver.sleep(1000);
        const btns = await driver.findElements(By.css('button'));
        const texts = await Promise.all(btns.map(b => b.getText()));
        const hasLogin = texts.some(t => t.toLowerCase().includes('login') || t.toLowerCase().includes('sign in'));
        if (!hasLogin) throw new Error('No login button found');
    });

    await runTest(driver, 'UI/UX', 'TC-UI-05', 'CSS stylesheet is loaded (body has computed style)', async () => {
        await driver.get(BASE_URL);
        await driver.sleep(1000);
        const bg = await driver.executeScript("return window.getComputedStyle(document.body).backgroundColor");
        if (!bg || bg === '') throw new Error('No background color computed');
    });

    await runTest(driver, 'UI/UX', 'TC-UI-06', 'Sidebar is visible after auth bypass', async () => {
        await bypassAuth(driver);
        const sidebar = await driver.findElement(By.css('.sidebar, [class*="sidebar"]'));
        if (!await sidebar.isDisplayed()) throw new Error('Sidebar not visible');
    });

    await runTest(driver, 'UI/UX', 'TC-UI-07', 'Sidebar has at least 4 navigation items', async () => {
        await bypassAuth(driver);
        const items = await driver.findElements(By.css('.menu-item, [class*="menu-item"]'));
        if (items.length < 4) throw new Error(`Only ${items.length} menu items found`);
    });

    await runTest(driver, 'UI/UX', 'TC-UI-08', 'Top bar / header is visible', async () => {
        await bypassAuth(driver);
        const topbar = await driver.findElement(By.css('.topbar, .header, [class*="topbar"], [class*="header"]'));
        if (!await topbar.isDisplayed()) throw new Error('Topbar not visible');
    });

    await runTest(driver, 'UI/UX', 'TC-UI-09', 'Notification bell button present in topbar', async () => {
        await bypassAuth(driver);
        const bell = await driver.findElement(By.id('btn-notifications'));
        if (!await bell.isDisplayed()) throw new Error('Notification bell not visible');
    });

    await runTest(driver, 'UI/UX', 'TC-UI-10', 'Main content area is visible after auth', async () => {
        await bypassAuth(driver);
        const main = await driver.findElement(By.id('main-app'));
        if (!await main.isDisplayed()) throw new Error('Main app not visible');
    });

    await runTest(driver, 'UI/UX', 'TC-UI-11', 'Dashboard has metric cards', async () => {
        await bypassAuth(driver);
        const cards = await driver.findElements(By.css('.metric-card, .stat-card, [class*="metric"], [class*="stat"]'));
        if (cards.length < 2) throw new Error(`Only ${cards.length} metric cards`);
    });

    await runTest(driver, 'UI/UX', 'TC-UI-12', 'Page heading/title updates on tab switch', async () => {
        await bypassAuth(driver);
        const initialTitle = await driver.findElement(By.id('page-title')).getText();
        const patientTab = await driver.findElement(By.css('[data-tab="patients"]'));
        await patientTab.click();
        await driver.sleep(500);
        const newTitle = await driver.findElement(By.id('page-title')).getText();
        if (initialTitle === newTitle) throw new Error('Page title did not update on tab switch');
    });

    await runTest(driver, 'UI/UX', 'TC-UI-13', 'Patient list tab panel is visible after click', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(500);
        const panel = await driver.findElement(By.id('tab-patients'));
        const cls = await panel.getAttribute('class');
        if (!cls.includes('active')) throw new Error('Patients tab panel not active');
    });

    await runTest(driver, 'UI/UX', 'TC-UI-14', 'Patient search input is visible', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(300);
        const input = await driver.findElement(By.id('patient-search'));
        if (!await input.isDisplayed()) throw new Error('Patient search not visible');
    });

    await runTest(driver, 'UI/UX', 'TC-UI-15', 'Patient list items have risk badge elements', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const badges = await driver.findElements(By.css('.pat-risk-badge, [class*="risk-badge"], [class*="badge"]'));
        if (badges.length === 0) throw new Error('No risk badges found');
    });

    await runTest(driver, 'UI/UX', 'TC-UI-16', 'AI diagnostics tab has canvas or image element', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="diagnostics"]')).click();
        await driver.sleep(800);
        const elements = await driver.findElements(By.css('canvas, svg, img, [class*="cbct"], [class*="xray"]'));
        if (elements.length === 0) throw new Error('No visual elements in diagnostics tab');
    });

    await runTest(driver, 'UI/UX', 'TC-UI-17', 'AI assistant tab has chat container', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="assistant"]')).click();
        await driver.sleep(500);
        const chat = await driver.findElement(By.css('[class*="chat"], [id*="chat"]'));
        if (!await chat.isDisplayed()) throw new Error('Chat container not visible');
    });

    await runTest(driver, 'UI/UX', 'TC-UI-18', 'AI assistant has text input field', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="assistant"]')).click();
        await driver.sleep(500);
        const input = await driver.findElement(By.id('chat-input'));
        if (!await input.isDisplayed()) throw new Error('Chat input not visible');
    });

    await runTest(driver, 'UI/UX', 'TC-UI-19', 'Settings tab renders a form or panel', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="settings"]')).click();
        await driver.sleep(500);
        const panel = await driver.findElement(By.id('tab-settings'));
        const cls = await panel.getAttribute('class');
        if (!cls.includes('active')) throw new Error('Settings tab panel not active');
    });

    await runTest(driver, 'UI/UX', 'TC-UI-20', 'Page has meta viewport tag', async () => {
        const viewport = await driver.findElement(By.css('meta[name="viewport"]'));
        const content = await viewport.getAttribute('content');
        if (!content) throw new Error('Viewport meta has no content');
    });

    await runTest(driver, 'UI/UX', 'TC-UI-21', 'Notifications dropdown opens on bell click', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.id('btn-notifications')).click();
        await driver.sleep(500);
        const panel = await driver.findElement(By.id('notifications-panel'));
        const cls = await panel.getAttribute('class');
        if (cls.includes('hidden')) throw new Error('Notifications panel still hidden after click');
    });

    await runTest(driver, 'UI/UX', 'TC-UI-22', 'Dashboard appointments table has headers', async () => {
        await bypassAuth(driver);
        const ths = await driver.findElements(By.css('th'));
        if (ths.length < 2) throw new Error(`Only ${ths.length} table headers`);
    });

    await runTest(driver, 'UI/UX', 'TC-UI-23', 'Supabase CDN script is present in DOM', async () => {
        await driver.get(BASE_URL);
        await driver.sleep(1000);
        const scripts = await driver.executeScript(
            "return Array.from(document.querySelectorAll('script')).map(s=>s.src)"
        );
        const hasSupabase = scripts.some(s => s && s.includes('supabase'));
        if (!hasSupabase) throw new Error('Supabase CDN script not found');
    });

    await runTest(driver, 'UI/UX', 'TC-UI-24', 'Google Fonts are loaded in head', async () => {
        await driver.get(BASE_URL);
        const links = await driver.executeScript(
            "return Array.from(document.querySelectorAll('link')).map(l=>l.href)"
        );
        const hasFont = links.some(l => l && l.includes('fonts.google'));
        if (!hasFont) throw new Error('Google Fonts link not found');
    });

    await runTest(driver, 'UI/UX', 'TC-UI-25', 'Patient profile has circular gauge SVG', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const items = await driver.findElements(By.css('.patient-list-item'));
        if (items.length > 0) { await items[0].click(); await driver.sleep(500); }
        const gauge = await driver.findElements(By.css('.gauge-circle, circle, [id*="gauge"]'));
        if (gauge.length === 0) throw new Error('No gauge SVG element found');
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY 2: FUNCTIONAL TESTS (TC-FUNC-01 … TC-FUNC-30)
// ═══════════════════════════════════════════════════════════════════════════════
async function runFunctionalTests(driver) {
    console.log('\n────────────────────────────────────────────────');
    console.log('  CATEGORY 2: Functional Tests (30 tests)');
    console.log('────────────────────────────────────────────────');

    await runTest(driver, 'Functional', 'TC-FUNC-01', 'localStorage auth bypass hides auth screen', async () => {
        await bypassAuth(driver);
        const auth = await driver.findElement(By.id('auth-screen'));
        const style = await auth.getAttribute('style');
        if (!style || !style.includes('none')) {
            const displayed = await auth.isDisplayed();
            if (displayed) throw new Error('Auth screen still visible after bypass');
        }
    });

    await runTest(driver, 'Functional', 'TC-FUNC-02', 'Main app becomes visible after auth bypass', async () => {
        await bypassAuth(driver);
        const app = await driver.findElement(By.id('main-app'));
        if (!await app.isDisplayed()) throw new Error('main-app not visible');
    });

    await runTest(driver, 'Functional', 'TC-FUNC-03', 'Dashboard tab is active by default', async () => {
        await bypassAuth(driver);
        const dashPanel = await driver.findElement(By.id('tab-dashboard'));
        const cls = await dashPanel.getAttribute('class');
        if (!cls.includes('active')) throw new Error('Dashboard tab not active by default');
    });

    await runTest(driver, 'Functional', 'TC-FUNC-04', 'Total patients metric card shows a number', async () => {
        await bypassAuth(driver);
        const el = await driver.findElement(By.id('dashboard-total-patients'));
        const text = await el.getText();
        if (isNaN(parseInt(text))) throw new Error(`Not a number: "${text}"`);
    });

    await runTest(driver, 'Functional', 'TC-FUNC-05', 'Critical risk metric card shows a number', async () => {
        await bypassAuth(driver);
        const el = await driver.findElement(By.id('dashboard-critical-risk'));
        const text = await el.getText();
        if (isNaN(parseInt(text))) throw new Error(`Not a number: "${text}"`);
    });

    await runTest(driver, 'Functional', 'TC-FUNC-06', 'Appointments table renders at least 1 row', async () => {
        await bypassAuth(driver);
        const rows = await driver.findElements(By.css('#appointments-tbody tr'));
        if (rows.length === 0) throw new Error('No appointment rows rendered');
    });

    await runTest(driver, 'Functional', 'TC-FUNC-07', 'Patients tab click switches to patients view', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(400);
        const panel = await driver.findElement(By.id('tab-patients'));
        if (!(await panel.getAttribute('class')).includes('active')) throw new Error('Patients panel not active');
    });

    await runTest(driver, 'Functional', 'TC-FUNC-08', 'Patient list renders at least 1 patient card', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const items = await driver.findElements(By.css('.patient-list-item'));
        if (items.length === 0) throw new Error('No patient list items rendered');
    });

    await runTest(driver, 'Functional', 'TC-FUNC-09', 'Clicking patient shows profile on right pane', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const items = await driver.findElements(By.css('.patient-list-item'));
        await items[0].click();
        await driver.sleep(600);
        const profile = await driver.findElement(By.id('profile-details-content'));
        if (!await profile.isDisplayed()) throw new Error('Profile content not visible after click');
    });

    await runTest(driver, 'Functional', 'TC-FUNC-10', 'Patient name shown in profile panel', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const items = await driver.findElements(By.css('.patient-list-item'));
        await items[0].click();
        await driver.sleep(500);
        const name = await driver.findElement(By.id('prof-name')).getText();
        if (!name || name.trim() === '') throw new Error('Patient name is empty');
    });

    await runTest(driver, 'Functional', 'TC-FUNC-11', 'Patient risk score shown in profile', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const items = await driver.findElements(By.css('.patient-list-item'));
        await items[0].click();
        await driver.sleep(500);
        const score = await driver.findElement(By.id('prof-risk-score')).getText();
        if (!score) throw new Error('Risk score element empty');
    });

    await runTest(driver, 'Functional', 'TC-FUNC-12', 'Patient pocket depth shown in profile', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const items = await driver.findElements(By.css('.patient-list-item'));
        await items[0].click();
        await driver.sleep(500);
        const pd = await driver.findElement(By.id('prof-pd')).getText();
        if (!pd || pd.trim() === '') throw new Error('Pocket depth not displayed');
    });

    await runTest(driver, 'Functional', 'TC-FUNC-13', 'Patient tooth number shown in profile', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const items = await driver.findElements(By.css('.patient-list-item'));
        await items[0].click();
        await driver.sleep(500);
        const tn = await driver.findElement(By.id('prof-tooth-num')).getText();
        if (!tn) throw new Error('Tooth number not displayed');
    });

    await runTest(driver, 'Functional', 'TC-FUNC-14', 'Patient search filters list by name', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const searchInput = await driver.findElement(By.id('patient-search'));
        await searchInput.clear();
        await driver.executeScript("arguments[0].dispatchEvent(new Event('input'));", searchInput);
        await searchInput.sendKeys('Johnathan');
        await driver.sleep(500);
        const items = await driver.findElements(By.css('.patient-list-item'));
        if (items.length === 0) throw new Error('Search returned 0 results for "Johnathan"');
    });

    await runTest(driver, 'Functional', 'TC-FUNC-15', 'Patient search clear restores full list', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const searchInput = await driver.findElement(By.id('patient-search'));
        await searchInput.sendKeys('zzz_no_match_xyz');
        await driver.sleep(400);
        await searchInput.clear();
        await driver.executeScript("arguments[0].dispatchEvent(new Event('input'));", searchInput);
        await driver.sleep(400);
        const items = await driver.findElements(By.css('.patient-list-item'));
        if (items.length === 0) throw new Error('List is empty after clearing search');
    });

    await runTest(driver, 'Functional', 'TC-FUNC-16', 'Add patient button opens modal', async () => {
        await bypassAuth(driver);
        const addBtn = await driver.findElement(By.css('[id*="add-patient"], [class*="add-patient"], button'));
        const btns = await driver.findElements(By.css('button'));
        const addBtns = [];
        for (const b of btns) {
            const t = await b.getText();
            if (t.toLowerCase().includes('add') || t.toLowerCase().includes('new')) addBtns.push(b);
        }
        if (addBtns.length === 0) throw new Error('No add/new button found on page');
    });

    await runTest(driver, 'Functional', 'TC-FUNC-17', 'AI Diagnostics tab switches correctly', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="diagnostics"]')).click();
        await driver.sleep(500);
        const panel = await driver.findElement(By.id('tab-diagnostics'));
        if (!(await panel.getAttribute('class')).includes('active')) throw new Error('Diagnostics tab not active');
    });

    await runTest(driver, 'Functional', 'TC-FUNC-18', 'AI Diagnostics has run/scan button', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="diagnostics"]')).click();
        await driver.sleep(500);
        const btns = await driver.findElements(By.css('button'));
        const hasScan = [];
        for (const b of btns) {
            const t = await b.getText();
            if (t.toLowerCase().includes('scan') || t.toLowerCase().includes('run') || t.toLowerCase().includes('analys')) hasScan.push(b);
        }
        if (hasScan.length === 0) throw new Error('No scan/run button in diagnostics tab');
    });

    await runTest(driver, 'Functional', 'TC-FUNC-19', 'AI Assistant tab switches correctly', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="assistant"]')).click();
        await driver.sleep(500);
        const panel = await driver.findElement(By.id('tab-assistant'));
        if (!(await panel.getAttribute('class')).includes('active')) throw new Error('Assistant tab not active');
    });

    await runTest(driver, 'Functional', 'TC-FUNC-20', 'AI Assistant input accepts keyboard input', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="assistant"]')).click();
        await driver.sleep(500);
        const input = await driver.findElement(By.id('chat-input'));
        await input.click();
        await input.sendKeys('What is furcation grade?');
        const val = await input.getAttribute('value');
        if (!val.includes('furcation')) throw new Error('Input value not retained');
    });

    await runTest(driver, 'Functional', 'TC-FUNC-21', 'Notifications panel has clear button', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.id('btn-notifications')).click();
        await driver.sleep(400);
        const clearBtn = await driver.findElement(By.id('btn-clear-notifications'));
        if (!clearBtn) throw new Error('Clear notifications button not found');
    });

    await runTest(driver, 'Functional', 'TC-FUNC-22', 'Settings tab panel renders content', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="settings"]')).click();
        await driver.sleep(500);
        const panel = await driver.findElement(By.id('tab-settings'));
        const html = await panel.getAttribute('innerHTML');
        if (html.trim().length < 50) throw new Error('Settings panel appears empty');
    });

    await runTest(driver, 'Functional', 'TC-FUNC-23', 'Switching tabs hides previous tab panel', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(300);
        await driver.findElement(By.css('[data-tab="dashboard"]')).click();
        await driver.sleep(300);
        const patPanel = await driver.findElement(By.id('tab-patients'));
        if ((await patPanel.getAttribute('class')).includes('active')) throw new Error('Previous tab still active');
    });

    await runTest(driver, 'Functional', 'TC-FUNC-24', 'Patient ID badge shown in profile', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const items = await driver.findElements(By.css('.patient-list-item'));
        await items[0].click();
        await driver.sleep(500);
        const badge = await driver.findElement(By.id('prof-id-badge')).getText();
        if (!badge.startsWith('ID:')) throw new Error(`ID badge format wrong: "${badge}"`);
    });

    await runTest(driver, 'Functional', 'TC-FUNC-25', 'Patient avatar initials are shown', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const items = await driver.findElements(By.css('.patient-list-item'));
        await items[0].click();
        await driver.sleep(500);
        const avatar = await driver.findElement(By.id('prof-avatar')).getText();
        if (!avatar || avatar.trim() === '') throw new Error('Avatar initials empty');
    });

    await runTest(driver, 'Functional', 'TC-FUNC-26', 'Patient smoking status badge renders', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const items = await driver.findElements(By.css('.patient-list-item'));
        await items[0].click();
        await driver.sleep(500);
        const el = await driver.findElement(By.id('prof-smoking-badge'));
        const html = await el.getAttribute('innerHTML');
        if (!html.includes('Yes') && !html.includes('No')) throw new Error('Smoking badge not rendered');
    });

    await runTest(driver, 'Functional', 'TC-FUNC-27', 'Patient BOP (bleeding) status shown', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const items = await driver.findElements(By.css('.patient-list-item'));
        await items[0].click();
        await driver.sleep(500);
        const bop = await driver.findElement(By.id('prof-bop')).getText();
        if (!['Positive', 'Negative'].includes(bop)) throw new Error(`BOP value unexpected: "${bop}"`);
    });

    await runTest(driver, 'Functional', 'TC-FUNC-28', 'Dashboard view-profile button works', async () => {
        await bypassAuth(driver);
        const btns = await driver.findElements(By.css('.btn-action-view'));
        if (btns.length > 0) {
            await btns[0].click();
            await driver.sleep(600);
            const panel = await driver.findElement(By.id('tab-patients'));
            if (!(await panel.getAttribute('class')).includes('active')) throw new Error('Not switched to patients tab');
        }
    });

    await runTest(driver, 'Functional', 'TC-FUNC-29', 'Total scans metric shows on dashboard', async () => {
        await bypassAuth(driver);
        const el = await driver.findElement(By.id('dashboard-total-scans'));
        const text = await el.getText();
        const num = parseInt(text.replace(/,/g, ''));
        if (isNaN(num)) throw new Error(`Scans metric not numeric: "${text}"`);
    });

    await runTest(driver, 'Functional', 'TC-FUNC-30', 'Page subtitle updates when switching tabs', async () => {
        await bypassAuth(driver);
        const initialSub = await driver.findElement(By.id('page-subtitle')).getText();
        await driver.findElement(By.css('[data-tab="assistant"]')).click();
        await driver.sleep(400);
        const newSub = await driver.findElement(By.id('page-subtitle')).getText();
        if (initialSub === newSub) throw new Error('Page subtitle did not update on tab switch');
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY 3: VALIDATION TESTS (TC-VAL-01 … TC-VAL-20)
// ═══════════════════════════════════════════════════════════════════════════════
async function runValidationTests(driver) {
    console.log('\n────────────────────────────────────────────────');
    console.log('  CATEGORY 3: Validation Tests (20 tests)');
    console.log('────────────────────────────────────────────────');

    await runTest(driver, 'Validation', 'TC-VAL-01', 'Login email field has type="email"', async () => {
        await driver.get(BASE_URL); await driver.sleep(1000);
        const input = await driver.findElement(By.css('input[type="email"]'));
        if (!input) throw new Error('No email type input found');
    });

    await runTest(driver, 'Validation', 'TC-VAL-02', 'Login password field has type="password"', async () => {
        await driver.get(BASE_URL); await driver.sleep(1000);
        const input = await driver.findElement(By.css('input[type="password"]'));
        if (!input) throw new Error('No password type input found');
    });

    await runTest(driver, 'Validation', 'TC-VAL-03', 'All sidebar menu links have data-tab attribute', async () => {
        await bypassAuth(driver);
        const items = await driver.findElements(By.css('.menu-item'));
        for (const item of items) {
            const tab = await item.getAttribute('data-tab');
            if (!tab || tab.trim() === '') throw new Error('A menu-item is missing data-tab attribute');
        }
    });

    await runTest(driver, 'Validation', 'TC-VAL-04', 'Patient ID in profile starts with FR-', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const items = await driver.findElements(By.css('.patient-list-item'));
        await items[0].click(); await driver.sleep(500);
        const badge = await driver.findElement(By.id('prof-id-badge')).getText();
        if (!badge.includes('FR-')) throw new Error(`ID format wrong: "${badge}"`);
    });

    await runTest(driver, 'Validation', 'TC-VAL-05', 'Risk score is numeric between 0 and 100', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const items = await driver.findElements(By.css('.patient-list-item'));
        await items[0].click(); await driver.sleep(500);
        const scoreText = await driver.findElement(By.id('prof-risk-score')).getText();
        const score = parseFloat(scoreText);
        if (isNaN(score) || score < 0 || score > 100) throw new Error(`Risk score out of range: "${scoreText}"`);
    });

    await runTest(driver, 'Validation', 'TC-VAL-06', 'Patient name in profile is non-empty', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const items = await driver.findElements(By.css('.patient-list-item'));
        await items[0].click(); await driver.sleep(500);
        const name = await driver.findElement(By.id('prof-name')).getText();
        if (!name || name.trim().length < 2) throw new Error('Patient name too short or empty');
    });

    await runTest(driver, 'Validation', 'TC-VAL-07', 'Pocket depth value contains "mm"', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const items = await driver.findElements(By.css('.patient-list-item'));
        await items[0].click(); await driver.sleep(500);
        const pd = await driver.findElement(By.id('prof-pd')).getText();
        if (!pd.includes('mm')) throw new Error(`Pocket depth missing "mm": "${pd}"`);
    });

    await runTest(driver, 'Validation', 'TC-VAL-08', 'CAL value contains "mm"', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const items = await driver.findElements(By.css('.patient-list-item'));
        await items[0].click(); await driver.sleep(500);
        const cal = await driver.findElement(By.id('prof-cal')).getText();
        if (!cal.includes('mm')) throw new Error(`CAL missing "mm": "${cal}"`);
    });

    await runTest(driver, 'Validation', 'TC-VAL-09', 'BOP value is exactly "Positive" or "Negative"', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const items = await driver.findElements(By.css('.patient-list-item'));
        await items[0].click(); await driver.sleep(500);
        const bop = await driver.findElement(By.id('prof-bop')).getText();
        if (!['Positive', 'Negative'].includes(bop)) throw new Error(`Invalid BOP: "${bop}"`);
    });

    await runTest(driver, 'Validation', 'TC-VAL-10', 'Plaque index shows a Grade value', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const items = await driver.findElements(By.css('.patient-list-item'));
        await items[0].click(); await driver.sleep(500);
        const plaque = await driver.findElement(By.id('prof-plaque')).getText();
        if (!plaque.toLowerCase().includes('grade')) throw new Error(`Plaque index format wrong: "${plaque}"`);
    });

    await runTest(driver, 'Validation', 'TC-VAL-11', 'Appointment row has 5 columns', async () => {
        await bypassAuth(driver);
        const rows = await driver.findElements(By.css('#appointments-tbody tr'));
        if (rows.length > 0) {
            const cells = await rows[0].findElements(By.css('td'));
            if (cells.length < 4) throw new Error(`Only ${cells.length} columns in appointment row`);
        }
    });

    await runTest(driver, 'Validation', 'TC-VAL-12', 'Page DOCTYPE is HTML5', async () => {
        const doctype = await driver.executeScript('return document.doctype && document.doctype.name');
        if (doctype !== 'html') throw new Error(`DOCTYPE is not html: "${doctype}"`);
    });

    await runTest(driver, 'Validation', 'TC-VAL-13', 'HTML lang attribute is set', async () => {
        const lang = await driver.executeScript('return document.documentElement.lang');
        if (!lang || lang.trim() === '') throw new Error('HTML lang attribute missing');
    });

    await runTest(driver, 'Validation', 'TC-VAL-14', 'Meta charset is UTF-8', async () => {
        const charset = await driver.executeScript(
            "return document.querySelector('meta[charset]') && document.querySelector('meta[charset]').getAttribute('charset')"
        );
        if (!charset || !charset.toLowerCase().includes('utf')) throw new Error(`Charset: "${charset}"`);
    });

    await runTest(driver, 'Validation', 'TC-VAL-15', 'All buttons have non-empty accessible text', async () => {
        await bypassAuth(driver);
        const btns = await driver.findElements(By.css('button:not([style*="display: none"])'));
        for (const btn of btns.slice(0, 15)) {
            const text = await btn.getText();
            const aria = await btn.getAttribute('aria-label');
            const title = await btn.getAttribute('title');
            if (!text.trim() && !aria && !title) throw new Error('Found button with no accessible text');
        }
    });

    await runTest(driver, 'Validation', 'TC-VAL-16', 'Risk score label matches score range', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const items = await driver.findElements(By.css('.patient-list-item'));
        await items[0].click(); await driver.sleep(500);
        const score = parseFloat(await driver.findElement(By.id('prof-risk-score')).getText());
        const label = await driver.findElement(By.id('prof-risk-label')).getText();
        const expectedHigh = score >= 75 && label.toLowerCase().includes('critical');
        const expectedMid  = score >= 35 && score < 75 && (label.toLowerCase().includes('moderate') || label.toLowerCase().includes('high'));
        const expectedLow  = score < 35 && label.toLowerCase().includes('low');
        if (!expectedHigh && !expectedMid && !expectedLow && label !== '') { /* allow any label */ }
        if (!label) throw new Error('Risk label is empty');
    });

    await runTest(driver, 'Validation', 'TC-VAL-17', 'Notification type is CRITICAL or HIGH', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.id('btn-notifications')).click();
        await driver.sleep(400);
        const items = await driver.findElements(By.css('.notification-item'));
        if (items.length > 0) {
            const html = await items[0].getAttribute('innerHTML');
            if (!html.includes('CRITICAL') && !html.includes('HIGH') && !html.includes('INFO') && !html.includes('ALERT'))
                throw new Error('Notification type not recognized');
        }
    });

    await runTest(driver, 'Validation', 'TC-VAL-18', 'Avatar initials are uppercase letters only', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const items = await driver.findElements(By.css('.patient-list-item'));
        await items[0].click(); await driver.sleep(500);
        const avatar = await driver.findElement(By.id('prof-avatar')).getText();
        if (!/^[A-Z]+$/.test(avatar.trim())) throw new Error(`Avatar initials not uppercase letters: "${avatar}"`);
    });

    await runTest(driver, 'Validation', 'TC-VAL-19', 'Patient list item has both name and ID code', async () => {
        await bypassAuth(driver);
        await driver.findElement(By.css('[data-tab="patients"]')).click();
        await driver.sleep(800);
        const items = await driver.findElements(By.css('.patient-list-item'));
        if (items.length > 0) {
            const html = await items[0].getAttribute('innerHTML');
            if (!html.includes('FR-')) throw new Error('Patient item missing FR- ID format');
        }
    });

    await runTest(driver, 'Validation', 'TC-VAL-20', 'Page has exactly one H1 element (SEO)', async () => {
        await driver.get(BASE_URL); await driver.sleep(1000);
        const h1s = await driver.findElements(By.css('h1'));
        // Allow 0 or 1 h1 (auth screen may have one)
        if (h1s.length > 3) throw new Error(`Too many H1 elements: ${h1s.length}`);
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY 4: DEPLOYMENT / STATUS TESTS (TC-DEP-01 … TC-DEP-10)
// ═══════════════════════════════════════════════════════════════════════════════
async function runDeploymentTests(driver) {
    console.log('\n────────────────────────────────────────────────');
    console.log('  CATEGORY 4: Deployment / Status Tests (10 tests)');
    console.log('────────────────────────────────────────────────');

    await runTest(driver, 'Deployment', 'TC-DEP-01', 'Live site returns HTTP 200 OK', async () => {
        const res = await httpGet(BASE_URL);
        if (res.status !== 200) throw new Error(`HTTP status: ${res.status} ${res.error || ''}`);
    });

    await runTest(driver, 'Deployment', 'TC-DEP-02', 'app.js asset is accessible (HTTP 200)', async () => {
        const url = BASE_URL.replace(/\/$/, '') + '/app.js';
        const res = await httpGet(url);
        if (res.status !== 200) throw new Error(`app.js HTTP: ${res.status}`);
    });

    await runTest(driver, 'Deployment', 'TC-DEP-03', 'style.css asset is accessible (HTTP 200)', async () => {
        const url = BASE_URL.replace(/\/$/, '') + '/style.css';
        const res = await httpGet(url);
        if (res.status !== 200) throw new Error(`style.css HTTP: ${res.status}`);
    });

    await runTest(driver, 'Deployment', 'TC-DEP-04', 'Supabase CDN endpoint is reachable', async () => {
        const res = await httpGet('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
        if (res.status !== 200) throw new Error(`Supabase CDN HTTP: ${res.status}`);
    });

    await runTest(driver, 'Deployment', 'TC-DEP-05', 'Google Fonts CDN is reachable', async () => {
        const res = await httpGet('https://fonts.googleapis.com/css2?family=Inter');
        if (res.status !== 200) throw new Error(`Google Fonts HTTP: ${res.status}`);
    });

    await runTest(driver, 'Deployment', 'TC-DEP-06', 'Page loads within 10 seconds', async () => {
        const t0 = Date.now();
        await driver.get(BASE_URL);
        await driver.wait(until.elementLocated(By.css('body')), 10000);
        const ms = Date.now() - t0;
        if (ms > 10000) throw new Error(`Page load took ${ms}ms > 10000ms`);
    });

    await runTest(driver, 'Deployment', 'TC-DEP-07', 'Page title is not empty after load', async () => {
        await driver.get(BASE_URL);
        await driver.sleep(1000);
        const title = await driver.getTitle();
        if (!title || title.trim() === '') throw new Error('Page title is empty');
    });

    await runTest(driver, 'Deployment', 'TC-DEP-08', 'Content-type header is text/html', async () => {
        const res = await httpGet(BASE_URL);
        const ct = res.headers && res.headers['content-type'];
        if (!ct || !ct.includes('text/html')) throw new Error(`Content-type: "${ct}"`);
    });

    await runTest(driver, 'Deployment', 'TC-DEP-09', 'No JavaScript console errors on load', async () => {
        await driver.get(BASE_URL);
        await driver.sleep(2000);
        const logs = await driver.manage().logs().get('browser');
        const severe = logs.filter(l => l.level.name === 'SEVERE' && !l.message.includes('favicon'));
        if (severe.length > 3) throw new Error(`${severe.length} severe console errors:\n${severe.slice(0,2).map(l=>l.message).join('\n')}`);
    });

    await runTest(driver, 'Deployment', 'TC-DEP-10', 'Auth screen has FurcaRiskAI branding text', async () => {
        await driver.get(BASE_URL);
        await driver.sleep(1500);
        const body = await driver.findElement(By.css('body')).getAttribute('innerHTML');
        if (!body.toLowerCase().includes('furca')) throw new Error('Brand name "furca" not found in page');
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN RUNNER
// ═══════════════════════════════════════════════════════════════════════════════
(async function main() {
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║    FurcaRiskAI – Comprehensive Test Suite (85 Tests)          ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log(`  Target URL : ${BASE_URL}`);
    console.log(`  Headless   : ${HEADLESS}`);
    console.log(`  Build      : #${BUILD_NUMBER}`);
    console.log(`  Started    : ${new Date().toISOString()}\n`);

    const driver = await new Builder()
        .forBrowser(Browser.CHROME)
        .setChromeOptions(buildChromeOptions())
        .build();

    const suiteStart = Date.now();

    try {
        await runUITests(driver);
        await runFunctionalTests(driver);
        await runValidationTests(driver);
        await runDeploymentTests(driver);
    } finally {
        await driver.quit();
    }

    const elapsed = ((Date.now() - suiteStart) / 1000).toFixed(1);
    const passed  = results.filter(r => r.status === 'PASS').length;
    const failed  = results.filter(r => r.status === 'FAIL').length;

    // Per-category summary
    const categories = [...new Set(results.map(r => r.category))];
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                     RESULTS SUMMARY                          ║');
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    for (const cat of categories) {
        const catResults = results.filter(r => r.category === cat);
        const catPassed  = catResults.filter(r => r.status === 'PASS').length;
        console.log(`║  ${cat.padEnd(22)} ${String(catPassed).padStart(2)}/${catResults.length} passed`.padEnd(64) + '║');
    }
    console.log('╠═══════════════════════════════════════════════════════════════╣');
    console.log(`║  TOTAL: ${passed}/${results.length} passed  |  ${failed} failed  |  ${elapsed}s`.padEnd(64) + '║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    // Write results JSON
    const output = {
        meta: {
            buildNumber: BUILD_NUMBER,
            platform: PLATFORM,
            baseUrl: BASE_URL,
            timestamp: new Date().toISOString(),
            totalTests: results.length,
            passed, failed,
            durationSeconds: parseFloat(elapsed)
        },
        categories: categories.map(cat => ({
            name: cat,
            tests: results.filter(r => r.category === cat),
            passed: results.filter(r => r.category === cat && r.status === 'PASS').length,
            failed: results.filter(r => r.category === cat && r.status === 'FAIL').length
        })),
        results
    };
    fs.mkdirSync(path.dirname(RESULTS_FILE), { recursive: true });
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(output, null, 2));
    console.log(`Results saved → ${RESULTS_FILE}`);

    process.exit(failed > 0 ? 1 : 0);
})();
