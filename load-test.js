'use strict';
/**
 * FurcaRiskAI – Baseline / Load Test
 * ────────────────────────────────────────────────────────────────────────────
 * 100 virtual users (worker threads), running for 1 minute.
 * Each VU fires HTTP requests as fast as the server can respond.
 *
 * Usage:
 *   node load-test.js
 *   node load-test.js --host http://localhost:3000 --vus 100 --duration 60
 *
 * Output:
 *   - Live progress ticker every 10 s
 *   - load-test-results.json   (read by load-test-report.js)
 */

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const http   = require('http');
const https  = require('https');
const path   = require('path');
const fs     = require('fs');
const { performance } = require('perf_hooks');

// ── CLI / Config ─────────────────────────────────────────────────────────────
function parseArgs() {
    const args = process.argv.slice(2);
    const get  = (flag, def) => {
        const i = args.indexOf(flag);
        return i !== -1 && args[i + 1] ? args[i + 1] : def;
    };
    return {
        host:     get('--host',     'http://localhost:3000'),
        vus:      parseInt(get('--vus',      '100'), 10),
        duration: parseInt(get('--duration', '60'),  10)   // seconds
    };
}

// ── Endpoints under test ─────────────────────────────────────────────────────
function buildScenarios(host) {
    return [
        // ── GET endpoints (read traffic – highest volume) ──────────────────
        { method: 'GET',  path: '/api/patients',            body: null,                              label: 'GET /api/patients' },
        { method: 'GET',  path: '/api/appointments',        body: null,                              label: 'GET /api/appointments' },
        { method: 'GET',  path: '/api/notifications',       body: null,                              label: 'GET /api/notifications' },
        // ── POST endpoints (write / auth traffic) ─────────────────────────
        {
            method: 'POST', path: '/api/auth/login',
            body: JSON.stringify({ email: 'load-test@furcariskai.test', password: 'LoadTest2026!' }),
            label: 'POST /api/auth/login'
        },
        {
            method: 'POST', path: '/api/patients',
            body: JSON.stringify({
                id:    `LT-${Math.floor(Math.random() * 99999)}`,
                name:  'Load Test Patient',
                age:   30, gender: 'Unknown',
                phoneNumber: '', smoking: false, diabetes: false,
                pocketDepth: 3, clinicalAttachmentLoss: 2,
                plaqueIndex: 1, bleeding: false, mobility: 0,
                toothNumber: '11', riskScore: 10.0,
                treatment: 'Monitoring', doctorName: 'Dr. LoadTest',
                date: new Date().toISOString().split('T')[0]
            }),
            label: 'POST /api/patients'
        }
    ];
}

// ── Worker Thread – each VU runs this loop ────────────────────────────────────
if (!isMainThread) {
    const { host, duration, scenarios } = workerData;
    const endTime = Date.now() + duration * 1000;

    // Parse host for http/https module selection
    const url    = new URL(host);
    const client = url.protocol === 'https:' ? https : http;
    const port   = parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80);
    const hostname = url.hostname;

    function doRequest(scenario) {
        return new Promise((resolve) => {
            const t0 = performance.now();
            const options = {
                hostname,
                port,
                path:    scenario.path,
                method:  scenario.method,
                headers: {
                    'Content-Type':  'application/json',
                    'User-Agent':    'FurcaRiskAI-LoadTest/1.0',
                    'Connection':    'keep-alive'
                },
                timeout: 10000
            };
            if (scenario.body) {
                options.headers['Content-Length'] = Buffer.byteLength(scenario.body);
            }

            const req = client.request(options, (res) => {
                let data = '';
                res.on('data', chunk => { data += chunk; });
                res.on('end', () => {
                    const dur = performance.now() - t0;
                    resolve({ ok: res.statusCode < 500, statusCode: res.statusCode, dur, error: null, label: scenario.label });
                });
            });

            req.on('error',   (e) => { const dur = performance.now() - t0; resolve({ ok: false, statusCode: 0, dur, error: e.message, label: scenario.label }); });
            req.on('timeout', ()  => { req.destroy(); const dur = performance.now() - t0; resolve({ ok: false, statusCode: 0, dur, error: 'timeout', label: scenario.label }); });

            if (scenario.body) req.write(scenario.body);
            req.end();
        });
    }

    // Round-robin through scenarios
    let idx = 0;
    async function runLoop() {
        while (Date.now() < endTime) {
            const scenario = scenarios[idx % scenarios.length];
            idx++;
            const result = await doRequest(scenario);
            parentPort.postMessage(result);
        }
        parentPort.postMessage({ done: true });
    }

    runLoop();
    return;
}

// ── Main Thread ───────────────────────────────────────────────────────────────
async function main() {
    const cfg       = parseArgs();
    const scenarios = buildScenarios(cfg.host);

    console.log('');
    console.log('════════════════════════════════════════════════════════════════');
    console.log('  FurcaRiskAI – Baseline / Load Test');
    console.log(`  VUs      : ${cfg.vus}`);
    console.log(`  Duration : ${cfg.duration}s (${cfg.duration / 60} minute)`);
    console.log(`  Target   : ${cfg.host}`);
    console.log('════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('  Endpoints under test:');
    scenarios.forEach(s => console.log(`    ${s.method.padEnd(6)} ${s.path}`));
    console.log('');

    // ── Shared metrics state ─────────────────────────────────────────────────
    const allDurations    = [];       // all response times in ms
    const endpointMetrics = {};       // per-endpoint breakdown
    scenarios.forEach(s => {
        endpointMetrics[s.label] = { total: 0, passed: 0, failed: 0, durations: [] };
    });

    let totalRequests = 0;
    let totalErrors   = 0;
    let doneWorkers   = 0;

    const testStart   = Date.now();

    // ── Spawn workers (VUs) ──────────────────────────────────────────────────
    const workers = [];
    for (let i = 0; i < cfg.vus; i++) {
        const w = new Worker(__filename, {
            workerData: { host: cfg.host, duration: cfg.duration, scenarios }
        });
        w.on('message', (msg) => {
            if (msg.done) {
                doneWorkers++;
                return;
            }
            totalRequests++;
            allDurations.push(msg.dur);
            if (!msg.ok) totalErrors++;

            if (endpointMetrics[msg.label]) {
                const em = endpointMetrics[msg.label];
                em.total++;
                em.durations.push(msg.dur);
                if (msg.ok) em.passed++; else em.failed++;
            }
        });
        w.on('error', (e) => console.error(`Worker error: ${e.message}`));
        workers.push(w);
    }

    // ── Live progress ticker every 10s ────────────────────────────────────────
    const tickInterval = 10;
    let lastCount = 0;
    let elapsed   = 0;

    const ticker = setInterval(() => {
        elapsed += tickInterval;
        const rps     = ((totalRequests - lastCount) / tickInterval).toFixed(1);
        const avg     = allDurations.length > 0
            ? (allDurations.reduce((a, b) => a + b, 0) / allDurations.length).toFixed(0)
            : '--';
        // P95
        const sorted  = [...allDurations].sort((a, b) => a - b);
        const p95idx  = Math.floor(sorted.length * 0.95);
        const p95     = sorted.length > 0 ? Math.round(sorted[p95idx] || 0) : '--';
        const errRate = totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) : '0.00';

        lastCount = totalRequests;

        const pad  = (s) => String(s).padStart(6);
        console.log(
            `  [${String(elapsed).padStart(2, '0')}s / ${cfg.duration}s]` +
            `  Req/s: ${pad(rps)}` +
            `  │  Avg: ${pad(avg)}ms` +
            `  │  P95: ${pad(p95)}ms` +
            `  │  Errors: ${totalErrors} (${errRate}%)`
        );

        if (elapsed >= cfg.duration) clearInterval(ticker);
    }, tickInterval * 1000);

    // ── Wait for all workers to finish ────────────────────────────────────────
    await new Promise(resolve => {
        const check = setInterval(() => {
            if (doneWorkers >= cfg.vus) { clearInterval(check); resolve(); }
        }, 200);
    });

    clearInterval(ticker);
    const testDurationMs = Date.now() - testStart;

    // ── Calculate statistics ──────────────────────────────────────────────────
    function calcStats(durations) {
        if (durations.length === 0) return { min: 0, avg: 0, max: 0, p50: 0, p95: 0, p99: 0 };
        const s  = [...durations].sort((a, b) => a - b);
        const sum = s.reduce((a, b) => a + b, 0);
        return {
            min: Math.round(s[0]),
            avg: Math.round(sum / s.length),
            max: Math.round(s[s.length - 1]),
            p50: Math.round(s[Math.floor(s.length * 0.50)] || 0),
            p95: Math.round(s[Math.floor(s.length * 0.95)] || 0),
            p99: Math.round(s[Math.floor(s.length * 0.99)] || 0)
        };
    }

    const overall   = calcStats(allDurations);
    const rps       = parseFloat((totalRequests / (testDurationMs / 1000)).toFixed(2));
    const passRate  = totalRequests > 0 ? (((totalRequests - totalErrors) / totalRequests) * 100).toFixed(2) + '%' : '0%';

    const endpointResults = Object.entries(endpointMetrics).map(([label, em]) => ({
        label,
        total:    em.total,
        passed:   em.passed,
        failed:   em.failed,
        ...calcStats(em.durations)
    }));

    // ── Console Summary ───────────────────────────────────────────────────────
    console.log('');
    console.log('════════════════════════════════════════════════════════════════');
    console.log('  BASELINE LOAD TEST – RESULTS');
    console.log('════════════════════════════════════════════════════════════════');
    console.log(`  Total Requests  : ${totalRequests.toLocaleString()}`);
    console.log(`  RPS             : ${rps} req/sec`);
    console.log(`  Duration        : ${(testDurationMs / 1000).toFixed(1)}s`);
    console.log(`  Virtual Users   : ${cfg.vus}`);
    console.log('  ──────────────────────────────────────────────────────────────');
    console.log('  Response Times');
    console.log(`    Min    : ${overall.min}ms`);
    console.log(`    Avg    : ${overall.avg}ms`);
    console.log(`    Median : ${overall.p50}ms`);
    console.log(`    P95    : ${overall.p95}ms`);
    console.log(`    P99    : ${overall.p99}ms`);
    console.log(`    Max    : ${overall.max}ms`);
    console.log('  ──────────────────────────────────────────────────────────────');
    console.log(`  Errors  : ${totalErrors} (${(100 - parseFloat(passRate)).toFixed(2)}%)`);
    console.log(`  Pass    : ${passRate}`);
    console.log('  ──────────────────────────────────────────────────────────────');
    console.log('  Per-Endpoint Breakdown');
    endpointResults.forEach(e => {
        console.log(`    ${e.label.padEnd(35)}  Total: ${String(e.total).padStart(5)}  Avg: ${String(e.avg).padStart(5)}ms  Err: ${e.failed}`);
    });
    console.log('════════════════════════════════════════════════════════════════');
    console.log('');

    // ── Write results JSON ────────────────────────────────────────────────────
    const results = {
        suiteName:       'FurcaRiskAI Baseline Load Test',
        buildNumber:     process.env.GITHUB_RUN_NUMBER || 'local',
        executionDate:   new Date().toISOString(),
        host:            cfg.host,
        virtualUsers:    cfg.vus,
        plannedDuration: cfg.duration,
        actualDurationMs: testDurationMs,
        totalRequests,
        totalErrors,
        successRequests: totalRequests - totalErrors,
        rps,
        passRate,
        responseTime:    overall,
        endpoints:       endpointResults,
        thresholds: {
            maxAvgMs:      500,
            maxP95Ms:      2000,
            maxErrorPct:   5,
            avgPassed:     overall.avg     <= 500,
            p95Passed:     overall.p95     <= 2000,
            errorPassed:   (totalErrors / Math.max(totalRequests, 1)) * 100 <= 5
        }
    };

    const resultsPath = path.resolve(__dirname, 'load-test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2), 'utf8');
    console.log(`📄  Results written: ${resultsPath}`);

    // ── Threshold checks ─────────────────────────────────────────────────────
    console.log('');
    console.log('  THRESHOLD CHECKS');
    const t = results.thresholds;
    const icon = (pass) => pass ? '✅' : '❌';
    console.log(`  ${icon(t.avgPassed)}  Avg response ≤ 500ms    → ${overall.avg}ms`);
    console.log(`  ${icon(t.p95Passed)}  P95 response ≤ 2000ms   → ${overall.p95}ms`);
    console.log(`  ${icon(t.errorPassed)}  Error rate   ≤ 5%       → ${(100 - parseFloat(passRate)).toFixed(2)}%`);
    console.log('');

    const allThresholdsPassed = t.avgPassed && t.p95Passed && t.errorPassed;
    if (!allThresholdsPassed) {
        console.log('  ⚠️  One or more thresholds FAILED. Check load-test-results.json for details.');
        process.exitCode = 1;
    } else {
        console.log('  🎉  All thresholds PASSED!');
    }
    console.log('');
    console.log('  Run: node load-test-report.js   to generate HTML + Excel + Markdown reports.');
    console.log('');
}

main().catch(err => {
    console.error('Load test fatal error:', err);
    process.exitCode = 1;
});
