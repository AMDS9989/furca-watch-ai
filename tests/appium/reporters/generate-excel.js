/**
 * FurcaRiskAI - Appium Android E2E Excel Report Generator
 * Reads tests/appium/appium-results.json -> outputs Android_Appium_Test_Report.xlsx
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const config = require('../config');

const resultsFile = config.RESULTS_FILE;
const excelOutDir = path.resolve(__dirname, '../../../Test Results/Excel');

if (!fs.existsSync(resultsFile)) {
    console.error('ERROR: appium-results.json not found at ' + resultsFile);
    console.error('Run the Appium tests first: node tests/appium/app_test.js');
    process.exit(1);
}

let ExcelJS;
try {
    ExcelJS = require('exceljs');
} catch (e) {
    console.error('ERROR: exceljs not installed. Run: npm install exceljs');
    process.exit(1);
}

const r = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));

async function generateExcel() {
    const workbook = new ExcelJS.Workbook();
    workbook.creator  = 'FurcaRiskAI Mobile E2E Test Suite';
    workbook.created  = new Date();

    // ── Sheet 1: Executive Summary ──────────────────────────────────────────
    const summarySheet = workbook.addWorksheet('Executive Summary', {
        pageSetup: { orientation: 'portrait' }
    });

    summarySheet.getColumn('A').width = 30;
    summarySheet.getColumn('B').width = 45;

    const titleRow = summarySheet.addRow(['FurcaRiskAI – Android Mobile Appium Report', '']);
    titleRow.getCell(1).font = { name: 'Calibri', size: 18, bold: true, color: { argb: 'FF00F5D4' } };
    titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF030712' } };
    summarySheet.mergeCells('A1:B1');

    summarySheet.addRow([]);

    const headerStyle = {
        font: { bold: true, color: { argb: 'FFF8FAFC' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } },
        border: { bottom: { style: 'thin', color: { argb: 'FF334155' } } }
    };

    const summaryData = [
        ['Field', 'Value'],
        ['Suite Name', r.suiteName],
        ['Build Number', '#' + (r.buildNumber || '1.0.0')],
        ['Execution Date', new Date(r.executionDate).toUTCString()],
        ['Platform', r.platform || 'Android (UiAutomator2)'],
        ['APK Path', r.apkPath || 'app/build/outputs/apk/debug/app-debug.apk'],
        ['Duration (seconds)', r.durationMs ? (r.durationMs / 1000).toFixed(2) : '--'],
        ['Total Tests', r.totalTests || (r.tests ? r.tests.length : 0)],
        ['Tests Passed', r.passed || (r.tests ? r.tests.filter(t => t.status === 'PASS').length : 0)],
        ['Tests Failed', r.failed || 0],
        ['Pass Rate', r.passRate || '100.0%'],
        ['Overall Result', r.failed === 0 ? 'ALL PASSED ✅' : r.failed + ' FAILED ❌']
    ];

    summaryData.forEach(function(rowData, index) {
        const row = summarySheet.addRow(rowData);
        if (index === 0) {
            row.getCell(1).font = headerStyle.font;
            row.getCell(2).font = headerStyle.font;
            row.getCell(1).fill = headerStyle.fill;
            row.getCell(2).fill = headerStyle.fill;
        } else {
            row.getCell(1).font = { bold: true, color: { argb: 'FF94A3B8' } };
            if (rowData[0] === 'Tests Passed') row.getCell(2).font = { bold: true, color: { argb: 'FF00F5D4' } };
            if (rowData[0] === 'Tests Failed') row.getCell(2).font = { bold: true, color: { argb: r.failed > 0 ? 'FFFF4D6D' : 'FF00F5D4' } };
            if (rowData[0] === 'Pass Rate') row.getCell(2).font = { bold: true, color: { argb: 'FF00F0FF' } };
            if (rowData[0] === 'Overall Result') row.getCell(2).font = { bold: true, color: { argb: r.failed === 0 ? 'FF00F5D4' : 'FFFF4D6D' } };
            row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: index % 2 === 0 ? 'FF0F172A' : 'FF1E293B' } };
            row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: index % 2 === 0 ? 'FF0F172A' : 'FF1E293B' } };
        }
    });

    // ── Sheet 2: Detailed Test Results ────────────────────────────────────────
    const detailSheet = workbook.addWorksheet('Detailed Results', {
        pageSetup: { orientation: 'landscape' }
    });

    detailSheet.getColumn('A').width = 12;
    detailSheet.getColumn('B').width = 50;
    detailSheet.getColumn('C').width = 25;
    detailSheet.getColumn('D').width = 12;
    detailSheet.getColumn('E').width = 15;
    detailSheet.getColumn('F').width = 45;

    const detailTitle = detailSheet.addRow(['FurcaRiskAI – Mobile Appium Detailed Results', '', '', '', '', '']);
    detailTitle.getCell(1).font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF00F0FF' } };
    detailTitle.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF030712' } };
    detailSheet.mergeCells('A1:F1');
    detailSheet.addRow([]);

    const cols = ['Test ID', 'Test Name', 'Category', 'Status', 'Duration (ms)', 'Error / Notes'];
    const headerRow = detailSheet.addRow(cols);
    headerRow.eachCell(function(cell) {
        cell.font = { bold: true, color: { argb: 'FFF8FAFC' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
        cell.alignment = { horizontal: 'center' };
        cell.border = { bottom: { style: 'medium', color: { argb: 'FF00F0FF' } } };
    });

    const testList = r.tests || r.results || [];
    testList.forEach(function(t, i) {
        const isPass = t.status === 'PASS';
        const dataRow = detailSheet.addRow([
            t.id || `TC-MOB-${String(i+1).padStart(2, '0')}`,
            t.name,
            t.category || 'Mobile E2E',
            t.status,
            t.duration || 0,
            t.error || '—'
        ]);

        dataRow.getCell(1).alignment = { horizontal: 'center' };
        dataRow.getCell(4).alignment = { horizontal: 'center' };
        dataRow.getCell(5).alignment = { horizontal: 'right' };

        const bgColor = i % 2 === 0 ? 'FF0F172A' : 'FF1E293B';
        dataRow.eachCell(function(cell) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
            cell.font = { color: { argb: 'FFF8FAFC' } };
        });

        // Status badge coloring
        dataRow.getCell(4).font = {
            bold: true,
            color: { argb: isPass ? 'FF00F5D4' : 'FFFF4D6D' }
        };

        if (t.error) {
            dataRow.getCell(6).font = { color: { argb: 'FFFF4D6D' }, italic: true };
        }
    });

    detailSheet.autoFilter = { from: 'A3', to: 'F3' };

    // ── Sheet 3: Category Breakdown ───────────────────────────────────────────
    const catSheet = workbook.addWorksheet('Category Metrics', {
        pageSetup: { orientation: 'portrait' }
    });

    catSheet.getColumn('A').width = 30;
    catSheet.getColumn('B').width = 15;
    catSheet.getColumn('C').width = 15;
    catSheet.getColumn('D').width = 15;
    catSheet.getColumn('E').width = 15;

    const catTitle = catSheet.addRow(['FurcaRiskAI – Category Breakdown', '', '', '', '']);
    catTitle.getCell(1).font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF00F5D4' } };
    catTitle.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF030712' } };
    catSheet.mergeCells('A1:E1');
    catSheet.addRow([]);

    const catCols = ['Category Name', 'Total Tests', 'Passed', 'Failed', 'Pass Rate'];
    const catHeaderRow = catSheet.addRow(catCols);
    catHeaderRow.eachCell(function(cell) {
        cell.font = { bold: true, color: { argb: 'FFF8FAFC' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
        cell.alignment = { horizontal: 'center' };
        cell.border = { bottom: { style: 'medium', color: { argb: 'FF00F5D4' } } };
    });

    const categories = [...new Set(testList.map(t => t.category || 'Mobile E2E'))];
    categories.forEach(function(cat, idx) {
        const catTests = testList.filter(t => (t.category || 'Mobile E2E') === cat);
        const passed = catTests.filter(t => t.status === 'PASS').length;
        const failed = catTests.filter(t => t.status === 'FAIL').length;
        const total  = catTests.length;
        const pct    = total > 0 ? ((passed / total) * 100).toFixed(1) + '%' : '0%';

        const row = catSheet.addRow([cat, total, passed, failed, pct]);
        row.getCell(2).alignment = { horizontal: 'center' };
        row.getCell(3).alignment = { horizontal: 'center' };
        row.getCell(4).alignment = { horizontal: 'center' };
        row.getCell(5).alignment = { horizontal: 'center' };

        const bgColor = idx % 2 === 0 ? 'FF0F172A' : 'FF1E293B';
        row.eachCell(function(cell) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
            cell.font = { color: { argb: 'FFF8FAFC' } };
        });
        row.getCell(3).font = { bold: true, color: { argb: 'FF00F5D4' } };
        row.getCell(4).font = { bold: true, color: { argb: failed > 0 ? 'FFFF4D6D' : 'FF00F5D4' } };
        row.getCell(5).font = { bold: true, color: { argb: 'FF00F0FF' } };
    });

    // ── Write File ─────────────────────────────────────────────────────────────
    if (!fs.existsSync(excelOutDir)) fs.mkdirSync(excelOutDir, { recursive: true });
    const xlsxPath = path.join(excelOutDir, 'Android_Appium_Test_Report.xlsx');
    await workbook.xlsx.writeFile(xlsxPath);
    console.log('Excel report saved successfully to: ' + xlsxPath);
}

generateExcel().catch(function(err) {
    console.error('Error generating Excel report:', err.message);
    process.exit(1);
});
