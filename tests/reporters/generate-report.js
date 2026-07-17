/**
 * FurcaRiskAI - Selenium Web E2E HTML Report Generator
 * Reads tests/results.json -> outputs HTML + Markdown summary
 */
'use strict';
const fs = require('fs');
const path = require('path');

const resultsFile = path.resolve(__dirname, '../results.json');
const htmlOutDir  = path.resolve(__dirname, '../../Test Results/HTML');
const summaryDir  = path.resolve(__dirname, '../../Test Results/Summary');

if (!fs.existsSync(resultsFile)) {
    console.error('ERROR: results.json not found at ' + resultsFile);
    process.exit(1);
}

const r = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
const durationSec = r.durationMs ? (r.durationMs / 1000).toFixed(2) : '--';
const dateStr = new Date(r.executionDate).toUTCString();
const passRate = r.passRate || '0%';
const passRateNum = parseFloat(passRate);
const gaugeColor = passRateNum >= 90 ? '#00f5d4' : passRateNum >= 70 ? '#f59e0b' : '#ff4d6d';
const circ = (2 * Math.PI * 45).toFixed(2);
const dashOffset = (circ - (passRateNum / 100) * parseFloat(circ)).toFixed(2);

function badge(status) {
    if (status === 'PASS') return '<span style="display:inline-flex;align-items:center;gap:.3rem;padding:.25rem .7rem;border-radius:20px;font-size:.75rem;font-weight:700;background:rgba(0,245,212,.12);color:#00f5d4;border:1px solid rgba(0,245,212,.2)">&#10003; PASS</span>';
    return '<span style="display:inline-flex;align-items:center;gap:.3rem;padding:.25rem .7rem;border-radius:20px;font-size:.75rem;font-weight:700;background:rgba(255,77,109,.12);color:#ff4d6d;border:1px solid rgba(255,77,109,.2)">&#10007; FAIL</span>';
}

const rows = r.tests.map(function(t, i) {
    const errCell = t.error
        ? '<span style="color:#ff4d6d;font-size:.8rem;font-family:monospace">' + t.error + '</span>'
        : '<span style="color:#94a3b8">&#8212;</span>';
    return '<tr><td style="color:#94a3b8;width:40px">#' + (i+1) + '</td><td style="font-weight:500">' + t.name + '</td><td>' + badge(t.status) + '</td><td style="color:#94a3b8;font-size:.8rem">' + t.duration + 'ms</td><td>' + errCell + '</td></tr>';
}).join('');

const overallText = r.failed === 0 ? 'ALL PASSED' : r.failed + ' FAILED';

const html = '<!DOCTYPE html>\n'
+ '<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n'
+ '<title>FurcaRiskAI - E2E Execution Report</title>\n'
+ '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@700;800&display=swap" rel="stylesheet">\n'
+ '<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#030712;color:#f8fafc;font-family:Inter,sans-serif;min-height:100vh}.page{max-width:1100px;margin:0 auto;padding:2.5rem 1.5rem}.hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:2.5rem;flex-wrap:wrap;gap:1rem}.brand{display:flex;align-items:center;gap:.75rem}.bicon{background:linear-gradient(135deg,#00f0ff,#0077ff);width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center}.bicon svg{color:#030712}.bh1{font-family:Outfit,sans-serif;font-size:1.6rem;font-weight:800}.bh1 span{color:#00f0ff}.bi{text-align:right}.bi p{font-size:.8rem;color:#94a3b8}.bi strong{font-size:.9rem}.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-bottom:2rem}.mc{background:rgba(15,23,42,.85);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:1.25rem}.mc h4{font-size:.75rem;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.5rem}.mc p{font-family:Outfit,sans-serif;font-size:2rem;font-weight:800}.gc{background:rgba(15,23,42,.85);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:1.25rem;display:flex;align-items:center;gap:1.5rem}.gw{position:relative;width:100px;height:100px;flex-shrink:0}.gw svg{transform:rotate(-90deg)}.gl{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}.gl span{font-family:Outfit,sans-serif;font-size:1.5rem;font-weight:800}.gl small{font-size:.65rem;color:#94a3b8;font-weight:600}.st{font-family:Outfit,sans-serif;font-size:1.1rem;font-weight:700;margin-bottom:1rem;display:flex;align-items:center;gap:.5rem}.st::before{content:"";width:4px;height:1.2em;background:#00f0ff;border-radius:2px;display:inline-block}.rc{background:rgba(15,23,42,.85);border:1px solid rgba(255,255,255,.07);border-radius:14px;overflow:hidden;margin-bottom:2rem}table{width:100%;border-collapse:collapse}th{font-size:.7rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;padding:.75rem 1rem;text-align:left;border-bottom:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.02)}td{padding:.8rem 1rem;border-bottom:1px solid rgba(255,255,255,.04);font-size:.875rem;vertical-align:middle}tr:last-child td{border-bottom:none}tr:hover td{background:rgba(255,255,255,.02)}.ft{text-align:center;color:#94a3b8;font-size:.8rem;margin-top:2rem;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,.07)}</style></head><body>\n'
+ '<div class="page">\n'
+ '<div class="hdr"><div class="brand"><div class="bicon"><svg viewBox="0 0 24 24" width="28" height="28" stroke="#030712" stroke-width="2.5" fill="none"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div><div><div class="bh1">FurcaRisk<span>AI</span></div><div style="font-size:.8rem;color:#94a3b8">Selenium Web E2E Execution Report</div></div></div><div class="bi"><p>Build</p><strong>#' + r.buildNumber + '</strong><p>' + dateStr + '</p></div></div>\n'
+ '<div class="metrics">\n'
+ '<div class="gc"><div class="gw"><svg viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="10"/><circle cx="50" cy="50" r="45" fill="none" stroke="' + gaugeColor + '" stroke-width="10" stroke-dasharray="' + circ + '" stroke-dashoffset="' + dashOffset + '" stroke-linecap="round"/></svg><div class="gl"><span style="color:' + gaugeColor + '">' + passRate + '</span><small>PASS RATE</small></div></div><div><h4 style="font-size:.8rem;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Overall Result</h4><p style="font-family:Outfit,sans-serif;font-size:1.3rem;font-weight:800;color:' + gaugeColor + ';margin-top:.25rem">' + overallText + '</p><p style="font-size:.8rem;color:#94a3b8;margin-top:.25rem">Duration: ' + durationSec + 's</p></div></div>\n'
+ '<div class="mc"><h4>Total Tests</h4><p style="color:#00f0ff">' + r.totalTests + '</p></div>\n'
+ '<div class="mc"><h4>Passed</h4><p style="color:#00f5d4">' + r.passed + '</p></div>\n'
+ '<div class="mc"><h4>Failed</h4><p style="color:' + (r.failed > 0 ? '#ff4d6d' : '#00f5d4') + '">' + r.failed + '</p></div>\n'
+ '<div class="mc"><h4>Platform</h4><p style="color:#00f0ff;font-size:1.2rem">' + r.platform + '</p></div>\n'
+ '</div>\n'
+ '<div class="st">Test Case Results</div>\n'
+ '<div class="rc"><table><thead><tr><th>#</th><th>Test Name</th><th>Status</th><th>Duration</th><th>Error Details</th></tr></thead><tbody>' + rows + '</tbody></table></div>\n'
+ '<div class="ft"><p>FurcaRiskAI &mdash; Automated E2E Report &bull; Build #' + r.buildNumber + ' &bull; ' + dateStr + '</p></div>\n'
+ '</div></body></html>';

if (!fs.existsSync(htmlOutDir)) fs.mkdirSync(htmlOutDir, { recursive: true });
const htmlPath = path.join(htmlOutDir, 'execution-report.html');
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('HTML Report generated: ' + htmlPath);

if (!fs.existsSync(summaryDir)) fs.mkdirSync(summaryDir, { recursive: true });
const md = [
    '# Selenium Web E2E Test Summary',
    '',
    '| Field | Value |',
    '|---|---|',
    '| **Build Number** | ' + r.buildNumber + ' |',
    '| **Execution Date** | ' + dateStr + ' |',
    '| **Platform** | ' + r.platform + ' |',
    '| **Duration** | ' + durationSec + 's |',
    '',
    '## Results',
    '',
    '| Total Tests | Passed | Failed | Pass Rate |',
    '|---|---|---|---|',
    '| **' + r.totalTests + '** | **' + r.passed + '** | **' + r.failed + '** | **' + passRate + '** |',
    '',
    '## Test Cases',
    '',
    '| # | Test | Status | Duration |',
    '|---|---|---|---|'
].concat(r.tests.map(function(t, i) {
    return '| ' + (i+1) + ' | ' + t.name + ' | ' + (t.status === 'PASS' ? 'PASS' : 'FAIL') + ' | ' + t.duration + 'ms |';
})).concat([
    '',
    '---',
    '',
    '**Report URL:** ' + (process.env.GITHUB_PAGES_URL || 'https://<github-username>.github.io/<repository-name>/') + 'reports/latest/execution-report.html'
]).join('\n');

const summaryPath = path.join(summaryDir, 'summary.md');
fs.writeFileSync(summaryPath, md, 'utf8');
console.log('Markdown Summary generated: ' + summaryPath);
