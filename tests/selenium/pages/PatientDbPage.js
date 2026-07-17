'use strict';
/**
 * PatientDbPage – interactions with the Patients tab (Patient Database).
 *
 * Key element IDs (from web/index.html):
 *  - #tab-patients                   – the patients tab panel
 *  - #patients-list-container        – scrollable list of patient cards
 *  - #patient-search                 – search input
 *  - #btn-add-patient-tab            – Add Patient button inside the patients tab
 *  - #profile-details-content        – patient profile detail panel (right)
 *  - #prof-name                      – selected patient's name (h2)
 *  - #prof-id-badge                  – patient ID badge
 *  - #prof-risk-score                – risk score value
 *  - #prof-risk-label                – risk category label
 */
const { By, until } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class PatientDbPage extends BasePage {
    // ── Locators ────────────────────────────────────────────────────────────
    get locTab()           { return By.id('tab-patients'); }
    get locList()          { return By.id('patients-list-container'); }
    get locSearch()        { return By.id('patient-search'); }
    get locProfilePanel()  { return By.id('profile-details-content'); }
    get locProfName()      { return By.id('prof-name'); }
    get locProfId()        { return By.id('prof-id-badge'); }
    get locProfRiskScore() { return By.id('prof-risk-score'); }
    get locProfRiskLabel() { return By.id('prof-risk-label'); }

    // ── Actions ─────────────────────────────────────────────────────────────

    /** Verify the Patients tab panel is visible (active) */
    async isActive() {
        try {
            const panel = await this.driver.findElement(this.locTab);
            const cls   = await panel.getAttribute('class');
            return cls && cls.includes('active');
        } catch (_) {
            return false;
        }
    }

    /** Wait until the Patients tab becomes the active panel */
    async waitUntilActive(ms) {
        await this.driver.wait(() => this.isActive(), ms || this.timeout,
            'Patients tab did not become active');
    }

    /** Get the currently displayed patient name from the profile panel */
    async getActivePatientName() {
        // First check the profile panel is visible (not empty state)
        await this.driver.wait(async () => {
            const el  = await this.driver.findElement(this.locProfilePanel);
            const cls = await el.getAttribute('class');
            return cls && !cls.includes('hidden');
        }, this.timeout, 'Patient profile details panel never became visible');

        return this.getText(this.locProfName);
    }

    /** Get current patient ID badge text */
    async getActivePatientId() {
        return this.getText(this.locProfId);
    }

    /** Get risk score text */
    async getActivePatientRiskScore() {
        return this.getText(this.locProfRiskScore);
    }

    /** Search for a patient by name */
    async searchPatient(query) {
        const input = await this.waitFor(this.locSearch);
        await input.clear();
        await input.sendKeys(query);
        await this.sleep(500); // wait for filter to apply
    }

    /** Count visible patient items in the list */
    async getPatientCount() {
        try {
            const items = await this.driver.findElements(By.css('#patients-list-container .patient-list-item'));
            return items.length;
        } catch (_) {
            return 0;
        }
    }

    /** Click the first patient in the list */
    async selectFirstPatient() {
        const items = await this.driver.findElements(By.css('#patients-list-container .patient-list-item'));
        if (items.length > 0) {
            await items[0].click();
        }
    }
}

module.exports = PatientDbPage;
