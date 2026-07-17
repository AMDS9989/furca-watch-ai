'use strict';
/**
 * DashboardPage – interactions with the main dashboard view.
 *
 * Key element IDs (from web/index.html):
 *  - #page-title            – current view heading (h1)
 *  - #btn-add-patient-quick – "Add Patient" header button
 *  - #btn-scan-quick        – "Run AI Scan" header button
 *  - #modal-add-patient     – add-patient modal overlay
 *  - #modal-pat-name        – patient name input inside modal
 *  - #modal-pat-age         – patient age input
 *  - #modal-pat-phone       – patient phone input
 *  - #modal-pat-tooth       – tooth number select
 *  - #modal-pat-diabetes    – diabetes checkbox
 *  - #btn-modal-submit      – form submit button
 *
 * Sidebar navigation:
 *  - [data-tab="dashboard"]    – Dashboard menu item
 *  - [data-tab="patients"]     – Patients menu item
 *  - [data-tab="diagnostics"]  – AI Diagnostics menu item
 *  - [data-tab="assistant"]    – AI Assistant menu item
 *  - [data-tab="settings"]     – Settings menu item
 */
const { By, until } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class DashboardPage extends BasePage {
    // ── Locators ────────────────────────────────────────────────────────────
    get locPageTitle()      { return By.id('page-title'); }
    get locAddPatientBtn()  { return By.id('btn-add-patient-quick'); }
    get locScanBtn()        { return By.id('btn-scan-quick'); }
    get locModal()          { return By.id('modal-add-patient'); }
    get locModalName()      { return By.id('modal-pat-name'); }
    get locModalAge()       { return By.id('modal-pat-age'); }
    get locModalPhone()     { return By.id('modal-pat-phone'); }
    get locModalTooth()     { return By.id('modal-pat-tooth'); }
    get locModalDiabetes()  { return By.id('modal-pat-diabetes'); }
    get locModalSubmit()    { return By.id('btn-modal-submit'); }
    get locMetricPatients() { return By.id('dashboard-total-patients'); }
    get locMetricCritical() { return By.id('dashboard-critical-risk'); }

    // ── Actions ─────────────────────────────────────────────────────────────

    /** Return current page title text */
    async getTitle() {
        return this.getText(this.locPageTitle);
    }

    /** Verify we are on the Dashboard tab */
    async isDashboardActive() {
        const title = await this.getTitle();
        return title === 'Dashboard Overview';
    }

    /** Wait until the page title equals expected value */
    async waitForTitle(expected, ms) {
        await this.driver.wait(async () => {
            const t = await this.getText(this.locPageTitle);
            return t === expected;
        }, ms || this.timeout, `Page title never became "${expected}"`);
    }

    /** Click the "Add Patient" quick button in the header */
    async clickAddPatient() {
        const btn = await this.waitForVisible(this.locAddPatientBtn);
        await btn.click();
        // Wait for modal to appear
        await this.waitForVisible(this.locModal);
    }

    /**
     * Fill the Add Patient modal form.
     * @param {{ name: string, age: string, phone: string, tooth: string, diabetes: boolean }} data
     */
    async fillPatientForm(data) {
        const nameInput = await this.waitFor(this.locModalName);
        await nameInput.clear();
        await nameInput.sendKeys(data.name);

        const ageInput = await this.driver.findElement(this.locModalAge);
        await ageInput.clear();
        await ageInput.sendKeys(data.age);

        const phoneInput = await this.driver.findElement(this.locModalPhone);
        await phoneInput.clear();
        await phoneInput.sendKeys(data.phone);

        // Select tooth number
        const toothSel = await this.driver.findElement(this.locModalTooth);
        await toothSel.sendKeys(data.tooth);

        // Toggle diabetes checkbox if requested
        if (data.diabetes !== undefined) {
            const cb = await this.driver.findElement(this.locModalDiabetes);
            const checked = await cb.isSelected();
            if (data.diabetes && !checked) await cb.click();
            if (!data.diabetes && checked) await cb.click();
        }
    }

    /** Click the modal Submit button */
    async submitPatientForm() {
        const btn = await this.waitFor(this.locModalSubmit);
        await btn.click();
    }

    /** Navigate to a sidebar tab by data-tab attribute value */
    async navigateToTab(tabName) {
        const link = await this.waitFor(By.css(`[data-tab="${tabName}"]`));
        await link.click();
    }

    /** Get text of the total-patients metric card */
    async getTotalPatientsMetric() {
        return this.getText(this.locMetricPatients);
    }

    /** Verify the "Run AI Scan" button is present */
    async scanButtonExists() {
        return this.elementExists('btn-scan-quick');
    }
}

module.exports = DashboardPage;
