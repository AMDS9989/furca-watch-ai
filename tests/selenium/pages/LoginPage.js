'use strict';
/**
 * LoginPage – handles authentication for FurcaRiskAI.
 *
 * The app uses localStorage('auth_token') + localStorage('auth_user') to
 * determine whether to show the auth overlay.  In CI we bypass the network
 * login call by injecting tokens directly, then reloading so the app's
 * checkAuth() function initialises the dashboard normally.
 */
const { By, until } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const { BASE_URL } = require('../config');

// Minimal user object that satisfies the app's checkAuth() expectations
const TEST_USER = JSON.stringify({
    id:        'test-e2e-001',
    name:      'Dr. E2E Test',
    specialty: 'Clinical Periodontist',
    email:     'e2e@furcariskai.test'
});
const TEST_TOKEN = 'e2e-test-token-furcariskai-2026';

class LoginPage extends BasePage {
    /**
     * Navigate to BASE_URL and bypass the login screen by injecting
     * auth tokens directly into localStorage, then reloading.
     * This avoids any dependency on the backend API server.
     */
    async bypassLogin() {
        // 1. Load the page (auth screen will be visible)
        await this.navigate(BASE_URL + '/');

        // 2. Wait for the page to finish loading (at minimum the auth overlay must exist)
        await this.waitFor(By.id('auth-screen'));

        // 3. Inject auth tokens via JavaScript
        await this.executeScript(`
            localStorage.setItem('auth_token', '${TEST_TOKEN}');
            localStorage.setItem('auth_user',  '${TEST_USER}');
        `);

        // 4. Reload so checkAuth() picks up the tokens and hides the overlay
        await this.driver.navigate().refresh();

        // 5. Wait for auth screen to disappear (class 'hidden' added by checkAuth)
        await this.driver.wait(async () => {
            const el = await this.driver.findElement(By.id('auth-screen'));
            const cls = await el.getAttribute('class');
            return cls && cls.includes('hidden');
        }, this.timeout, 'Auth screen did not hide after localStorage token injection');
    }

    /**
     * Perform a full UI login (email + password).
     * Only usable when a backend is live.  Prefer bypassLogin() in CI.
     * @param {string} email
     * @param {string} password
     */
    async loginViaUI(email, password) {
        await this.navigate(BASE_URL + '/');
        await this.waitFor(By.id('auth-screen'));

        const emailInput = await this.waitForVisible(By.id('login-email'));
        await emailInput.sendKeys(email);

        const passInput = await this.driver.findElement(By.id('login-password'));
        await passInput.sendKeys(password);

        const submitBtn = await this.driver.findElement(By.id('btn-login-submit'));
        await submitBtn.click();

        // Wait for auth screen to hide
        await this.driver.wait(async () => {
            const el = await this.driver.findElement(By.id('auth-screen'));
            const cls = await el.getAttribute('class');
            return cls && cls.includes('hidden');
        }, this.timeout, 'Login failed: auth screen still visible after submit');
    }

    /** Clear stored auth tokens (simulate logout state) */
    async clearAuth() {
        await this.executeScript(`
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
        `);
    }
}

module.exports = LoginPage;
