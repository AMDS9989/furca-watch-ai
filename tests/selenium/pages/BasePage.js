'use strict';
/**
 * BasePage – shared Selenium driver utilities.
 * All Page Objects extend this class.
 */
const { By, until } = require('selenium-webdriver');
const fs   = require('fs');
const path = require('path');
const { TIMEOUT_MS, SCREENSHOT_DIR } = require('../config');

class BasePage {
    /**
     * @param {import('selenium-webdriver').WebDriver} driver
     */
    constructor(driver) {
        this.driver  = driver;
        this.timeout = TIMEOUT_MS;
    }

    /** Navigate to an absolute URL */
    async navigate(url) {
        await this.driver.get(url);
    }

    /**
     * Wait for an element located by `locator` to be present in DOM.
     * @param {import('selenium-webdriver').By} locator
     * @param {number} [ms] – override default timeout
     */
    async waitFor(locator, ms) {
        return this.driver.wait(
            until.elementLocated(locator),
            ms || this.timeout,
            `Timed out waiting for element: ${locator}`
        );
    }

    /**
     * Wait for element to be both located AND visible.
     */
    async waitForVisible(locator, ms) {
        const el = await this.waitFor(locator, ms);
        await this.driver.wait(until.elementIsVisible(el), ms || this.timeout);
        return el;
    }

    /** Safely get text from an element, returning '' on error */
    async getText(locator) {
        try {
            const el = await this.waitFor(locator);
            return (await el.getText()).trim();
        } catch (_) {
            return '';
        }
    }

    /** Check if element with id exists in DOM (not necessarily visible) */
    async elementExists(id) {
        try {
            await this.driver.findElement(By.id(id));
            return true;
        } catch (_) {
            return false;
        }
    }

    /**
     * Inject JavaScript into the page context.
     * Used to bypass the auth screen by setting localStorage tokens.
     */
    async executeScript(script, ...args) {
        return this.driver.executeScript(script, ...args);
    }

    /**
     * Capture a screenshot to SCREENSHOT_DIR/<name>.png
     * @param {string} name – filename without extension
     */
    async screenshot(name) {
        try {
            if (!fs.existsSync(SCREENSHOT_DIR)) {
                fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
            }
            const img  = await this.driver.takeScreenshot();
            const file = path.join(SCREENSHOT_DIR, `${name}.png`);
            fs.writeFileSync(file, img, 'base64');
            console.log(`  📷  Screenshot saved: ${file}`);
            return file;
        } catch (e) {
            console.warn(`  ⚠️  Screenshot failed: ${e.message}`);
            return null;
        }
    }

    /** Sleep for `ms` milliseconds */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = BasePage;
