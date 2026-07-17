'use strict';
/**
 * FurcaRiskAI Selenium Configuration
 *
 * BASE_URL is driven by the BASE_URL environment variable so that the same
 * test suite runs against the live GitHub Pages deployment in CI and against
 * a local server during development.
 *
 * CI usage:
 *   BASE_URL=https://<user>.github.io/<repo>/ node selenium/web_test.js
 *
 * Local usage (serve web/ on port 8080 first):
 *   node selenium/web_test.js
 */

const BASE_URL = (process.env.BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

const HEADLESS   = process.env.HEADLESS !== 'false';   // headless=true unless explicitly disabled
const TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS || '15000', 10);
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || require('path').resolve(__dirname, '../screenshots');

module.exports = { BASE_URL, HEADLESS, TIMEOUT_MS, SCREENSHOT_DIR };
