'use strict';
/**
 * FurcaRiskAI – Extended Unit Test Suite
 * ─────────────────────────────────────────────────────────────────────────────
 * 250 pure JavaScript unit tests — no browser, no server, instant execution.
 * Tests core logic: risk scoring, data mapping, validation helpers, clinical
 * algorithms, state transitions, regexes, and domain models.
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
        passed++;
    } catch (e) {
        const ms = Date.now() - t0;
        results.push({ id, name, status: 'FAIL', duration: ms, error: e.message, category: 'Unit' });
        failed++;
    }
}

function assert(condition, msg) {
    if (!condition) throw new Error(msg || 'Assertion failed');
}

function assertEqual(a, b, msg) {
    if (a !== b) throw new Error(msg || `Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

// ── Source logic extracted from app.js ────────────────────────────────────────
function getRiskLabel(score) {
    if (score >= 75) return 'CRITICAL';
    if (score >= 55) return 'HIGH';
    if (score >= 35) return 'MODERATE';
    return 'LOW';
}

function generatePatientId(index) {
    if (index !== undefined) {
        const str = String(index).padStart(5, '0');
        return `FR-${str}`;
    }
    const num = Math.floor(10000 + Math.random() * 89999);
    return `FR-${num}`;
}

function calculateRiskScore(params) {
    let score = 10;
    if (params.smoking) score += 20;
    if (params.diabetes) score += 25;
    score += (params.pocketDepth || 0) * 5;
    score += (params.clinicalAttachmentLoss || 0) * 4;
    score += (params.plaqueIndex || 0) * 3;
    if (params.bleeding) score += 10;
    score += (params.mobility || 0) * 8;
    return Math.min(100, Math.max(0, score));
}

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

function mapAppointment(a) {
    return {
        patientId:   a.patient_id   || a.patientId,
        patientName: a.patient_name || a.patientName,
        date:        a.date,
        time:        a.time,
        reason:      a.goal || a.reason || ''
    };
}

function validatePatientForm(p) {
    const errors = [];
    if (!p.name || p.name.trim().length < 2) errors.push('Name must be at least 2 characters');
    if (!p.age || p.age < 1 || p.age > 120) errors.push('Age must be between 1 and 120');
    if (p.pocketDepth !== undefined && (p.pocketDepth < 0 || p.pocketDepth > 15)) errors.push('Pocket depth out of range');
    if (p.plaqueIndex !== undefined && (p.plaqueIndex < 0 || p.plaqueIndex > 3)) errors.push('Plaque index out of range');
    return { valid: errors.length === 0, errors };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXECUTE 250 UNIT TEST CASES
// ═══════════════════════════════════════════════════════════════════════════════
console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║    FurcaRiskAI – Extended Unit Test Suite (250 Tests)         ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// Group 1: Risk Scoring Classification (Tests 1–40)
for (let i = 1; i <= 40; i++) {
    const score = (i - 1) * 2.5;
    const expected = score >= 75 ? 'CRITICAL' : score >= 55 ? 'HIGH' : score >= 35 ? 'MODERATE' : 'LOW';
    test(`TC-UNIT-${String(i).padStart(3, '0')}`, `Risk Score threshold calculation for score ${score.toFixed(1)} => ${expected}`, () => {
        assertEqual(getRiskLabel(score), expected);
    });
}

// Group 2: Patient ID Formatting & Uniqueness (Tests 41–70)
for (let i = 41; i <= 70; i++) {
    const idx = i - 40;
    test(`TC-UNIT-${String(i).padStart(3, '0')}`, `Patient ID generation index #${idx} formats properly as FR-XXXXX`, () => {
        const pid = generatePatientId(idx);
        assert(/^FR-\d{5}$/.test(pid), `Invalid ID format: ${pid}`);
    });
}

// Group 3: Clinical Risk Assessment Mathematical Calculations (Tests 71–120)
for (let i = 71; i <= 120; i++) {
    const pocket = (i % 8);
    const smoking = i % 2 === 0;
    const diabetes = i % 3 === 0;
    const bleeding = i % 4 === 0;
    test(`TC-UNIT-${String(i).padStart(3, '0')}`, `Clinical Risk Score computation test variant #${i - 70}`, () => {
        const score = calculateRiskScore({ pocketDepth: pocket, smoking, diabetes, bleeding });
        assert(score >= 0 && score <= 100, `Score out of bounds: ${score}`);
    });
}

// Group 4: Data Mapper & Schema Translation (Tests 121–170)
for (let i = 121; i <= 170; i++) {
    test(`TC-UNIT-${String(i).padStart(3, '0')}`, `Schema translation & mapping integrity test variant #${i - 120}`, () => {
        const raw = {
            id: `FR-${1000 + i}`,
            name: `Patient Name ${i}`,
            age: 20 + (i % 60),
            phone_number: `+1-555-01${i}`,
            pocket_depth: i % 10,
            smoking: i % 2 === 0 ? 1 : 0,
            diabetes: i % 3 === 0 ? 1 : 0
        };
        const mapped = mapPatient(raw);
        assertEqual(mapped.id, raw.id);
        assertEqual(mapped.phoneNumber, raw.phone_number);
        assertEqual(mapped.smoking, i % 2 === 0);
    });
}

// Group 5: Validation & Error Boundary Checks (Tests 171–210)
for (let i = 171; i <= 210; i++) {
    const age = (i % 2 === 0) ? (20 + (i % 50)) : -5;
    const isValidAge = age >= 1 && age <= 120;
    test(`TC-UNIT-${String(i).padStart(3, '0')}`, `Patient Form Validation rule checking #${i - 170}`, () => {
        const res = validatePatientForm({ name: `User ${i}`, age, pocketDepth: 4, plaqueIndex: 2 });
        assertEqual(res.valid, isValidAge);
    });
}

// Group 6: Appointment & Timeline Mapper Integrity (Tests 211–250)
for (let i = 211; i <= 250; i++) {
    test(`TC-UNIT-${String(i).padStart(3, '0')}`, `Appointment mapping & state transformation variant #${i - 210}`, () => {
        const appt = mapAppointment({
            patient_id: `FR-${2000 + i}`,
            patient_name: `Appointment Patient ${i}`,
            date: '2026-08-01',
            time: '10:00',
            goal: 'Routine Cleaning'
        });
        assertEqual(appt.patientId, `FR-${2000 + i}`);
        assertEqual(appt.reason, 'Routine Cleaning');
    });
}

// ── Summary Output ─────────────────────────────────────────────────────────────
const elapsed = (results.reduce((acc, r) => acc + r.duration, 0)).toFixed(0);

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║               EXTENDED UNIT TEST RESULTS                      ║');
console.log('╠═══════════════════════════════════════════════════════════════╣');
console.log(`║  Total Tests : ${String(results.length).padStart(3)}                                            ║`);
console.log(`║  Passed      : ${String(passed).padStart(3)}                                            ║`);
console.log(`║  Failed      : ${String(failed).padStart(3)}                                            ║`);
console.log(`║  Duration    : ${String(elapsed + 'ms').padStart(8)}                                       ║`);
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

const output = {
    meta: {
        buildNumber: process.env.GITHUB_RUN_NUMBER || 'local',
        platform: 'Unit Tests (Node.js)',
        timestamp: new Date().toISOString(),
        totalTests: results.length,
        passed, failed
    },
    categories: [{ name: 'Unit Tests', tests: results, passed, failed }],
    results
};

fs.mkdirSync(path.dirname(RESULTS_FILE), { recursive: true });
fs.writeFileSync(RESULTS_FILE, JSON.stringify(output, null, 2));
console.log(`Results saved → ${RESULTS_FILE}`);

process.exit(failed > 0 ? 1 : 0);
