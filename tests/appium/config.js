'use strict';
const path = require('path');

module.exports = {
    // Appium server host and port
    HOST: '127.0.0.1',
    PORT: 4723,
    LOG_LEVEL: 'info',

    // Path to the compiled debug APK
    APK_PATH: path.resolve(__dirname, '../../app/build/outputs/apk/debug/app-debug.apk'),

    // Target package and main activity
    APP_PACKAGE: 'com.example.furcariskai',
    APP_ACTIVITY: '.MainActivity',

    // Test output configurations
    RESULTS_FILE: path.resolve(__dirname, './appium-results.json'),
    SCREENSHOTS_DIR: path.resolve(__dirname, './screenshots'),
    REPORT_DIR: path.resolve(__dirname, './reports')
};
