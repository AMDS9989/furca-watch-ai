<div align="center">

# ðŸ¦· furca-watch-ai

### Periodontal Furcation Risk Assessment Platform

*AI-powered clinical decision support for periodontal diagnosis, furcation risk prediction, and patient management*

[![Deploy & Live E2E Tests](https://img.shields.io/github/actions/workflow/status/AMDS9989/furca-watch-ai/deploy-and-test.yml?label=Web%20E2E&logo=github)](https://github.com/AMDS9989/furca-watch-ai/actions/workflows/deploy-and-test.yml)
[![Android E2E](https://img.shields.io/github/actions/workflow/status/AMDS9989/furca-watch-ai/android-e2e.yml?label=Android%20E2E&logo=android)](https://github.com/AMDS9989/furca-watch-ai/actions/workflows/android-e2e.yml)
[![Load Test](https://img.shields.io/github/actions/workflow/status/AMDS9989/furca-watch-ai/load-test.yml?label=Load%20Test&logo=lightning)](https://github.com/AMDS9989/furca-watch-ai/actions/workflows/load-test.yml)
[![GitHub Pages](https://img.shields.io/badge/Live%20App-GitHub%20Pages-blue?logo=github)](https://AMDS9989.github.io/furca-watch-ai/)
![Node](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![Android](https://img.shields.io/badge/Android-Java-brightgreen?logo=android)

</div>

---

## ðŸ“‹ Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Web Application](#-web-application)
- [Backend API](#-backend-api)
- [Android App](#-android-app)
- [Testing](#-testing)
- [Load Testing](#-load-testing)
- [CI/CD Pipelines](#-cicd-pipelines)
- [Reports](#-reports)

---

## ðŸ”¬ Overview

**furca-watch-ai** is a full-stack clinical periodontal decision support platform that helps dental professionals:

- ðŸ“Š **Assess furcation collapse risk** using AI scoring (0â€“100%)
- ðŸ¦· **Manage patient records** with complete periodontal profiles
- ðŸ“… **Schedule appointments** and track treatment timelines
- ðŸ¤– **Chat with an AI assistant** for periodontal knowledge queries
- ðŸ“± **Android mobile app** with offline-first Room database
- ðŸŒ **Web dashboard** deployable to GitHub Pages

### Key Features

| Feature | Web | Android |
|---------|-----|---------|
| Patient Database | âœ… | âœ… |
| AI Risk Assessment | âœ… | âœ… |
| AI Chat Assistant | âœ… | âœ… |
| CBCT Viewer | âœ… | âœ… |
| Appointment Planner | âœ… | âœ… |
| Offline Mode | âœ… (SQLite) | âœ… (Room) |
| Supabase Sync | âœ… | â€“ |

---

## ðŸ— Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    furca-watch-ai Platform                    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Web SPA     â”‚   Backend API     â”‚   Android App          â”‚
â”‚  (GitHub     â”‚   (Express.js)    â”‚   (Java + Room)        â”‚
â”‚   Pages)     â”‚                   â”‚                        â”‚
â”‚              â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚  30 Fragments          â”‚
â”‚  HTML/CSS/JS â”‚  â”‚  Supabase   â”‚  â”‚  MVVM Architecture     â”‚
â”‚  Dark UI     â”‚  â”‚  (Primary)  â”‚  â”‚  Navigation Component  â”‚
â”‚  Glassmorphismâ”‚  â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜  â”‚  Offline-first         â”‚
â”‚              â”‚         â”‚          â”‚                        â”‚
â”‚              â”‚  â”Œâ”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”  â”‚                        â”‚
â”‚              â”‚  â”‚   SQLite    â”‚  â”‚                        â”‚
â”‚              â”‚  â”‚  (Fallback) â”‚  â”‚                        â”‚
â”‚              â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚                        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚                                    â”‚
         â–¼                                    â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”          â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Selenium E2E Tests â”‚          â”‚  Appium E2E Tests       â”‚
â”‚  10 test cases      â”‚          â”‚  Android automation     â”‚
â”‚  Page Object Model  â”‚          â”‚  Emulator-based         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜          â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚
         â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Load Test          â”‚
â”‚  100 VUs Ã— 60s      â”‚
â”‚  5 API endpoints    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸ“ Project Structure

```
furca-watch-ai/
â”‚
â”œâ”€â”€ web/                          # Static Web Application (SPA)
â”‚   â”œâ”€â”€ index.html                # Main HTML â€“ auth, dashboard, all views
â”‚   â”œâ”€â”€ style.css                 # Dark-mode design system (glassmorphism)
â”‚   â””â”€â”€ app.js                   # App engine (1683 lines) â€“ state, AI, CRUD
â”‚
â”œâ”€â”€ backend/                      # Node.js REST API
â”‚   â”œâ”€â”€ server.js                 # Express routes â€“ patients, auth, notifications
â”‚   â””â”€â”€ package.json             # Dependencies
â”‚
â”œâ”€â”€ app/                          # Android Application (Java)
â”‚   â””â”€â”€ src/main/
â”‚       â”œâ”€â”€ java/com/example/furca-watch-ai/
â”‚       â”‚   â”œâ”€â”€ MainActivity.java
â”‚       â”‚   â”œâ”€â”€ data/
â”‚       â”‚   â”‚   â”œâ”€â”€ dao/          # AppDao (Room queries)
â”‚       â”‚   â”‚   â”œâ”€â”€ database/     # AppDatabase (Room)
â”‚       â”‚   â”‚   â”œâ”€â”€ model/        # 9 data models
â”‚       â”‚   â”‚   â””â”€â”€ repository/   # AppRepository
â”‚       â”‚   â”œâ”€â”€ ui/
â”‚       â”‚   â”‚   â”œâ”€â”€ adapter/      # 4 RecyclerView adapters
â”‚       â”‚   â”‚   â””â”€â”€ fragment/     # 30 fragments
â”‚       â”‚   â””â”€â”€ viewmodel/        # MainViewModel
â”‚       â””â”€â”€ res/
â”‚           â”œâ”€â”€ layout/           # 40 XML layouts
â”‚           â”œâ”€â”€ navigation/       # nav_graph.xml
â”‚           â””â”€â”€ values/           # themes, colors, strings
â”‚
â”œâ”€â”€ tests/                        # All Automated Tests
â”‚   â”œâ”€â”€ selenium/                 # Web E2E tests (Selenium WebDriver)
â”‚   â”‚   â”œâ”€â”€ config.js             # BASE_URL, HEADLESS config
â”‚   â”‚   â”œâ”€â”€ web_test.js           # 10 test cases runner
â”‚   â”‚   â””â”€â”€ pages/               # Page Object Model
â”‚   â”‚       â”œâ”€â”€ BasePage.js
â”‚   â”‚       â”œâ”€â”€ LoginPage.js
â”‚   â”‚       â”œâ”€â”€ DashboardPage.js
â”‚   â”‚       â””â”€â”€ PatientDbPage.js
â”‚   â”œâ”€â”€ appium/
â”‚   â”‚   â””â”€â”€ app_test.js          # Android Appium E2E
â”‚   â”œâ”€â”€ reporters/
â”‚   â”‚   â”œâ”€â”€ generate-report.js   # HTML report
â”‚   â”‚   â”œâ”€â”€ generate-excel.js    # Excel report
â”‚   â”‚   â””â”€â”€ generate-summary.js  # GitHub Step Summary
â”‚   â””â”€â”€ package.json
â”‚
â”œâ”€â”€ load-test.js                  # Baseline load test (100 VUs Ã— 60s)
â”œâ”€â”€ load-test-report.js           # Load test HTML + Excel + MD reports
â”‚
â””â”€â”€ .github/workflows/
    â”œâ”€â”€ deploy-and-test.yml       # Deploy web â†’ Selenium E2E on live URL
    â”œâ”€â”€ android-e2e.yml           # Build APK â†’ Appium E2E â†’ Deploy reports
    â””â”€â”€ load-test.yml             # Backend load test (manual + weekly)
```

---

## âš¡ Quick Start

### Prerequisites

- **Node.js** â‰¥ 18
- **Java 17** (for Android build)
- **Android Studio** (for Android app)
- **Google Chrome** (for Selenium tests)
- **Python 3** (to serve web locally)

### 1. Clone the repository

```bash
git clone https://github.com/AMDS9989/furca-watch-ai.git
cd furca-watch-ai
```

### 2. Start the backend

```bash
cd backend
npm install
node server.js
# âœ… API running at http://localhost:3000
```

### 3. Open the web app

```bash
cd web
python -m http.server 8080
# âœ… Open http://localhost:8080
```

### 4. Login credentials

The backend accepts **any email/password** in fallback mode (no Supabase config needed for local dev).

---

## ðŸŒ Web Application

**Live URL:** `https://AMDS9989.github.io/furca-watch-ai/`

### Views

| View | Description |
|------|-------------|
| **Dashboard** | Metrics overview, appointments table, AI shortcuts |
| **Patient Database** | Full patient list, search, profile with risk gauge |
| **AI Diagnostics** | CBCT viewer, neural network graph, risk scoring |
| **AI Assistant** | Live chat with periodontal knowledge base |
| **Settings** | Doctor profile, preferences |

### Tech Stack

- Vanilla HTML/CSS/JavaScript (no framework)
- Glassmorphism dark UI with animated elements
- Supabase for cloud storage, SQLite fallback via backend

---

## ðŸ–¥ Backend API

**Base URL:** `http://localhost:3000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/patients` | List all patients |
| `POST` | `/api/patients` | Create / update patient |
| `DELETE` | `/api/patients/:id` | Delete patient |
| `GET` | `/api/appointments` | List appointments |
| `POST` | `/api/appointments` | Create appointment |
| `GET` | `/api/notifications` | List notifications |
| `POST` | `/api/notifications` | Create notification |
| `POST` | `/api/notifications/clear` | Clear all notifications |
| `POST` | `/api/auth/register` | Register new clinician |
| `POST` | `/api/auth/login` | Login (returns token) |

**Database Strategy:**
- **Primary:** Supabase (cloud PostgreSQL)
- **Fallback:** Local SQLite (`furcarisk.db`) â€” auto-seeded with mock patients

---

## ðŸ“± Android App

### Build & Run

```bash
# From project root
./gradlew assembleDebug
# APK: app/build/outputs/apk/debug/app-debug.apk
```

Or open in **Android Studio** and run directly.

### Architecture

```
MVVM + Navigation Component
  â”œâ”€â”€ MainViewModel          (shared state)
  â”œâ”€â”€ AppRepository          (data layer)
  â”œâ”€â”€ AppDatabase / AppDao   (Room ORM)
  â””â”€â”€ 30 Fragments           (UI layer)
```

### Fragments

Login, Signup, Welcome, Splash, Dashboard, Hospital Dashboard, Patient List, Patient Profile, Add Patient, Create Profile, Measurements, Medical History, Risk Score, Furcation Grade, AI Prediction, AI Analysis, AI Assistant, AI Alerts, CBCT Viewer, Root Anatomy, Occlusal Load, Disease Progression, Treatment Recommendation, Medication, Patient Progress, Dental History Timeline, Appointment Planner, Generate Report, Settings, Upload X-Ray, Tooth Selection, Emergency Consultation

---

## ðŸ§ª Testing

### Selenium Web E2E

```bash
cd tests
npm install
npm run test:web                  # runs against localhost:8080

# Against live GitHub Pages:
BASE_URL=https://AMDS9989.github.io/furca-watch-ai/ npm run test:web

# Generate reports:
npm run generate:reports
```

**Test Cases (10 total):**

| TC | Name |
|----|------|
| TC-01 | Page Load & Title Verification |
| TC-02 | Auth Bypass â€“ Dashboard Renders |
| TC-03 | Sidebar Navigation â€“ Patients Tab |
| TC-04 | Patient List Renders |
| TC-05 | Select First Patient â€“ Profile Renders |
| TC-06 | Add Patient via Dashboard Modal |
| TC-07 | Patient Search Filter |
| TC-08 | Sidebar Navigation â€“ AI Diagnostics Tab |
| TC-09 | Sidebar Navigation â€“ AI Assistant Tab |
| TC-10 | Run AI Scan Button Present |

### Appium Android E2E

```bash
cd tests
npm run test:app
```

---

## âš¡ Load Testing

**100 virtual users, 60 seconds, 5 endpoints simultaneously.**

```bash
# Start backend first
cd backend && node server.js &

# Run load test
node load-test.js

# Generate reports
node load-test-report.js
```

**Live output:**
```
  [10s / 60s]  Req/s:  118  â”‚  Avg:  234ms  â”‚  P95:  890ms  â”‚  Errors: 0
  [20s / 60s]  Req/s:  124  â”‚  Avg:  218ms  â”‚  P95:  820ms  â”‚  Errors: 0
  ...

  Total Requests  : 7,340
  RPS             : 122.3 req/sec
  Min / Avg / Max : 42ms / 225ms / 1,480ms
```

**Thresholds:**
- âœ… Avg response â‰¤ 500ms
- âœ… P95 response â‰¤ 2000ms
- âœ… Error rate â‰¤ 5%

---

## ðŸš€ CI/CD Pipelines

### 1. Deploy & Live E2E Tests (`deploy-and-test.yml`)

Triggers on every **push to main**.

```
push
 â””â”€â–º Build web app â†’ Deploy to GitHub Pages
      â””â”€â–º Wait for live URL (HTTP 200 poll)
           â””â”€â–º Selenium E2E (headless Chrome, 10 tests)
                â””â”€â–º Upload HTML + Excel + Screenshot artifacts
```

### 2. Android E2E (`android-e2e.yml`)

Triggers on **push/PR**.

```
push
 â””â”€â–º Build APK (Gradle)
      â””â”€â–º Start Android Emulator (API 33)
           â””â”€â–º Run Appium tests
                â””â”€â–º Generate reports â†’ Deploy to GitHub Pages
```

### 3. Baseline Load Test (`load-test.yml`)

Triggers **manually** or every **Monday 02:00 UTC**.

```
Manual trigger
 â””â”€â–º Start backend server
      â””â”€â–º Run 100 VU Ã— 60s load test
           â””â”€â–º Generate HTML + Excel + Markdown reports
                â””â”€â–º Upload artifacts
```

---

## ðŸ“Š Reports

After test runs, reports are generated in:

```
Test Results/
â”œâ”€â”€ HTML/execution-report.html     â† Selenium E2E HTML report
â”œâ”€â”€ Excel/Automation_Test_Report.xlsx
â”œâ”€â”€ Screenshots/                   â† Failure screenshots
â””â”€â”€ Summary/summary.md

Load Test Results/
â”œâ”€â”€ HTML/load-test-report.html     â† Load test report with gauges
â”œâ”€â”€ Excel/Load_Test_Report.xlsx
â””â”€â”€ Summary/load-test-summary.md
```

All reports are also available as **GitHub Actions Artifacts** after each workflow run.

---

## ðŸ”§ GitHub Pages Setup (One-Time)

1. Go to your repository on GitHub
2. **Settings â†’ Pages â†’ Source â†’ GitHub Actions**
3. Click **Save**
4. Push any commit â€” the app deploys automatically

Live URL: `https://AMDS9989.github.io/furca-watch-ai/`

---

## ðŸ“„ License

MIT License â€” furca-watch-ai Clinical Decision Support Platform

---

<div align="center">
Built with â¤ï¸ for periodontal clinical excellence
</div>

