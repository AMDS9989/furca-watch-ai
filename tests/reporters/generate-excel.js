/**
 * FurcaRiskAI - Selenium Web E2E Excel Report Generator
 * Reads tests/results.json -> outputs Automation_Test_Report.xlsx
 * Requires: npm install exceljs (in tests/ folder)
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const resultsFile = path.resolve(__dirname, '../results.json');
const excelOutDir = path.resolve(__dirname, '../../Test Results/Excel');

if (!fs.existsSync(resultsFile)) {
    console.error('ERROR: results.json not found at ' + resultsFile);
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
    workbook.creator  = 'FurcaRiskAI Test Suite';
    workbook.created  = new Date();

    // ── Sheet 1: Executive Summary ──────────────────────────────────────────
    const summarySheet = workbook.addWorksheet('Executive Summary', {
        pageSetup: { orientation: 'portrait' }
    });

    summarySheet.getColumn('A').width = 30;
    summarySheet.getColumn('B').width = 40;

    const titleRow = summarySheet.addRow(['FurcaRiskAI – Automation Test Report', '']);
    titleRow.getCell(1).font = { name: 'Calibri', size: 18, bold: true, color: { argb: 'FF00F0FF' } };
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
        ['Build Number', '#' + r.buildNumber],
        ['Execution Date', new Date(r.executionDate).toUTCString()],
        ['Platform', r.platform],
        ['Duration (seconds)', r.durationMs ? (r.durationMs / 1000).toFixed(2) : '--'],
        ['Total Tests', r.totalTests],
        ['Tests Passed', r.passed],
        ['Tests Failed', r.failed],
        ['Pass Rate', r.passRate],
        ['Overall Result', r.failed === 0 ? 'ALL PASSED' : r.failed + ' FAILED']
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
            // Color-code result fields
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

    detailSheet.getColumn('A').width = 8;
    detailSheet.getColumn('B').width = 55;
    detailSheet.getColumn('C').width = 12;
    detailSheet.getColumn('D').width = 15;
    detailSheet.getColumn('E').width = 50;

    const detailTitle = detailSheet.addRow(['FurcaRiskAI – Test Case Detailed Results', '', '', '', '']);
    detailTitle.getCell(1).font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF00F0FF' } };
    detailTitle.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF030712' } };
    detailSheet.mergeCells('A1:E1');
    detailSheet.addRow([]);

    const cols = ['#', 'Test Name', 'Status', 'Duration (ms)', 'Error / Notes'];
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
            i + 1,
            t.name,
            t.status,
            t.duration,
            t.error || '—'
        ]);

        dataRow.getCell(1).alignment = { horizontal: 'center' };
        dataRow.getCell(3).alignment = { horizontal: 'center' };

        const bgColor = i % 2 === 0 ? 'FF0F172A' : 'FF1E293B';
        dataRow.eachCell(function(cell) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
            cell.font = { color: { argb: 'FFF8FAFC' } };
        });

        // Status badge coloring
        dataRow.getCell(3).font = {
            bold: true,
            color: { argb: isPass ? 'FF00F5D4' : 'FFFF4D6D' }
        };

        if (t.error) {
            dataRow.getCell(5).font = { color: { argb: 'FFFF4D6D' }, italic: true };
        }
    });

    // Auto-filter on the header row
    detailSheet.autoFilter = { from: 'A3', to: 'E3' };

    // ── Write File ─────────────────────────────────────────────────────────────
    if (!fs.existsSync(excelOutDir)) fs.mkdirSync(excelOutDir, { recursive: true });
    const xlsxPath = path.join(excelOutDir, 'Automation_Test_Report.xlsx');
    await workbook.xlsx.writeFile(xlsxPath);
    console.log('Excel Report generated: ' + xlsxPath);
}

generateExcel().catch(function(err) {
    console.error('Error generating Excel report:', err.message);
    process.exit(1);
});

