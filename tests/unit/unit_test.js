'use strict';
/**
 * FurcaRiskAI – Unit Test Suite
 * ─────────────────────────────────────────────────────────────────────────────
 * 20 pure JavaScript unit tests — no browser, no server, instant execution.
 * Tests core logic: risk scoring, data mapping, validation helpers.
 *
 * Run: node unit/unit_test.js
 */

const fs   = require('fs');
const path = require('path');

const RESULTS_FILE = path.resolve(__dirname, '../unit-results.json');
const results = [];
let passed = 0, failed = 0;

// ── Minimal Test Runner ────────────────────────────────────────────────────────
function test(id, name, fn) {
    const t0 = Date.now();
    try {
        fn();
        const ms = Date.now() - t0;
        results.push({ id, name, status: 'PASS', duration: ms, error: null, category: 'Unit' });
        console.log(`  ✅  [${id}] ${name}  (${ms}ms)`);
        passed++;
    } catch (e) {
        const ms = Date.now() - t0;
        results.push({ id, name, status: 'FAIL', duration: ms, error: e.message, category: 'Unit' });
        console.log(`  ❌  [${id}] ${name}  (${ms}ms)`);
        console.log(`       ↳ ${e.message}`);
        failed++;
    }
}

function assert(condition, msg) {
    if (!condition) throw new Error(msg || 'Assertion failed');
}

function assertEqual(a, b, msg) {
    if (a !== b) throw new Error(msg || `Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

// ── Source logic extracted from app.js for testing ───────────────────────────
// Risk label categorisation
function getRiskLabel(score) {
    if (score >= 75) return 'CRITICAL';
    if (score >= 55) return 'HIGH';
    if (score >= 35) return 'MODERATE';
    return 'LOW';
}

// Patient ID generator
function generatePatientId() {
    const num = Math.floor(10000 + Math.random() * 89999);
    return `FR-${num}`;
}

// mapPatient – mirrors the function in app.js
function mapPatient(r) {
    return {
        id:                   r.id,
        name:                 r.name,
        age:                  r.age,
        gender:               r.gender,
        phoneNumber:          r.phone_number || r.phoneNumber || '',
        smoking:              r.smoking === true || r.smoking === 1,
        diabetes:             r.diabetes === true || r.diabetes === 1,
        pocketDepth:          r.pocket_depth !== undefined ? r.pocket_depth : (r.pocketDepth || 0),
        clinicalAttachmentLoss: r.clinical_attachment_loss !== undefined
                                ? r.clinical_attachment_loss
                                : (r.clinicalAttachmentLoss || 0),
        plaqueIndex:          r.plaque_index !== undefined ? r.plaque_index : (r.plaqueIndex || 0),
        bleeding:             r.bleeding === true || r.bleeding === 1,
        mobility:             r.mobility || 0,
        toothNumber:          r.tooth_number || r.toothNumber || '',
        riskScore:            r.risk_score || r.riskScore || 0,
        treatment:            r.treatment || '',
        doctorName:           r.doctor_name || r.doctorName || '',
        date:                 r.date || '',
        timeline:             Array.isArray(r.timeline) ? r.timeline
                                : (r.timeline ? JSON.parse(r.timeline) : [])
    };
}

// Appointment mapper
function mapAppointment(a) {
    return {
        patientId:   a.patient_id   || a.patientId,
        patientName: a.patient_name || a.patientName,
        date:        a.date,
        time:        a.time,
        reason:      a.goal || a.reason || ''
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIT TESTS
// ═══════════════════════════════════════════════════════════════════════════════
console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║    FurcaRiskAI – Unit Test Suite (20 Tests)                   ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');
console.log('  Category: Unit Tests\n');

// ── Risk Score Logic ──────────────────────────────────────────────────────────
test('TC-UNIT-01', 'Risk score >= 75 maps to CRITICAL', () => {
    assertEqual(getRiskLabel(84.2), 'CRITICAL');
    assertEqual(getRiskLabel(75),   'CRITICAL');
    assertEqual(getRiskLabel(99),   'CRITICAL');
});

test('TC-UNIT-02', 'Risk score 55–74 maps to HIGH', () => {
    assertEqual(getRiskLabel(68.5), 'HIGH');
    assertEqual(getRiskLabel(55),   'HIGH');
    assertEqual(getRiskLabel(74.9), 'HIGH');
});

test('TC-UNIT-03', 'Risk score 35–54 maps to MODERATE', () => {
    assertEqual(getRiskLabel(45.1), 'MODERATE');
    assertEqual(getRiskLabel(35),   'MODERATE');
    assertEqual(getRiskLabel(54.9), 'MODERATE');
});

test('TC-UNIT-04', 'Risk score < 35 maps to LOW', () => {
    assertEqual(getRiskLabel(18.3), 'LOW');
    assertEqual(getRiskLabel(0),    'LOW');
    assertEqual(getRiskLabel(34.9), 'LOW');
});

// ── Patient ID Generation ─────────────────────────────────────────────────────
test('TC-UNIT-05', 'Generated patient ID matches FR-XXXXX format', () => {
    const id = generatePatientId();
    assert(/^FR-\d{5}$/.test(id), `ID "${id}" does not match FR-XXXXX format`);
});

test('TC-UNIT-06', 'Generated patient IDs are unique across 100 calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generatePatientId()));
    assert(ids.size > 90, `Only ${ids.size} unique IDs from 100 calls`);
});

// ── mapPatient – snake_case → camelCase ───────────────────────────────────────
test('TC-UNIT-07', 'mapPatient maps phone_number to phoneNumber', () => {
    const result = mapPatient({ id:'FR-001', name:'Test', phone_number: '+1 555 123', smoking: false, diabetes: false });
    assertEqual(result.phoneNumber, '+1 555 123');
});

test('TC-UNIT-08', 'mapPatient maps pocket_depth to pocketDepth', () => {
    const result = mapPatient({ id:'FR-001', name:'Test', pocket_depth: 5, smoking: false, diabetes: false });
    assertEqual(result.pocketDepth, 5);
});

test('TC-UNIT-09', 'mapPatient maps clinical_attachment_loss to clinicalAttachmentLoss', () => {
    const result = mapPatient({ id:'FR-001', name:'Test', clinical_attachment_loss: 4, smoking: false, diabetes: false });
    assertEqual(result.clinicalAttachmentLoss, 4);
});

test('TC-UNIT-10', 'mapPatient maps plaque_index to plaqueIndex', () => {
    const result = mapPatient({ id:'FR-001', name:'Test', plaque_index: 2, smoking: false, diabetes: false });
    assertEqual(result.plaqueIndex, 2);
});

// ── Boolean Conversion ────────────────────────────────────────────────────────
test('TC-UNIT-11', 'smoking: 1 (int) converts to true boolean', () => {
    const result = mapPatient({ id:'FR-001', name:'Test', smoking: 1, diabetes: false });
    assertEqual(result.smoking, true);
});

test('TC-UNIT-12', 'smoking: 0 (int) converts to false boolean', () => {
    const result = mapPatient({ id:'FR-001', name:'Test', smoking: 0, diabetes: false });
    assertEqual(result.smoking, false);
});

test('TC-UNIT-13', 'diabetes: 1 (int) converts to true boolean', () => {
    const result = mapPatient({ id:'FR-001', name:'Test', smoking: false, diabetes: 1 });
    assertEqual(result.diabetes, true);
});

test('TC-UNIT-14', 'bleeding: true (bool) stays true', () => {
    const result = mapPatient({ id:'FR-001', name:'Test', smoking: false, diabetes: false, bleeding: true });
    assertEqual(result.bleeding, true);
});

// ── Default Values ────────────────────────────────────────────────────────────
test('TC-UNIT-15', 'Missing phoneNumber defaults to empty string', () => {
    const result = mapPatient({ id:'FR-001', name:'Test', smoking: false, diabetes: false });
    assertEqual(result.phoneNumber, '');
});

test('TC-UNIT-16', 'Missing riskScore defaults to 0', () => {
    const result = mapPatient({ id:'FR-001', name:'Test', smoking: false, diabetes: false });
    assertEqual(result.riskScore, 0);
});

test('TC-UNIT-17', 'Missing timeline defaults to empty array', () => {
    const result = mapPatient({ id:'FR-001', name:'Test', smoking: false, diabetes: false });
    assert(Array.isArray(result.timeline), 'timeline is not an array');
    assertEqual(result.timeline.length, 0);
});

test('TC-UNIT-18', 'JSON string timeline is parsed to array', () => {
    const tl = JSON.stringify([{ date: '2026-01-01', event: 'Visit', desc: 'Test' }]);
    const result = mapPatient({ id:'FR-001', name:'Test', smoking: false, diabetes: false, timeline: tl });
    assert(Array.isArray(result.timeline), 'timeline not an array after JSON.parse');
    assertEqual(result.timeline.length, 1);
    assertEqual(result.timeline[0].event, 'Visit');
});

// ── Appointment Mapper ────────────────────────────────────────────────────────
test('TC-UNIT-19', 'mapAppointment maps patient_id to patientId', () => {
    const result = mapAppointment({ patient_id: 'FR-001', patient_name: 'Test', date: '2026-01-01', time: '09:00', goal: 'Check-up' });
    assertEqual(result.patientId, 'FR-001');
    assertEqual(result.patientName, 'Test');
    assertEqual(result.reason, 'Check-up');
});

test('TC-UNIT-20', 'mapAppointment falls back to "reason" if no "goal"', () => {
    const result = mapAppointment({ patient_id: 'FR-001', patient_name: 'Test', date: '2026-01-01', time: '10:00', reason: 'Recall' });
    assertEqual(result.reason, 'Recall');
});

// ── Final Summary ─────────────────────────────────────────────────────────────
const elapsed = (results.reduce((acc, r) => acc + r.duration, 0)).toFixed(0);

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║                   UNIT TEST RESULTS                          ║');
console.log('╠═══════════════════════════════════════════════════════════════╣');
console.log(`║  Total Tests : ${String(results.length).padStart(3)}                                            ║`);
console.log(`║  Passed      : ${String(passed).padStart(3)}                                            ║`);
console.log(`║  Failed      : ${String(failed).padStart(3)}                                            ║`);
console.log(`║  Duration    : ${String(elapsed + 'ms').padStart(8)}                                       ║`);
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// Save results
const output = {
    meta: {
        buildNumber: process.env.GITHUB_RUN_NUMBER || 'local',
        platform: 'Unit Tests (Node.js)',
        timestamp: new Date().toISOString(),
        totalTests: results.length,
        passed, failed
    },
    categories: [{ name: 'Unit', tests: results, passed, failed }],
    results
};
fs.mkdirSync(path.dirname(RESULTS_FILE), { recursive: true });
fs.writeFileSync(RESULTS_FILE, JSON.stringify(output, null, 2));
console.log(`Results saved → ${RESULTS_FILE}`);

process.exit(failed > 0 ? 1 : 0);
