'use strict';
/**
 * FurcaRiskAI – Load Test Report Generator
 * Reads load-test-results.json → outputs:
 *   Load Test Results/HTML/load-test-report.html
 *   Load Test Results/Excel/Load_Test_Report.xlsx
 *   Load Test Results/Summary/load-test-summary.md
 *
 * Usage:
 *   node load-test-report.js
 */

const fs   = require('fs');
const path = require('path');

// ── Paths ─────────────────────────────────────────────────────────────────────
const RESULTS_FILE = path.resolve(__dirname, 'load-test-results.json');
const OUT_HTML     = path.resolve(__dirname, 'Load Test Results/HTML');
const OUT_EXCEL    = path.resolve(__dirname, 'Load Test Results/Excel');
const OUT_SUMMARY  = path.resolve(__dirname, 'Load Test Results/Summary');

if (!fs.existsSync(RESULTS_FILE)) {
    console.error('ERROR: load-test-results.json not found.');
    console.error('Run: node load-test.js   first.');
    process.exit(1);
}

const r          = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
const dateStr    = new Date(r.executionDate).toUTCString();
const durSec     = (r.actualDurationMs / 1000).toFixed(1);
const errPct     = ((r.totalErrors / Math.max(r.totalRequests, 1)) * 100).toFixed(2);
const successPct = parseFloat(r.passRate);
const gaugeColor = successPct >= 99 ? '#00f5d4' : successPct >= 95 ? '#f59e0b' : '#ff4d6d';
const rpsColor   = r.rps >= 50 ? '#00f5d4' : r.rps >= 20 ? '#f59e0b' : '#ff4d6d';
const circ       = (2 * Math.PI * 45).toFixed(2);
const dashOffset = (parseFloat(circ) - (successPct / 100) * parseFloat(circ)).toFixed(2);

function th(passed) {
    return passed
        ? '<span style="color:#00f5d4;font-weight:700">✓ PASS</span>'
        : '<span style="color:#ff4d6d;font-weight:700">✗ FAIL</span>';
}

// ── Per-endpoint rows ─────────────────────────────────────────────────────────
const endpointRows = (r.endpoints || []).map((e, i) => {
    const bg     = i % 2 === 0 ? 'rgba(15,23,42,.85)' : 'rgba(30,41,59,.85)';
    const errClr = e.failed > 0 ? '#ff4d6d' : '#00f5d4';
    return `<tr style="background:${bg}">
      <td style="color:#94a3b8;font-size:.78rem;padding:.7rem 1rem">${e.label}</td>
      <td style="text-align:center;padding:.7rem 1rem">${e.total.toLocaleString()}</td>
      <td style="text-align:center;color:#00f0ff;padding:.7rem 1rem">${e.avg}ms</td>
      <td style="text-align:center;color:#94a3b8;padding:.7rem 1rem">${e.min}ms</td>
      <td style="text-align:center;color:#94a3b8;padding:.7rem 1rem">${e.p95}ms</td>
      <td style="text-align:center;color:#94a3b8;padding:.7rem 1rem">${e.max}ms</td>
      <td style="text-align:center;color:${errClr};font-weight:700;padding:.7rem 1rem">${e.failed}</td>
    </tr>`;
}).join('');

// ── HTML Report ───────────────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>FurcaRiskAI – Baseline Load Test Report</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#030712;color:#f8fafc;font-family:Inter,sans-serif;min-height:100vh}
.page{max-width:1200px;margin:0 auto;padding:2.5rem 1.5rem}
.hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:2.5rem;flex-wrap:wrap;gap:1rem}
.brand{display:flex;align-items:center;gap:.75rem}
.bicon{background:linear-gradient(135deg,#f59e0b,#ef4444);width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center}
.bh1{font-family:Outfit,sans-serif;font-size:1.6rem;font-weight:800}.bh1 span{color:#f59e0b}
.bi{text-align:right}.bi p{font-size:.8rem;color:#94a3b8}.bi strong{font-size:.9rem}
.section-title{font-family:Outfit,sans-serif;font-size:1rem;font-weight:700;margin-bottom:1rem;display:flex;align-items:center;gap:.5rem}
.section-title::before{content:"";width:4px;height:1.1em;background:#f59e0b;border-radius:2px}
.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:1rem;margin-bottom:2rem}
.mc{background:rgba(15,23,42,.85);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:1.25rem}
.mc h4{font-size:.72rem;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.4rem}
.mc p{font-family:Outfit,sans-serif;font-size:1.9rem;font-weight:800}
.gauge-card{background:rgba(15,23,42,.85);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:1.25rem;display:flex;align-items:center;gap:1.5rem}
.gw{position:relative;width:100px;height:100px;flex-shrink:0}
.gw svg{transform:rotate(-90deg)}
.gl{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.gl span{font-family:Outfit,sans-serif;font-size:1.4rem;font-weight:800}
.gl small{font-size:.6rem;color:#94a3b8;font-weight:600;letter-spacing:.04em}
.rt-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:.75rem;margin-bottom:2rem}
.rt-card{background:rgba(15,23,42,.85);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:1rem;text-align:center}
.rt-card .label{font-size:.68rem;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.05em}
.rt-card .val{font-family:Outfit,sans-serif;font-size:1.6rem;font-weight:800;margin-top:.25rem}
.threshold-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:.75rem;margin-bottom:2rem}
.thresh-card{background:rgba(15,23,42,.85);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:1rem;display:flex;align-items:center;gap:.75rem}
.thresh-icon{font-size:1.4rem;flex-shrink:0}
.thresh-info h5{font-size:.8rem;font-weight:600;color:#f8fafc}
.thresh-info p{font-size:.72rem;color:#94a3b8;margin-top:.15rem}
.table-wrap{background:rgba(15,23,42,.85);border:1px solid rgba(255,255,255,.07);border-radius:14px;overflow:hidden;margin-bottom:2rem}
table{width:100%;border-collapse:collapse}
th{font-size:.68rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;padding:.75rem 1rem;text-align:left;border-bottom:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.02)}
th:not(:first-child){text-align:center}
td{font-size:.82rem;vertical-align:middle;border-bottom:1px solid rgba(255,255,255,.04)}
tr:last-child td{border-bottom:none}
.ft{text-align:center;color:#94a3b8;font-size:.78rem;margin-top:2rem;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,.07)}
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="hdr">
    <div class="brand">
      <div class="bicon">
        <svg viewBox="0 0 24 24" width="28" height="28" stroke="#030712" stroke-width="2.5" fill="none">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      </div>
      <div>
        <div class="bh1">FurcaRisk<span>AI</span></div>
        <div style="font-size:.8rem;color:#94a3b8">Baseline Load Test Report</div>
      </div>
    </div>
    <div class="bi">
      <p>Build</p><strong>#${r.buildNumber}</strong>
      <p style="margin-top:.25rem">${dateStr}</p>
      <p style="margin-top:.25rem;color:#f59e0b;font-size:.75rem">${r.virtualUsers} Virtual Users · ${durSec}s</p>
    </div>
  </div>

  <!-- Top Metrics -->
  <div class="section-title">Performance Overview</div>
  <div class="metrics">
    <div class="gauge-card">
      <div class="gw">
        <svg viewBox="0 0 100 100" width="100" height="100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="10"/>
          <circle cx="50" cy="50" r="45" fill="none" stroke="${gaugeColor}" stroke-width="10"
            stroke-dasharray="${circ}" stroke-dashoffset="${dashOffset}" stroke-linecap="round"/>
        </svg>
        <div class="gl">
          <span style="color:${gaugeColor}">${r.passRate}</span>
          <small>SUCCESS</small>
        </div>
      </div>
      <div>
        <h4 style="font-size:.75rem;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Overall Result</h4>
        <p style="font-family:Outfit,sans-serif;font-size:1.1rem;font-weight:800;color:${gaugeColor};margin-top:.2rem">
          ${r.totalErrors === 0 ? 'ALL PASSED' : r.totalErrors + ' ERRORS'}
        </p>
        <p style="font-size:.78rem;color:#94a3b8;margin-top:.25rem">${r.totalRequests.toLocaleString()} total requests</p>
      </div>
    </div>
    <div class="mc"><h4>Requests/sec</h4><p style="color:${rpsColor}">${r.rps}</p></div>
    <div class="mc"><h4>Total Requests</h4><p style="color:#00f0ff">${r.totalRequests.toLocaleString()}</p></div>
    <div class="mc"><h4>Virtual Users</h4><p style="color:#00f0ff">${r.virtualUsers}</p></div>
    <div class="mc"><h4>Errors</h4><p style="color:${r.totalErrors > 0 ? '#ff4d6d' : '#00f5d4'}">${r.totalErrors}</p></div>
    <div class="mc"><h4>Duration</h4><p style="color:#94a3b8;font-size:1.4rem">${durSec}s</p></div>
  </div>

  <!-- Response Time Breakdown -->
  <div class="section-title">Response Time Breakdown</div>
  <div class="rt-grid">
    <div class="rt-card"><div class="label">Min</div><div class="val" style="color:#00f5d4">${r.responseTime.min}ms</div></div>
    <div class="rt-card"><div class="label">Average</div><div class="val" style="color:#00f0ff">${r.responseTime.avg}ms</div></div>
    <div class="rt-card"><div class="label">Median (P50)</div><div class="val" style="color:#00f0ff">${r.responseTime.p50}ms</div></div>
    <div class="rt-card"><div class="label">P95</div><div class="val" style="color:#f59e0b">${r.responseTime.p95}ms</div></div>
    <div class="rt-card"><div class="label">P99</div><div class="val" style="color:#f59e0b">${r.responseTime.p99}ms</div></div>
    <div class="rt-card"><div class="label">Max</div><div class="val" style="color:#ff4d6d">${r.responseTime.max}ms</div></div>
  </div>

  <!-- Threshold Checks -->
  <div class="section-title">Threshold Checks</div>
  <div class="threshold-grid">
    <div class="thresh-card">
      <div class="thresh-icon">${r.thresholds.avgPassed ? '✅' : '❌'}</div>
      <div class="thresh-info">
        <h5>Avg Response ≤ 500ms</h5>
        <p>Actual: <strong>${r.responseTime.avg}ms</strong> → ${th(r.thresholds.avgPassed)}</p>
      </div>
    </div>
    <div class="thresh-card">
      <div class="thresh-icon">${r.thresholds.p95Passed ? '✅' : '❌'}</div>
      <div class="thresh-info">
        <h5>P95 Response ≤ 2000ms</h5>
        <p>Actual: <strong>${r.responseTime.p95}ms</strong> → ${th(r.thresholds.p95Passed)}</p>
      </div>
    </div>
    <div class="thresh-card">
      <div class="thresh-icon">${r.thresholds.errorPassed ? '✅' : '❌'}</div>
      <div class="thresh-info">
        <h5>Error Rate ≤ 5%</h5>
        <p>Actual: <strong>${errPct}%</strong> → ${th(r.thresholds.errorPassed)}</p>
      </div>
    </div>
  </div>

  <!-- Endpoint Breakdown Table -->
  <div class="section-title">Per-Endpoint Breakdown</div>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Endpoint</th>
          <th>Requests</th>
          <th>Avg RT</th>
          <th>Min RT</th>
          <th>P95</th>
          <th>Max RT</th>
          <th>Errors</th>
        </tr>
      </thead>
      <tbody>${endpointRows}</tbody>
    </table>
  </div>

  <div class="ft">
    FurcaRiskAI &mdash; Baseline Load Test &bull; Build #${r.buildNumber} &bull; ${dateStr}
  </div>

</div>
</body>
</html>`;

// Write HTML
[OUT_HTML, OUT_EXCEL, OUT_SUMMARY].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });
const htmlPath = path.join(OUT_HTML, 'load-test-report.html');
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('✅ HTML Report:    ' + htmlPath);

// ── Markdown Summary ──────────────────────────────────────────────────────────
const md = [
    '# ⚡ FurcaRiskAI – Baseline Load Test Summary',
    '',
    `> **Target:** \`${r.host}\`  |  **VUs:** ${r.virtualUsers}  |  **Duration:** ${durSec}s`,
    '',
    '---',
    '',
    '## 📊 Results',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| **Requests/sec (RPS)** | **${r.rps}** |`,
    `| Total Requests | ${r.totalRequests.toLocaleString()} |`,
    `| Successful | ${r.successRequests.toLocaleString()} |`,
    `| Errors | ${r.totalErrors} |`,
    `| Pass Rate | **${r.passRate}** |`,
    `| Duration | ${durSec}s |`,
    '',
    '## ⏱ Response Times',
    '',
    '| Percentile | Time |',
    '|------------|------|',
    `| Min | ${r.responseTime.min}ms |`,
    `| Average | **${r.responseTime.avg}ms** |`,
    `| Median (P50) | ${r.responseTime.p50}ms |`,
    `| P95 | ${r.responseTime.p95}ms |`,
    `| P99 | ${r.responseTime.p99}ms |`,
    `| Max | ${r.responseTime.max}ms |`,
    '',
    '## ✅ Threshold Checks',
    '',
    `| Check | Threshold | Actual | Result |`,
    `|-------|-----------|--------|--------|`,
    `| Avg Response | ≤ 500ms | ${r.responseTime.avg}ms | ${r.thresholds.avgPassed ? 'PASS ✅' : 'FAIL ❌'} |`,
    `| P95 Response | ≤ 2000ms | ${r.responseTime.p95}ms | ${r.thresholds.p95Passed ? 'PASS ✅' : 'FAIL ❌'} |`,
    `| Error Rate | ≤ 5% | ${errPct}% | ${r.thresholds.errorPassed ? 'PASS ✅' : 'FAIL ❌'} |`,
    '',
    '## 🔗 Endpoint Breakdown',
    '',
    '| Endpoint | Requests | Avg | P95 | Errors |',
    '|----------|----------|-----|-----|--------|',
    ...(r.endpoints || []).map(e =>
        `| \`${e.label}\` | ${e.total.toLocaleString()} | ${e.avg}ms | ${e.p95}ms | ${e.failed} |`
    ),
    '',
    '---',
    '',
    `*Generated: ${dateStr}  |  Build #${r.buildNumber}*`
].join('\n');

const mdPath = path.join(OUT_SUMMARY, 'load-test-summary.md');
fs.writeFileSync(mdPath, md, 'utf8');
console.log('✅ Markdown:       ' + mdPath);

// ── Excel Report ──────────────────────────────────────────────────────────────
let ExcelJS;
try { ExcelJS = require('exceljs'); } catch(_) {
    console.warn('⚠️  exceljs not installed. Run: cd tests && npm install');
    console.warn('   Skipping Excel report generation.');
    process.exit(0);
}

async function generateExcel() {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'FurcaRiskAI Load Test Suite';
    wb.created = new Date();

    const BG_DARK  = 'FF030712';
    const BG_ROW1  = 'FF0F172A';
    const BG_ROW2  = 'FF1E293B';
    const FG_WHITE = 'FFF8FAFC';
    const FG_CYAN  = 'FF00F0FF';
    const FG_GREEN = 'FF00F5D4';
    const FG_AMBER = 'FFF59E0B';
    const FG_RED   = 'FFFF4D6D';
    const FG_GREY  = 'FF94A3B8';

    // ── Sheet 1: Executive Summary ─────────────────────────────────────────────
    const s1 = wb.addWorksheet('Executive Summary', { pageSetup: { orientation: 'portrait' } });
    s1.getColumn('A').width = 32;
    s1.getColumn('B').width = 36;

    const titleRow1 = s1.addRow(['FurcaRiskAI – Baseline Load Test Report', '']);
    titleRow1.getCell(1).font = { name: 'Calibri', size: 18, bold: true, color: { argb: FG_AMBER } };
    titleRow1.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BG_DARK } };
    s1.mergeCells('A1:B1');
    s1.addRow([]);

    const rows1 = [
        ['Field', 'Value'],
        ['Build Number',          '#' + r.buildNumber],
        ['Execution Date',        dateStr],
        ['Target Host',           r.host],
        ['Virtual Users',         r.virtualUsers],
        ['Planned Duration',      r.plannedDuration + 's'],
        ['Actual Duration',       durSec + 's'],
        ['Total Requests',        r.totalRequests.toLocaleString()],
        ['Successful Requests',   r.successRequests.toLocaleString()],
        ['Error Requests',        r.totalErrors],
        ['Pass Rate',             r.passRate],
        ['Requests per Second',   r.rps],
        ['Min Response',          r.responseTime.min + 'ms'],
        ['Avg Response',          r.responseTime.avg + 'ms'],
        ['Median (P50)',          r.responseTime.p50 + 'ms'],
        ['P95 Response',          r.responseTime.p95 + 'ms'],
        ['P99 Response',          r.responseTime.p99 + 'ms'],
        ['Max Response',          r.responseTime.max + 'ms'],
        ['Threshold – Avg ≤500ms', r.thresholds.avgPassed    ? 'PASS' : 'FAIL'],
        ['Threshold – P95 ≤2s',   r.thresholds.p95Passed    ? 'PASS' : 'FAIL'],
        ['Threshold – Err ≤5%',   r.thresholds.errorPassed  ? 'PASS' : 'FAIL']
    ];

    rows1.forEach((rd, i) => {
        const row = s1.addRow(rd);
        const bg  = i === 0 ? BG_ROW1 : i % 2 === 0 ? BG_ROW1 : BG_ROW2;
        row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
        row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
        row.getCell(1).font = { bold: i === 0, color: { argb: i === 0 ? FG_WHITE : FG_GREY } };
        row.getCell(2).font = { bold: i === 0, color: { argb: FG_WHITE } };

        if (rd[0] === 'Requests per Second') row.getCell(2).font = { bold: true, color: { argb: FG_AMBER } };
        if (rd[0].includes('Avg Response'))  row.getCell(2).font = { bold: true, color: { argb: FG_CYAN } };
        if (rd[0].includes('P95'))           row.getCell(2).font = { bold: true, color: { argb: FG_AMBER } };
        if (rd[0].startsWith('Threshold')) {
            const isPassed = rd[1] === 'PASS';
            row.getCell(2).font = { bold: true, color: { argb: isPassed ? FG_GREEN : FG_RED } };
        }
        if (rd[0] === 'Pass Rate')  row.getCell(2).font = { bold: true, color: { argb: FG_GREEN } };
        if (rd[0] === 'Error Requests' && r.totalErrors > 0) row.getCell(2).font = { bold: true, color: { argb: FG_RED } };
    });

    // ── Sheet 2: Per-Endpoint Results ──────────────────────────────────────────
    const s2 = wb.addWorksheet('Endpoint Breakdown', { pageSetup: { orientation: 'landscape' } });
    ['A','B','C','D','E','F','G'].forEach((col, i) => {
        s2.getColumn(col).width = [40, 12, 12, 12, 12, 12, 10][i];
    });

    const titleRow2 = s2.addRow(['FurcaRiskAI – Per-Endpoint Load Test Breakdown', '', '', '', '', '', '']);
    titleRow2.getCell(1).font = { name: 'Calibri', size: 14, bold: true, color: { argb: FG_AMBER } };
    titleRow2.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BG_DARK } };
    s2.mergeCells('A1:G1');
    s2.addRow([]);

    const headerRow2 = s2.addRow(['Endpoint', 'Requests', 'Avg (ms)', 'Min (ms)', 'P95 (ms)', 'Max (ms)', 'Errors']);
    headerRow2.eachCell(cell => {
        cell.font = { bold: true, color: { argb: FG_WHITE } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BG_ROW1 } };
        cell.alignment = { horizontal: 'center' };
        cell.border = { bottom: { style: 'medium', color: { argb: FG_AMBER } } };
    });
    headerRow2.getCell(1).alignment = { horizontal: 'left' };

    (r.endpoints || []).forEach((e, i) => {
        const bg    = i % 2 === 0 ? BG_ROW1 : BG_ROW2;
        const row   = s2.addRow([e.label, e.total, e.avg, e.min, e.p95, e.max, e.failed]);
        row.eachCell(cell => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
            cell.font = { color: { argb: FG_WHITE } };
            cell.alignment = { horizontal: 'center' };
        });
        row.getCell(1).alignment = { horizontal: 'left' };
        row.getCell(3).font = { bold: true, color: { argb: FG_CYAN } };   // avg
        row.getCell(5).font = { bold: true, color: { argb: FG_AMBER } };  // p95
        row.getCell(7).font = { bold: true, color: { argb: e.failed > 0 ? FG_RED : FG_GREEN } };
    });

    s2.autoFilter = { from: 'A3', to: 'G3' };

    // Write
    const xlsxPath = path.join(OUT_EXCEL, 'Load_Test_Report.xlsx');
    await wb.xlsx.writeFile(xlsxPath);
    console.log('✅ Excel Report:   ' + xlsxPath);
}

generateExcel().catch(err => {
    console.error('Excel generation failed:', err.message);
});
