'use strict';
/**
 * FurcaRiskAI – Master Test Summary Generator
 * Combines Selenium results (results.json) + Unit results (unit-results.json)
 * Outputs: Master HTML report + GitHub Step Summary
 */

const fs   = require('fs');
const path = require('path');

const WEB_RESULTS  = path.resolve(__dirname, '../results.json');
const UNIT_RESULTS = path.resolve(__dirname, '../unit-results.json');
const OUT_DIR      = path.resolve(__dirname, '../../Test Results');
const HTML_OUT     = path.join(OUT_DIR, 'HTML', 'master-summary.html');
const MD_OUT       = path.join(OUT_DIR, 'Summary', 'master-summary.md');

function loadJSON(file) {
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const webData  = loadJSON(WEB_RESULTS);
const unitData = loadJSON(UNIT_RESULTS);

// Merge all results
const allResults = [
    ...(webData  ? webData.results  : []),
    ...(unitData ? unitData.results : [])
];

const totalPassed  = allResults.filter(r => r.status === 'PASS').length;
const totalFailed  = allResults.filter(r => r.status === 'FAIL').length;
const totalTests   = allResults.length;
const passRate     = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;
const buildNumber  = process.env.GITHUB_RUN_NUMBER || 'local';
const timestamp    = new Date().toISOString();

// Category breakdown
const categories = [...new Set(allResults.map(r => r.category))];
const catStats = categories.map(cat => {
    const tests  = allResults.filter(r => r.category === cat);
    const passed = tests.filter(r => r.status === 'PASS').length;
    const failed = tests.filter(r => r.status === 'FAIL').length;
    return { cat, tests, passed, failed, total: tests.length };
});

// ── HTML Report ────────────────────────────────────────────────────────────────
const statusColor = { PASS: '#00d68f', FAIL: '#ff4d4f' };
const catColors   = {
    'UI/UX':       '#00e5ff',
    'Functional':  '#7c4dff',
    'Validation':  '#ff9100',
    'Deployment':  '#00d68f',
    'Unit':        '#ff4081',
};

function catTable(stat) {
    const rows = stat.tests.map(t => `
    <tr>
        <td><code>${t.id}</code></td>
        <td>${t.name}</td>
        <td style="color:${statusColor[t.status]};font-weight:700">${t.status}</td>
        <td>${t.duration}ms</td>
        <td style="color:#ff4d4f;font-size:12px">${t.error ? t.error.substring(0, 100) : '—'}</td>
    </tr>`).join('');
    return `
    <div class="cat-section">
        <div class="cat-header" style="border-left:4px solid ${catColors[stat.cat] || '#888'}">
            <span class="cat-name">${stat.cat}</span>
            <span class="cat-count">${stat.passed}/${stat.total} passed</span>
        </div>
        <table>
            <thead><tr><th>ID</th><th>Test Name</th><th>Status</th><th>Duration</th><th>Error</th></tr></thead>
            <tbody>${rows}</tbody>
        </table>
    </div>`;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FurcaRiskAI – Master Test Summary</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #060d1a; color: #c8d4e8; font-family: 'Inter', sans-serif; min-height: 100vh; }

  .hero { background: linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #091220 100%);
    border-bottom: 1px solid #1e3a5f; padding: 40px 60px; }
  .hero h1 { font-family: 'Outfit', sans-serif; font-size: 32px; color: #00e5ff;
    letter-spacing: 1px; margin-bottom: 6px; }
  .hero .subtitle { color: #6b8aad; font-size: 14px; }
  .hero .meta { margin-top: 16px; display: flex; gap: 24px; flex-wrap: wrap; }
  .meta-item { background: #0d2137; border: 1px solid #1e3a5f; border-radius: 8px;
    padding: 8px 16px; font-size: 13px; }
  .meta-label { color: #6b8aad; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
  .meta-value { color: #c8d4e8; font-weight: 600; font-size: 15px; margin-top: 2px; }

  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 20px; padding: 40px 60px 20px; }
  .stat-card { background: #0d2137; border: 1px solid #1e3a5f; border-radius: 14px; padding: 24px;
    text-align: center; transition: transform .2s; }
  .stat-card:hover { transform: translateY(-3px); }
  .stat-num { font-family: 'Outfit', sans-serif; font-size: 42px; font-weight: 800; line-height: 1; }
  .stat-label { color: #6b8aad; font-size: 13px; margin-top: 6px; text-transform: uppercase; letter-spacing: 1px; }

  .progress-bar { margin: 0 60px 40px; height: 12px; background: #1e3a5f; border-radius: 99px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 99px;
    background: linear-gradient(90deg, #00e5ff, #00d68f);
    width: ${passRate}%; transition: width 1s ease; }

  .cat-grid { padding: 0 60px; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 40px; }
  .cat-mini { background: #0d2137; border: 1px solid #1e3a5f; border-radius: 12px; padding: 20px; }
  .cat-mini-name { font-weight: 700; font-size: 15px; margin-bottom: 10px; }
  .cat-mini-bar { height: 8px; background: #1e3a5f; border-radius: 99px; overflow: hidden; }
  .cat-mini-fill { height: 100%; border-radius: 99px; }
  .cat-mini-count { font-size: 12px; color: #6b8aad; margin-top: 6px; }

  .section-title { font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 700;
    color: #c8d4e8; padding: 0 60px; margin-bottom: 24px; }
  .cat-section { margin: 0 60px 40px; border: 1px solid #1e3a5f; border-radius: 14px; overflow: hidden; }
  .cat-header { display: flex; justify-content: space-between; align-items: center;
    padding: 16px 24px; background: #0d2137; }
  .cat-name { font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 700; }
  .cat-count { font-size: 14px; color: #6b8aad; }

  table { width: 100%; border-collapse: collapse; background: #070f1e; }
  th { background: #091220; color: #6b8aad; font-size: 11px; text-transform: uppercase;
    letter-spacing: 1px; padding: 12px 16px; text-align: left; }
  td { padding: 12px 16px; font-size: 13px; border-top: 1px solid #1e3a5f; }
  tr:hover td { background: #0d2137; }
  code { background: #1e3a5f; padding: 2px 8px; border-radius: 4px; font-size: 12px; color: #00e5ff; }

  .footer { text-align: center; padding: 40px; color: #2d4a6b; font-size: 12px; }
  .pass-chip { background: rgba(0,214,143,.15); color: #00d68f; padding: 2px 10px; border-radius: 99px; font-size: 12px; font-weight: 700; }
  .fail-chip { background: rgba(255,77,79,.15); color: #ff4d4f; padding: 2px 10px; border-radius: 99px; font-size: 12px; font-weight: 700; }
</style>
</head>
<body>

<div class="hero">
  <h1>🦷 FurcaRiskAI – Master Test Summary</h1>
  <div class="subtitle">Comprehensive quality assurance report across all test categories</div>
  <div class="meta">
    <div class="meta-item"><div class="meta-label">Build</div><div class="meta-value">#${buildNumber}</div></div>
    <div class="meta-item"><div class="meta-label">Date</div><div class="meta-value">${new Date().toLocaleDateString()}</div></div>
    <div class="meta-item"><div class="meta-label">Platform</div><div class="meta-value">GitHub Pages + Node.js</div></div>
    <div class="meta-item"><div class="meta-label">URL</div><div class="meta-value">amds9989.github.io/furca-watch-ai</div></div>
  </div>
</div>

<div class="stats-grid">
  <div class="stat-card"><div class="stat-num" style="color:#00e5ff">${totalTests}</div><div class="stat-label">Total Test Cases</div></div>
  <div class="stat-card"><div class="stat-num" style="color:#00d68f">${totalPassed}</div><div class="stat-label">Passed</div></div>
  <div class="stat-card"><div class="stat-num" style="color:#ff4d4f">${totalFailed}</div><div class="stat-label">Failed</div></div>
  <div class="stat-card"><div class="stat-num" style="color:${parseFloat(passRate) >= 90 ? '#00d68f' : parseFloat(passRate) >= 70 ? '#ff9100' : '#ff4d4f'}">${passRate}%</div><div class="stat-label">Pass Rate</div></div>
</div>

<div class="progress-bar"><div class="progress-fill"></div></div>

<h2 class="section-title">📊 Category Breakdown</h2>
<div class="cat-grid">
${catStats.map(s => `
  <div class="cat-mini">
    <div class="cat-mini-name" style="color:${catColors[s.cat] || '#888'}">${s.cat}</div>
    <div class="cat-mini-bar">
      <div class="cat-mini-fill" style="width:${s.total > 0 ? (s.passed/s.total*100).toFixed(0) : 0}%;background:${catColors[s.cat] || '#888'}"></div>
    </div>
    <div class="cat-mini-count">${s.passed}/${s.total} passed · ${s.total > 0 ? (s.passed/s.total*100).toFixed(0) : 0}%</div>
  </div>`).join('')}
</div>

<h2 class="section-title">📋 Detailed Test Results</h2>
${catStats.map(catTable).join('')}

<div class="footer">
  Generated: ${timestamp} · FurcaRiskAI Quality Assurance Suite · Build #${buildNumber}
</div>
</body>
</html>`;

// ── Markdown Summary ──────────────────────────────────────────────────────────
const md = `# 🦷 FurcaRiskAI – Master Test Summary

**Build:** #${buildNumber} | **Date:** ${new Date().toLocaleDateString()} | **Pass Rate:** ${passRate}%

## 📊 Overall Results

| Metric | Value |
|--------|-------|
| Total Tests | **${totalTests}** |
| ✅ Passed | **${totalPassed}** |
| ❌ Failed | **${totalFailed}** |
| Pass Rate | **${passRate}%** |

## 📋 Category Breakdown

| Category | Tests | Passed | Failed | Pass Rate |
|----------|-------|--------|--------|-----------|
${catStats.map(s => `| ${s.cat} | ${s.total} | ✅ ${s.passed} | ❌ ${s.failed} | ${s.total > 0 ? (s.passed/s.total*100).toFixed(0) : 0}% |`).join('\n')}

## 🔍 All Test Cases

${catStats.map(s => `
### ${s.cat} Tests (${s.passed}/${s.total} passed)

| ID | Test Name | Status | Duration |
|----|-----------|--------|----------|
${s.tests.map(t => `| \`${t.id}\` | ${t.name} | ${t.status === 'PASS' ? '✅ PASS' : '❌ FAIL'} | ${t.duration}ms |`).join('\n')}
`).join('\n')}

---
*Generated by FurcaRiskAI Master Test Reporter · Build #${buildNumber}*
`;

// ── Write outputs ─────────────────────────────────────────────────────────────
fs.mkdirSync(path.join(OUT_DIR, 'HTML'), { recursive: true });
fs.mkdirSync(path.join(OUT_DIR, 'Summary'), { recursive: true });
fs.writeFileSync(HTML_OUT, html, 'utf8');
fs.writeFileSync(MD_OUT, md, 'utf8');

// GitHub Step Summary
if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
}

console.log(`\n✅ Master HTML  → ${HTML_OUT}`);
console.log(`✅ Master MD    → ${MD_OUT}`);
console.log(`\n  Total: ${totalPassed}/${totalTests} passed (${passRate}%)\n`);
