/**
 * FurcaRiskAI - Web Application Engine
 * Contains state management, CBCT slicer rendering, neural network graphs,
 * clinical calculators, and chatbot logics.
 */

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:3000/api';

    // -------------------------------------------------------------------------
    // TOAST NOTIFICATION SYSTEM
    // -------------------------------------------------------------------------
    function showToast(message, type = 'info', duration = 3500) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = {
            success: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>',
            error:   '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            info:    '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
        };
        toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(40px)';
            toast.style.transition = 'opacity 0.3s, transform 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    async function fetchFromAPI(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (e) {
            console.warn(`API call failed for ${endpoint}:`, e);
            return null;
        }
    }

    async function loadDataFromBackend() {
        const backendPatients = await fetchFromAPI('/patients');
        if (backendPatients && backendPatients.length > 0) {
            patients = backendPatients;
        }
        const backendAppointments = await fetchFromAPI('/appointments');
        if (backendAppointments && backendAppointments.length > 0) {
            appointments = backendAppointments.map(a => ({
                patientId: a.patientId,
                patientName: a.patientName,
                date: a.date,
                time: a.time,
                reason: a.goal
            }));
        }
        const backendNotifications = await fetchFromAPI('/notifications');
        if (backendNotifications && backendNotifications.length > 0) {
            notifications = backendNotifications.map(n => ({
                type: n.type,
                patientId: n.patientId,
                patientName: n.patientName,
                message: n.message,
                timestamp: "Just now"
            }));
        }
        
        // Refresh UI
        updateMetrics();
        renderAppointments();
        renderNotifications();
        renderPatientsList();
        if (patients.length > 0) {
            selectPatient(patients[0].id);
        }
    }

    // -------------------------------------------------------------------------
    // MOCK DATABASE
    // -------------------------------------------------------------------------
    let patients = [
        {
            id: "FR-23091",
            name: "Johnathan Smith",
            age: 42,
            gender: "Male",
            phoneNumber: "+1 (555) 019-2831",
            smoking: true,
            diabetes: true,
            pocketDepth: 5,
            clinicalAttachmentLoss: 4,
            plaqueIndex: 2,
            bleeding: true,
            mobility: 1,
            toothNumber: "16",
            riskScore: 84.2,
            treatment: "Guided Tissue Regeneration (GTR) & Bone Grafting",
            doctorName: "Dr. Shahid",
            date: "2026-07-14",
            timeline: [
                { date: "2026-07-14", event: "AI Diagnostic Scan", desc: "FurcaRisk score calculated at 84.2%. Grade II furcation detected on molar #16. Surgical regeneration planned." },
                { date: "2026-06-10", event: "Clinical Intake Profile", desc: "Plaque indices recorded as Grade II. Minor localized bleeding observed on probing molar #16." }
            ]
        },
        {
            id: "FR-84022",
            name: "Eleanor Vance",
            age: 58,
            gender: "Female",
            phoneNumber: "+1 (555) 304-9812",
            smoking: false,
            diabetes: false,
            pocketDepth: 4,
            clinicalAttachmentLoss: 3,
            plaqueIndex: 2,
            bleeding: true,
            mobility: 0,
            toothNumber: "46",
            riskScore: 68.5,
            treatment: "Scaling & Root Planing (SRP)",
            doctorName: "Dr. Shahid",
            date: "2026-07-10",
            timeline: [
                { date: "2026-07-10", event: "Periodontal Recalls", desc: "Recall scan performed on lower molar #46. Attachment levels stable, scaling schedule maintained." }
            ]
        },
        {
            id: "FR-11209",
            name: "Robert Miller",
            age: 35,
            gender: "Male",
            phoneNumber: "+1 (555) 890-4109",
            smoking: true,
            diabetes: false,
            pocketDepth: 3,
            clinicalAttachmentLoss: 2,
            plaqueIndex: 1,
            bleeding: false,
            mobility: 0,
            toothNumber: "26",
            riskScore: 45.1,
            treatment: "Sub-gingival Biofilm Debridement",
            doctorName: "Dr. Shahid",
            date: "2026-06-25",
            timeline: [
                { date: "2026-06-25", event: "Initial Examination", desc: "Diagnostic probing of molar #26. Minor bone loss, low attachment collapse risk." }
            ]
        },
        {
            id: "FR-50210",
            name: "Sophia Martinez",
            age: 29,
            gender: "Female",
            phoneNumber: "+1 (555) 762-2309",
            smoking: false,
            diabetes: false,
            pocketDepth: 2,
            clinicalAttachmentLoss: 0,
            plaqueIndex: 0,
            bleeding: false,
            mobility: 0,
            toothNumber: "36",
            riskScore: 18.3,
            treatment: "Prophylaxis & Oral Hygiene Instruction",
            doctorName: "Dr. Shahid",
            date: "2026-07-01",
            timeline: [
                { date: "2026-07-01", event: "Routine Prophylaxis Check", desc: "Full mouth scaling completed. Molar attachment levels fully intact. Risk score 18.3%." }
            ]
        }
    ];

    let appointments = [
        {
            patientId: "FR-23091",
            patientName: "Johnathan Smith",
            date: "2026-07-14",
            time: "09:00 AM",
            reason: "AI Diagnostic Scan"
        },
        {
            patientId: "FR-84022",
            patientName: "Eleanor Vance",
            date: "2026-07-14",
            time: "10:30 AM",
            reason: "Regenerative Recall"
        }
    ];

    let notifications = [
        {
            type: "CRITICAL",
            patientId: "FR-23091",
            patientName: "Johnathan Smith",
            message: "Bite force of 720N exceeding threshold for Patient Johnathan Smith (Grade II Molar #16).",
            timestamp: "10m ago"
        },
        {
            type: "HIGH",
            patientId: "FR-84022",
            patientName: "Eleanor Vance",
            message: "Worsening attachment loss (4mm) predicted for Patient Eleanor Vance.",
            timestamp: "1h ago"
        }
    ];

    // SVG base64 mock radiograph data URL
    const mockXrayBase64 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
        <rect width="300" height="300" fill="%230b1321"/>
        <g stroke="%23334155" stroke-width="2" fill="none">
            <path d="M0,150 Q75,130 150,150 T300,150" stroke-width="4" stroke="%231e293b"/>
            <!-- Bone contour -->
            <path d="M0,190 C60,195 100,205 130,200 C150,195 170,180 200,185 C240,190 270,180 300,185 L300,300 L0,300 Z" fill="%231e293b" fill-opacity="0.2"/>
        </g>
        <!-- Teeth roots outlines -->
        <g fill="%23e2e8f0" stroke="%23cbd5e1" stroke-width="1.5">
            <!-- Molar 1 -->
            <path d="M50,110 C50,160 40,185 45,190 C50,195 58,190 60,175 C62,190 70,195 75,190 C80,185 70,160 70,110 Z"/>
            <!-- Active Molar 16 -->
            <path id="active-tooth" d="M130,110 C130,160 120,190 125,195 C130,200 138,195 142,175 C146,195 154,200 159,195 C164,190 155,160 155,110 Z" fill="%23f8fafc" stroke="%2300f0ff" stroke-width="2"/>
            <!-- Molar 3 -->
            <path d="M210,110 C210,160 200,185 205,190 C210,195 218,190 220,175 C222,190 230,195 235,190 C240,185 230,160 230,110 Z"/>
        </g>
        <!-- Scanner marks -->
        <rect x="110" y="100" width="60" height="110" fill="none" stroke="%2300f0ff" stroke-dasharray="4,4" stroke-width="1"/>
    </svg>`;

    // Active state tracker
    let activePatientId = patients[0].id;
    let uploadXrayUri = null;
    let selectedJaw = "upper";
    let selectedTooth = "16";

    // -------------------------------------------------------------------------
    // TAB VIEW ROUTING
    // -------------------------------------------------------------------------
    const menuLinks = document.querySelectorAll('.sidebar-menu .menu-item');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');

    const viewTitles = {
        dashboard: { title: "Dashboard Overview", subtitle: "Welcome back. Here is the daily summary for FurcaRiskAI diagnostics." },
        patients: { title: "Patient Database", subtitle: "Access dental profiles, timelines, and raw measurements." },
        diagnostics: { title: "AI Diagnostic Suite", subtitle: "Upload radiographs, slide CBCT volumes, and compile reports." },
        assistant: { title: "AI Assistant", subtitle: "Explain clinical parameters and request therapeutic protocols." },
        settings: { title: "Settings & Setup", subtitle: "Review reference standard guidelines and patient databases." }
    };

    function switchTab(tabId) {
        // Toggle tabs
        tabPanels.forEach(panel => {
            if (panel.id === `tab-${tabId}`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        // Toggle active menu link
        menuLinks.forEach(link => {
            if (link.dataset.tab === tabId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update Title & Subtitle
        if (viewTitles[tabId]) {
            pageTitle.textContent = viewTitles[tabId].title;
            pageSubtitle.textContent = viewTitles[tabId].subtitle;
        }

        // Action when switching
        if (tabId === 'assistant') {
            document.getElementById('chat-input').focus();
        }
    }

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.dataset.tab;
            switchTab(tabId);
            window.location.hash = tabId;
        });
    });

    // Handle hash on initial load
    const initialHash = window.location.hash.substring(1);
    if (initialHash && viewTitles[initialHash]) {
        switchTab(initialHash);
    } else {
        switchTab('dashboard');
    }

    // -------------------------------------------------------------------------
    // DATABASE RENDERING & FLOW
    // -------------------------------------------------------------------------
    
    // Updates Dashboard Metrics
    function updateMetrics() {
        const totalPatients = patients.length + 250;
        const criticalCount = patients.filter(p => p.riskScore >= 75).length + 35;
        const lowCount = patients.filter(p => p.riskScore < 35).length + 120;
        const totalScans = patients.length * 4 + 1100;

        document.getElementById('dashboard-total-patients').textContent = totalPatients;
        document.getElementById('dashboard-critical-risk').textContent = criticalCount;
        document.getElementById('dashboard-low-risk').textContent = lowCount;
        document.getElementById('dashboard-total-scans').textContent = totalScans.toLocaleString();
    }

    // Populate Appointments Table
    function renderAppointments() {
        const tbody = document.getElementById('appointments-tbody');
        tbody.innerHTML = '';

        appointments.forEach(appt => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${appt.patientName}</strong></td>
                <td><code class="text-xs">${appt.patientId}</code></td>
                <td>${appt.time}</td>
                <td><span class="text-cyan">${appt.reason}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm btn-action-view" data-id="${appt.patientId}">View Profile</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Add event listeners to buttons
        tbody.querySelectorAll('.btn-action-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                selectPatient(btn.dataset.id);
                switchTab('patients');
            });
        });
    }

    // Populate Notifications List
    function renderNotifications() {
        const dropdown = document.getElementById('notifications-list');
        const indicator = document.querySelector('.notification-indicator');
        dropdown.innerHTML = '';

        if (notifications.length === 0) {
            dropdown.innerHTML = '<div class="p-lg text-center text-secondary text-sm">No new alerts</div>';
            indicator.style.display = 'none';
            return;
        }

        indicator.style.display = 'block';

        notifications.forEach(n => {
            const item = document.createElement('div');
            item.className = 'notification-item';
            item.dataset.id = n.patientId;
            
            const isCritical = n.type === 'CRITICAL';
            const iconBg = isCritical ? 'bg-red-light' : 'bg-yellow-light';
            const iconSvg = isCritical 
                ? `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
                : `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>`;

            item.innerHTML = `
                <div class="notification-item-icon ${iconBg}">${iconSvg}</div>
                <div class="notification-item-body">
                    <h5>${n.type} ALERT</h5>
                    <p>${n.message}</p>
                    <span>${n.timestamp}</span>
                </div>
            `;
            item.addEventListener('click', () => {
                selectPatient(n.patientId);
                switchTab('patients');
                document.getElementById('notifications-panel').classList.add('hidden');
            });
            dropdown.appendChild(item);
        });
    }

    // Toggle Notifications dropdown
    document.getElementById('btn-notifications').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('notifications-panel').classList.toggle('hidden');
    });

    document.getElementById('btn-clear-notifications').addEventListener('click', () => {
        notifications = [];
        renderNotifications();
        fetchFromAPI('/notifications/clear', { method: 'POST' });
    });

    document.addEventListener('click', () => {
        document.getElementById('notifications-panel').classList.add('hidden');
    });

    // Populate Patient List
    function renderPatientsList() {
        const container = document.getElementById('patients-list-container');
        const filter = document.getElementById('patient-search').value.toLowerCase();
        container.innerHTML = '';

        const filtered = patients.filter(p => 
            p.name.toLowerCase().includes(filter) || 
            p.id.toLowerCase().includes(filter)
        );

        filtered.forEach(p => {
            const item = document.createElement('div');
            item.className = `patient-list-item ${p.id === activePatientId ? 'selected' : ''}`;
            
            const isCritical = p.riskScore >= 75;
            const isLow = p.riskScore < 35;
            
            let statusClass = 'dot-yellow';
            let badgeClass = 'bg-yellow-light text-yellow';
            let label = 'MODERATE';
            if (isCritical) {
                statusClass = 'dot-red';
                badgeClass = 'bg-red-light text-red';
                label = 'CRITICAL';
            } else if (isLow) {
                statusClass = 'dot-green';
                badgeClass = 'bg-green-light text-green';
                label = 'LOW';
            } else if (p.riskScore >= 55) {
                statusClass = 'dot-yellow';
                badgeClass = 'bg-yellow-light text-yellow';
                label = 'HIGH';
            }

            item.innerHTML = `
                <div class="pat-info">
                    <h4>${p.name}</h4>
                    <p>Molar #${p.toothNumber} • <code class="text-xs">${p.id}</code></p>
                </div>
                <div class="pat-risk-badge ${badgeClass}">${label}</div>
            `;
            
            item.addEventListener('click', () => {
                selectPatient(p.id);
            });
            
            container.appendChild(item);
        });
    }

    document.getElementById('patient-search').addEventListener('input', renderPatientsList);

    // Profile updates and selection
    function selectPatient(patientId) {
        activePatientId = patientId;
        renderPatientsList();

        const p = patients.find(pat => pat.id === patientId);
        if (!p) return;

        // Show/Hide Profile State
        document.getElementById('profile-empty-state').classList.add('hidden');
        document.getElementById('profile-details-content').classList.remove('hidden');

        // Fill metadata
        document.getElementById('prof-name').textContent = p.name;
        document.getElementById('prof-id-badge').textContent = `ID: ${p.id}`;
        document.getElementById('prof-avatar').textContent = p.name.split(' ').map(n => n[0]).join('');
        document.getElementById('prof-age-gender').textContent = `${p.age} / ${p.gender}`;
        document.getElementById('prof-phone').textContent = p.phoneNumber;
        
        // Co-factors Badges
        document.getElementById('prof-smoking-badge').innerHTML = p.smoking 
            ? '<span class="badge badge-accent">Yes</span>' 
            : '<span class="badge btn-secondary">No</span>';
        document.getElementById('prof-diabetes-badge').innerHTML = p.diabetes 
            ? '<span class="badge badge-accent">Yes</span>' 
            : '<span class="badge btn-secondary">No</span>';

        // Parameters
        document.getElementById('prof-tooth-num').textContent = p.toothNumber;
        document.getElementById('prof-pd').textContent = `${p.pocketDepth} mm`;
        document.getElementById('prof-cal').textContent = `${p.clinicalAttachmentLoss} mm`;
        document.getElementById('prof-bop').textContent = p.bleeding ? "Positive" : "Negative";
        document.getElementById('prof-bop').className = p.bleeding ? "data-val text-red" : "data-val text-green";

        const plaques = ["Grade 0 (Absent)", "Grade I (Mild)", "Grade II (Moderate)", "Grade III (Severe)"];
        const mobilities = ["Grade 0 (Normal)", "Grade I (Mild)", "Grade II (Moderate)", "Grade III (Severe)"];
        document.getElementById('prof-plaque').textContent = plaques[p.plaqueIndex];
        document.getElementById('prof-mobility').textContent = mobilities[p.mobility];

        // Gauge circular progress
        const circle = document.getElementById('prof-gauge-circle');
        const scoreVal = document.getElementById('prof-risk-score');
        const scoreLabel = document.getElementById('prof-risk-label');

        // Animate circular gauge
        const radius = 40;
        const circ = 2 * Math.PI * radius; // 251.3
        const offset = circ - (p.riskScore / 100) * circ;
        circle.style.strokeDasharray = `${circ}`;
        circle.style.strokeDashoffset = offset;
        scoreVal.textContent = `${p.riskScore.toFixed(1)}%`;

        let riskLabel = "LOW";
        let riskColor = "var(--color-green)";
        if (p.riskScore >= 75) {
            riskLabel = "CRITICAL RISK";
            riskColor = "var(--color-red)";
        } else if (p.riskScore >= 55) {
            riskLabel = "HIGH RISK";
            riskColor = "var(--color-yellow)";
        } else if (p.riskScore >= 35) {
            riskLabel = "MODERATE RISK";
            riskColor = "var(--color-yellow)";
        }
        scoreLabel.textContent = riskLabel;
        scoreLabel.style.color = riskColor;
        circle.style.stroke = riskColor;

        // Populate Treatment Recommendations based on Risk
        const t1Title = document.getElementById('prof-therapy-1-title');
        const t1Desc = document.getElementById('prof-therapy-1-desc');
        const t2Title = document.getElementById('prof-therapy-2-title');
        const t2Desc = document.getElementById('prof-therapy-2-desc');

        if (p.riskScore >= 75) {
            t1Title.textContent = "Guided Tissue Regeneration (GTR)";
            t1Desc.textContent = "Place bioresorbable collagen membrane over bifurcation crotch to guide osteogenesis.";
            t2Title.textContent = "Surgical Bone Grafting";
            t2Desc.textContent = "Pack local particulate mineralized bone crystals directly into the cul-de-sac defect.";
        } else if (p.riskScore >= 35) {
            t1Title.textContent = "Scaling & Root Planing (SRP)";
            t1Desc.textContent = "Deep sub-gingival debridement under local anesthesia to purge anaerobic biofilm.";
            t2Title.textContent = "Bite force Adjusting";
            t2Desc.textContent = "Selective grinding of molar occlusal surfaces to relieve mechanical loading.";
        } else {
            t1Title.textContent = "Routine Prophylaxis & Biofilm Control";
            t1Desc.textContent = "Perform standard scaling and apply localized stannous fluoride gels.";
            t2Title.textContent = "Hygiene Monitoring";
            t2Desc.textContent = "Recall patient in 6 months for diagnostic probe measurement checkups.";
        }

        // Timeline
        const timeline = document.getElementById('prof-timeline');
        timeline.innerHTML = '';
        p.timeline.forEach(log => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            const dotClass = p.riskScore < 50 ? 'stable' : '';
            item.innerHTML = `
                <div class="timeline-dot ${dotClass}"></div>
                <div class="timeline-meta">
                    <strong>${log.event}</strong>
                    <span>${log.date}</span>
                </div>
                <p class="timeline-desc text-secondary text-sm">${log.desc}</p>
            `;
            timeline.appendChild(item);
        });

        // Set Active Parameters in Diagnostic Editors
        document.getElementById('diag-active-patient-name').textContent = p.name;
        document.getElementById('slider-pd').value = p.pocketDepth;
        document.getElementById('val-pd').textContent = `${p.pocketDepth} mm`;
        document.getElementById('slider-cal').value = p.clinicalAttachmentLoss;
        document.getElementById('val-cal').textContent = `${p.clinicalAttachmentLoss} mm`;
        document.getElementById('toggle-bop').checked = p.bleeding;
        document.getElementById('select-plaque').value = p.plaqueIndex;
        document.getElementById('select-mobility').value = p.mobility;

        // Jaw matching
        selectedTooth = p.toothNumber;
        const upperTeeth = ["18", "17", "16", "26", "27", "28"];
        selectedJaw = upperTeeth.includes(selectedTooth) ? "upper" : "lower";
        updateToothSelectorUI();
    }

    // -------------------------------------------------------------------------
    // DENTAL PARAMETERS EDITOR & LIVE CALCULATION
    // -------------------------------------------------------------------------
    
    // Live update calculations
    function recalculateRiskScore() {
        const p = patients.find(pat => pat.id === activePatientId);
        if (!p) return;

        // Base risk
        let score = 15;
        
        // Co-factors from patient metadata
        if (p.smoking) score += 25;
        if (p.diabetes) score += 25;
        if (p.age > 40) score += 15;
        if (p.gender.toLowerCase() === 'female') score += 10;

        // Clinical parameters sliders
        const pd = parseInt(document.getElementById('slider-pd').value);
        const cal = parseInt(document.getElementById('slider-cal').value);
        const bop = document.getElementById('toggle-bop').checked;
        const plaque = parseInt(document.getElementById('select-plaque').value);
        const mobility = parseInt(document.getElementById('select-mobility').value);

        if (pd >= 5) score += 10;
        if (bop) score += 8;
        if (cal >= 4) score += 12;
        score += plaque * 4;
        score += mobility * 5;

        // Mechanical Occlusal Load
        const biteforce = parseInt(document.getElementById('slider-biteforce').value);
        if (biteforce > 600) {
            score += 15;
        } else if (biteforce > 400) {
            score += 5;
        }

        // Root anatomy
        const divergence = parseInt(document.getElementById('slider-divergence').value);
        if (divergence < 15) score += 10; // Narrow divergence makes it harder to clean/regenerate

        p.riskScore = Math.min(100, Math.max(10, score));
        p.pocketDepth = pd;
        p.clinicalAttachmentLoss = cal;
        p.bleeding = bop;
        p.plaqueIndex = plaque;
        p.mobility = mobility;

        // Update UI
        selectPatient(p.id);
        updateMetrics();
    }

    // Bind slider listeners for diagnostics right panel
    document.getElementById('slider-pd').addEventListener('input', (e) => {
        document.getElementById('val-pd').textContent = `${e.target.value} mm`;
        recalculateRiskScore();
    });
    document.getElementById('slider-cal').addEventListener('input', (e) => {
        document.getElementById('val-cal').textContent = `${e.target.value} mm`;
        recalculateRiskScore();
    });
    document.getElementById('toggle-bop').addEventListener('change', recalculateRiskScore);
    document.getElementById('select-plaque').addEventListener('change', recalculateRiskScore);
    document.getElementById('select-mobility').addEventListener('change', recalculateRiskScore);

    document.getElementById('slider-root-trunk').addEventListener('input', (e) => {
        const val = (1.0 + (e.target.value / 10)).toFixed(1);
        document.getElementById('val-root-trunk').textContent = `${val} mm`;
    });
    document.getElementById('slider-divergence').addEventListener('input', (e) => {
        document.getElementById('val-divergence').textContent = `${e.target.value}°`;
        recalculateRiskScore();
    });
    document.getElementById('slider-entrance').addEventListener('input', (e) => {
        const val = (0.5 + (e.target.value / 20)).toFixed(1);
        document.getElementById('val-entrance').textContent = `${val} mm`;
    });

    document.getElementById('slider-biteforce').addEventListener('input', (e) => {
        const force = e.target.value;
        document.getElementById('val-biteforce').textContent = `${force} N`;
        
        const traumaBox = document.getElementById('trauma-box');
        const traumaLabel = document.getElementById('trauma-label');

        traumaBox.className = 'trauma-indicator-box';
        
        if (force > 600) {
            traumaLabel.textContent = "Present (Overload)";
            traumaLabel.style.color = "var(--color-red)";
            traumaBox.classList.add('border-red');
        } else if (force > 400) {
            traumaLabel.textContent = "Borderline";
            traumaLabel.style.color = "var(--color-yellow)";
            traumaBox.classList.add('border-yellow');
        } else {
            traumaLabel.textContent = "Normal";
            traumaLabel.style.color = "var(--color-green)";
            traumaBox.classList.add('border-green');
        }
        recalculateRiskScore();
    });

    // Jaw selection & Tooth button mappings
    const btnJawUpper = document.getElementById('btn-jaw-upper');
    const btnJawLower = document.getElementById('btn-jaw-lower');
    const teethGridUpper = document.getElementById('teeth-grid-upper');
    const teethGridLower = document.getElementById('teeth-grid-lower');

    btnJawUpper.addEventListener('click', () => {
        selectedJaw = "upper";
        btnJawUpper.classList.add('active');
        btnJawLower.classList.remove('active');
        teethGridUpper.classList.remove('hidden');
        teethGridLower.classList.add('hidden');
    });

    btnJawLower.addEventListener('click', () => {
        selectedJaw = "lower";
        btnJawUpper.classList.remove('active');
        btnJawLower.classList.add('active');
        teethGridUpper.classList.add('hidden');
        teethGridLower.classList.remove('hidden');
    });

    function updateToothSelectorUI() {
        if (selectedJaw === "upper") {
            btnJawUpper.click();
        } else {
            btnJawLower.click();
        }

        document.querySelectorAll('.tooth-btn').forEach(btn => {
            if (btn.dataset.tooth === selectedTooth) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    document.querySelectorAll('.tooth-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedTooth = btn.dataset.tooth;
            const p = patients.find(pat => pat.id === activePatientId);
            if (p) {
                p.toothNumber = selectedTooth;
                recalculateRiskScore();
            }
            updateToothSelectorUI();
        });
    });

    // -------------------------------------------------------------------------
    // DIAGNOSTIC FLOW WIZARD
    // -------------------------------------------------------------------------
    let currentStep = 1;

    function goStep(step) {
        currentStep = step;
        
        // Toggle Active Panels
        document.querySelectorAll('.wizard-step-panel').forEach((panel, index) => {
            if (index + 1 === step) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        // Toggle Indicators
        document.querySelectorAll('.step-indicator').forEach((ind, index) => {
            const indStep = index + 1;
            ind.className = 'step-indicator';
            if (indStep === step) {
                ind.classList.add('active');
            } else if (indStep < step) {
                ind.classList.add('completed');
            }
        });

        // Special actions per step
        if (step === 2) {
            drawCBCT(32);
        } else if (step === 3) {
            runLaserScan();
        } else if (step === 4) {
            runNeuralNetSimulation();
        } else if (step === 5) {
            compileResultsReport();
        }
    }

    // STEP 1: Uploading radiograph
    const xrayArea = document.getElementById('xray-upload-area');
    const xrayPreviewBox = document.getElementById('xray-preview-box');
    const xrayPreviewImg = document.getElementById('xray-preview-img');
    const xrayNextBtn = document.getElementById('btn-xray-next');

    document.getElementById('btn-select-xray-mock').addEventListener('click', () => {
        uploadXrayUri = mockXrayBase64;
        xrayPreviewImg.src = mockXrayBase64;
        xrayArea.classList.add('hidden');
        xrayPreviewBox.classList.remove('hidden');
        xrayNextBtn.classList.remove('disabled');
        xrayNextBtn.disabled = false;
    });

    xrayArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        xrayArea.classList.add('dragover');
    });

    xrayArea.addEventListener('dragleave', () => {
        xrayArea.classList.remove('dragover');
    });

    xrayArea.addEventListener('drop', (e) => {
        e.preventDefault();
        xrayArea.classList.remove('dragover');
        uploadXrayUri = mockXrayBase64; // load mock x-ray
        xrayPreviewImg.src = mockXrayBase64;
        xrayArea.classList.add('hidden');
        xrayPreviewBox.classList.remove('hidden');
        xrayNextBtn.classList.remove('disabled');
        xrayNextBtn.disabled = false;
    });

    xrayNextBtn.addEventListener('click', () => {
        goStep(2);
    });

    // STEP 2: CBCT Volumes Slicing Canvas
    const depthSlider = document.getElementById('cbct-depth-slider');
    const depthLabel = document.getElementById('cbct-slice-label');

    depthSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        depthLabel.textContent = `Slice #${val}`;
        drawCBCT(parseInt(val));
    });

    function drawCBCT(depth) {
        // Canvases
        const canvasSag = document.getElementById('canvas-sagittal');
        const canvasCor = document.getElementById('canvas-coronal');
        const canvasAx = document.getElementById('canvas-axial');

        const ctxSag = canvasSag.getContext('2d');
        const ctxCor = canvasCor.getContext('2d');
        const ctxAx = canvasAx.getContext('2d');

        // Clear & Draw Sagittal view
        ctxSag.fillStyle = '#030712';
        ctxSag.fillRect(0, 0, 150, 150);

        // Bone Base height moves slightly with slider
        ctxSag.fillStyle = 'rgba(0, 240, 255, 0.1)';
        ctxSag.beginPath();
        ctxSag.moveTo(0, 150);
        ctxSag.lineTo(0, 100 - (depth / 2));
        ctxSag.quadraticCurveTo(75, 100 - (depth / 2) + 15, 150, 100 - (depth / 2));
        ctxSag.lineTo(150, 150);
        ctxSag.closePath();
        ctxSag.fill();

        // Draw Molar roots cross section
        ctxSag.fillStyle = '#f8fafc';
        ctxSag.beginPath();
        ctxSag.arc(55, 60 + (depth / 5), 12, 0, Math.PI * 2);
        ctxSag.arc(95, 60 - (depth / 6), 10, 0, Math.PI * 2);
        ctxSag.fill();

        addNoise(ctxSag, 150, 150);

        // Draw Coronal view
        ctxCor.fillStyle = '#030712';
        ctxCor.fillRect(0, 0, 150, 150);

        ctxCor.fillStyle = 'rgba(0, 245, 212, 0.1)';
        ctxCor.beginPath();
        ctxCor.moveTo(0, 150);
        ctxCor.lineTo(0, 95);
        ctxCor.lineTo(55, 95);
        ctxCor.quadraticCurveTo(75, 95 + (depth / 2), 95, 95);
        ctxCor.lineTo(150, 95);
        ctxCor.lineTo(150, 150);
        ctxCor.closePath();
        ctxCor.fill();

        // Crown
        ctxCor.fillStyle = '#cbd5e1';
        ctxCor.fillRect(50, 30, 50, 40);

        addNoise(ctxCor, 150, 150);

        // Draw Axial View
        ctxAx.fillStyle = '#030712';
        ctxAx.fillRect(0, 0, 300, 150);

        ctxAx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
        ctxAx.lineWidth = 6;
        ctxAx.beginPath();
        ctxAx.arc(150, 180, 110, Math.PI, 0);
        ctxAx.stroke();

        // Render spot for active molar #16
        ctxAx.fillStyle = 'var(--accent)';
        ctxAx.beginPath();
        ctxAx.arc(85, 90, 8, 0, Math.PI * 2);
        ctxAx.fill();

        addNoise(ctxAx, 300, 150);
    }

    function addNoise(ctx, w, h) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < 150; i++) {
            const x = Math.floor(Math.random() * w);
            const y = Math.floor(Math.random() * h);
            ctx.fillRect(x, y, 1, 1);
        }
    }

    document.getElementById('btn-cbct-next').addEventListener('click', () => {
        goStep(3);
    });

    // STEP 3: Laser scan animation overlay
    function runLaserScan() {
        const baseImg = document.getElementById('analysis-base-xray');
        const laser = document.getElementById('analysis-laser-line');
        const overlay = document.getElementById('canvas-overlay');
        const statusMsg = document.getElementById('analysis-status-message');
        const nextBtn = document.getElementById('btn-analysis-next');

        baseImg.src = mockXrayBase64;
        laser.style.display = 'block';
        laser.classList.add('sweep');
        overlay.style.display = 'none';
        nextBtn.classList.add('hidden');
        statusMsg.textContent = "Running Computer Vision neural sweep...";

        setTimeout(() => {
            laser.classList.remove('sweep');
            laser.style.display = 'none';
            overlay.style.display = 'block';
            statusMsg.textContent = "Furcation ROI extracted. Bone defect heatmap overlaid.";
            nextBtn.classList.remove('hidden');

            // Draw bounding boxes on overlay canvas
            const ctx = overlay.getContext('2d');
            ctx.clearRect(0, 0, 300, 300);

            // Bounding box cyan
            ctx.strokeStyle = 'var(--accent)';
            ctx.lineWidth = 3.5;
            ctx.strokeRect(120, 130, 60, 60);

            // Bounding Label
            ctx.fillStyle = 'var(--accent)';
            ctx.font = '10px Inter';
            ctx.fillText("ROI: FURCATION BONE", 120, 122);

            // Heatmap gradient circle inside box
            const grad = ctx.createRadialGradient(150, 160, 5, 150, 160, 35);
            grad.addColorStop(0, 'rgba(255, 77, 109, 0.85)'); // Red
            grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)'); // Yellow
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Transparent
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(150, 160, 35, 0, Math.PI * 2);
            ctx.fill();

        }, 1600);
    }

    document.getElementById('btn-analysis-next').addEventListener('click', () => {
        goStep(4);
    });

    // STEP 4: Neural network animation nodes
    let neuralTimer = null;
    function runNeuralNetSimulation() {
        const canvas = document.getElementById('canvas-neuralnet');
        const ctx = canvas.getContext('2d');
        const statusText = document.getElementById('neuralnet-status-text');

        const statusSteps = [
            "Consolidating molar root parameters...",
            "Simulating occlusal mechanical stress...",
            "Evaluating diabetic & smoking systemic load...",
            "Generating AI prognostics models..."
        ];

        let logIndex = 0;
        statusText.textContent = statusSteps[0];

        // Animate loading text
        const textInterval = setInterval(() => {
            logIndex++;
            if (logIndex < statusSteps.length) {
                statusText.textContent = statusSteps[logIndex];
            } else {
                clearInterval(textInterval);
                clearInterval(neuralTimer);
                goStep(5);
            }
        }, 1000);

        // Nodes drawing variables
        const nodeCount = 18;
        const nodes = [];
        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                x: 40 + Math.random() * (canvas.width - 80),
                y: 30 + Math.random() * (canvas.height - 60),
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5
            });
        }

        function drawNeuralFrame() {
            ctx.fillStyle = '#080e1e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Connections lines
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
            ctx.lineWidth = 1;
            for (let i = 0; i < nodeCount; i++) {
                for (let j = i + 1; j < nodeCount; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 75) {
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw Nodes circles
            ctx.fillStyle = 'var(--accent)';
            for (let i = 0; i < nodeCount; i++) {
                // Update position
                nodes[i].x += nodes[i].vx;
                nodes[i].y += nodes[i].vy;

                // Bounce
                if (nodes[i].x < 10 || nodes[i].x > canvas.width - 10) nodes[i].vx *= -1;
                if (nodes[i].y < 10 || nodes[i].y > canvas.height - 10) nodes[i].vy *= -1;

                ctx.beginPath();
                ctx.arc(nodes[i].x, nodes[i].y, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        neuralTimer = setInterval(drawNeuralFrame, 35);
    }

    // STEP 5: Compile Report & Diagnostic results
    function compileResultsReport() {
        const p = patients.find(pat => pat.id === activePatientId);
        if (!p) return;

        const score = p.riskScore;
        const circle = document.getElementById('results-gauge-circle');
        const scoreText = document.getElementById('results-risk-score');
        const badge = document.getElementById('results-risk-label');
        const explain = document.getElementById('results-explain-text');
        const therapiesList = document.getElementById('results-therapies-container');

        // Animate radial progress
        const radius = 40;
        const circ = 2 * Math.PI * radius;
        const offset = circ - (score / 100) * circ;
        circle.style.strokeDasharray = `${circ}`;
        circle.style.strokeDashoffset = offset;
        scoreText.textContent = `${score.toFixed(1)}%`;

        let riskLabel = "LOW";
        let riskColor = "var(--color-green)";
        if (score >= 75) {
            riskLabel = "CRITICAL RISK";
            riskColor = "var(--color-red)";
        } else if (score >= 55) {
            riskLabel = "HIGH RISK";
            riskColor = "var(--color-yellow)";
        } else if (score >= 35) {
            riskLabel = "MODERATE RISK";
            riskColor = "var(--color-yellow)";
        }

        badge.textContent = riskLabel;
        badge.style.color = riskColor;
        circle.style.stroke = riskColor;

        explain.textContent = `Clinical pocket depth (${p.pocketDepth}mm) combined with ${p.smoking ? 'active tobacco smoking' : 'systemic glycemic indices'} results in a ${riskLabel.toLowerCase()} probability of furcation collapse in molar #${p.toothNumber}.`;

        // Render recommended therapies
        therapiesList.innerHTML = '';
        if (score >= 75) {
            therapiesList.appendChild(createTherapyDom("Guided Tissue Regeneration (GTR)", "Place bioresorbable collagen membrane over bifurcation crotch to guide osteogenesis."));
            therapiesList.appendChild(createTherapyDom("Surgical Bone Grafting", "Pack local particulate mineralized bone crystals directly into the cul-de-sac defect."));
        } else if (score >= 35) {
            therapiesList.appendChild(createTherapyDom("Scaling & Root Planing (SRP)", "Deep sub-gingival debridement under local anesthesia to purge anaerobic biofilm."));
            therapiesList.appendChild(createTherapyDom("Bite force Adjusting", "Selective grinding of molar occlusal surfaces to relieve mechanical loading."));
        } else {
            therapiesList.appendChild(createTherapyDom("Routine Prophylaxis & Biofilm Control", "Perform standard scaling and apply localized stannous fluoride gels."));
            therapiesList.appendChild(createTherapyDom("Hygiene Monitoring", "Recall patient in 6 months for diagnostic probe measurement checkups."));
        }
    }

    function createTherapyDom(title, desc) {
        const card = document.createElement('div');
        card.className = 'therapy-card';
        card.innerHTML = `
            <div class="therapy-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div class="therapy-details">
                <h5>${title}</h5>
                <p>${desc}</p>
            </div>
        `;
        return card;
    }

    function resetWizard() {
        uploadXrayUri = null;
        xrayArea.classList.remove('hidden');
        xrayPreviewBox.classList.add('hidden');
        xrayPreviewImg.src = '';
        xrayNextBtn.classList.add('disabled');
        xrayNextBtn.disabled = true;
        goStep(1);
    }

    document.getElementById('btn-results-reset').addEventListener('click', resetWizard);

    document.getElementById('btn-results-save-profile').addEventListener('click', async () => {
        const p = patients.find(pat => pat.id === activePatientId);
        if (p) {
            // Append timeline entry
            p.timeline.unshift({
                date: new Date().toISOString().split('T')[0],
                event: "AI Diagnostic Scan",
                desc: `Scan updated: risk at ${p.riskScore.toFixed(1)}%. Molar #${p.toothNumber} attachment measurements saved successfully.`
            });
            selectPatient(p.id);

            // Sync with backend API
            const result = await fetchFromAPI('/patients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p)
            });

            if (result) {
                showToast(`Diagnostic report saved for ${p.name} — synced to Supabase.`, 'success');
            } else {
                showToast('Saved locally (Supabase sync failed).', 'info');
            }
            switchTab('patients');
        }
    });

    // -------------------------------------------------------------------------
    // AI CHAT BOT ASSISTANT
    // -------------------------------------------------------------------------
    const chatLogs = document.getElementById('chat-logs');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('btn-chat-send');

    function appendChatMessage(message, isUser) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${isUser ? 'user' : 'bot'}`;
        msgDiv.textContent = message;
        chatLogs.appendChild(msgDiv);

        // Scroll down
        chatLogs.scrollTop = chatLogs.scrollHeight;
    }

    // Simple reply logic
    function replyToUser(message) {
        const msg = message.toLowerCase();
        let reply = "I am trained to explain early furcation risk parameters, Glickman/Hamp classifications, and periodontal therapeutics.";

        if (msg.includes("hamp") || msg.includes("grade")) {
            reply = "Hamp's Classification divides furcations into: Grade I (horizontal loss <3mm), Grade II (horizontal loss >3mm but not through-and-through), and Grade III (through-and-through tunnel).";
        } else if (msg.includes("surgical") || msg.includes("treatment") || msg.includes("therapy")) {
            reply = "Grade II furcations respond well to regenerative surgeries, including Guided Tissue Regeneration (GTR) using collagen barrier membranes and particulate bone grafting. Grade III may require root resections or tunneling.";
        } else if (msg.includes("smoking") || msg.includes("diabetes")) {
            reply = "Smoking induces local microvascular vasoconstriction, limiting healing. Uncontrolled diabetes (HbA1c > 7%) activates bone osteoclast resorption, accelerating furcation attachment loss.";
        }

        appendChatMessage(reply, false);
    }

    function handleChatSend() {
        const text = chatInput.value.trim();
        if (text === '') return;

        appendChatMessage(text, true);
        chatInput.value = '';

        setTimeout(() => {
            replyToUser(text);
        }, 650);
    }

    chatSendBtn.addEventListener('click', handleChatSend);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleChatSend();
    });

    // Quick chips click
    document.querySelectorAll('.chat-chip, .shortcut-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.dataset.query;
            appendChatMessage(query, true);
            switchTab('assistant');
            setTimeout(() => {
                replyToUser(query);
            }, 600);
        });
    });

    // Initial greeting message
    appendChatMessage("FurcaRisk Diagnostic AI is online. Ask anything about Hamp/Glickman classifications or surgical therapies.", false);

    // -------------------------------------------------------------------------
    // QUICK SHORTCUT HEADERS ACTIONS & MODALS
    // -------------------------------------------------------------------------
    
    // Quick scan buttons
    document.getElementById('btn-scan-quick').addEventListener('click', () => {
        resetWizard();
        switchTab('diagnostics');
    });

    document.getElementById('btn-goto-assistant').addEventListener('click', () => {
        switchTab('assistant');
    });

    document.getElementById('btn-view-alert-patient').addEventListener('click', () => {
        selectPatient("FR-23091");
        switchTab('patients');
    });

    // Edit profile measurements trigger
    document.getElementById('btn-edit-measurements').addEventListener('click', () => {
        switchTab('diagnostics');
    });

    document.getElementById('btn-start-diagnostics-active').addEventListener('click', () => {
        switchTab('diagnostics');
    });

    // Add Patient Modals
    const addPatientModal = document.getElementById('modal-add-patient');
    
    function showAddPatientModal() {
        addPatientModal.classList.remove('hidden');
        document.getElementById('modal-pat-name').focus();
    }

    function closeAddPatientModal() {
        addPatientModal.classList.add('hidden');
        // Clear
        document.getElementById('modal-pat-name').value = '';
        document.getElementById('modal-pat-age').value = '30';
        document.getElementById('modal-pat-phone').value = '+1 (555) ';
        document.getElementById('modal-pat-smoking').checked = false;
        document.getElementById('modal-pat-diabetes').checked = false;
    }

    document.getElementById('btn-add-patient-quick').addEventListener('click', showAddPatientModal);
    document.getElementById('btn-add-patient-tab').addEventListener('click', showAddPatientModal);
    document.getElementById('btn-modal-close').addEventListener('click', closeAddPatientModal);
    document.getElementById('btn-modal-cancel').addEventListener('click', closeAddPatientModal);

    document.getElementById('btn-modal-submit').addEventListener('click', async () => {
        const name = document.getElementById('modal-pat-name').value.trim();
        const age = parseInt(document.getElementById('modal-pat-age').value);
        const gender = document.getElementById('modal-pat-gender').value;
        const phone = document.getElementById('modal-pat-phone').value.trim();
        const tooth = document.getElementById('modal-pat-tooth').value;
        const smoking = document.getElementById('modal-pat-smoking').checked;
        const diabetes = document.getElementById('modal-pat-diabetes').checked;

        if (name === '') {
            showToast('Please enter a patient name.', 'error');
            return;
        }

        const id = `FR-${Math.floor(10000 + Math.random() * 90000)}`;

        // Calculate initial risk score based on co-factors
        let initialRisk = 15;
        if (smoking) initialRisk += 25;
        if (diabetes) initialRisk += 25;
        if (age > 40) initialRisk += 15;

        const newPatient = {
            id: id,
            name: name,
            age: age,
            gender: gender,
            phoneNumber: phone,
            smoking: smoking,
            diabetes: diabetes,
            pocketDepth: 3,
            clinicalAttachmentLoss: 1,
            plaqueIndex: 1,
            bleeding: false,
            mobility: 0,
            toothNumber: tooth,
            riskScore: Math.min(100, initialRisk),
            treatment: "Scaling & Hygiene Instruction",
            doctorName: document.getElementById('setting-doctor-name').value,
            date: new Date().toISOString().split('T')[0],
            timeline: [
                {
                    date: new Date().toISOString().split('T')[0],
                    event: "Patient Registration Intake",
                    desc: "Intake record established. Patient diagnostics scheduled."
                }
            ]
        };

        const newAppt = {
            patientId: id,
            patientName: name,
            date: new Date().toISOString().split('T')[0],
            time: "11:00 AM",
            goal: "AI Intake Review"
        };

        const newNotif = {
            type: "HIGH",
            patientId: id,
            patientName: name,
            message: `New patient registered: ${name} (${id}) — initial risk ${Math.min(100, initialRisk)}%`,
            date: new Date().toISOString().split('T')[0]
        };

        // Disable submit button during request
        const submitBtn = document.getElementById('btn-modal-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        // POST to backend (Supabase primary)
        const [patResult, apptResult, notifResult] = await Promise.all([
            fetchFromAPI('/patients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newPatient) }),
            fetchFromAPI('/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newAppt) }),
            fetchFromAPI('/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newNotif) })
        ]);

        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Patient Profile';

        // Update local state
        patients.push(newPatient);
        appointments.push({ patientId: id, patientName: name, date: newAppt.date, time: newAppt.time, reason: newAppt.goal });
        notifications.unshift({ type: "HIGH", patientId: id, patientName: name, message: newNotif.message, timestamp: "Just now" });

        if (patResult) {
            showToast(`Patient "${name}" registered and synced to Supabase.`, 'success');
        } else {
            showToast(`Patient "${name}" saved locally (Supabase sync pending).`, 'info');
        }

        // Refresh UI
        closeAddPatientModal();
        updateMetrics();
        renderPatientsList();
        renderAppointments();
        renderNotifications();
        selectPatient(id);
        switchTab('patients');
    });

    // Reset Database
    document.getElementById('btn-reset-db').addEventListener('click', () => {
        if (confirm("Reset patient profiles and appointment logs to default mock values?")) {
            location.reload();
        }
    });

    // Doctor name sync
    document.getElementById('setting-doctor-name').addEventListener('input', (e) => {
        document.querySelector('.sidebar-user h4').textContent = e.target.value;
    });

    // -------------------------------------------------------------------------
    // DELETE PATIENT — wired to DELETE /api/patients/:id
    // -------------------------------------------------------------------------
    document.getElementById('btn-delete-patient').addEventListener('click', async () => {
        const p = patients.find(pat => pat.id === activePatientId);
        if (!p) return;

        if (!confirm(`Permanently delete patient "${p.name}" (${p.id})? This cannot be undone.`)) return;

        const result = await fetchFromAPI(`/patients/${p.id}`, { method: 'DELETE' });

        // Remove from local state
        patients = patients.filter(pat => pat.id !== p.id);
        appointments = appointments.filter(a => a.patientId !== p.id);
        notifications = notifications.filter(n => n.patientId !== p.id);

        updateMetrics();
        renderPatientsList();
        renderAppointments();
        renderNotifications();

        // Hide profile panel
        document.getElementById('profile-details-content').classList.add('hidden');
        document.getElementById('profile-empty-state').classList.remove('hidden');

        // Select next patient if available
        if (patients.length > 0) {
            activePatientId = patients[0].id;
            selectPatient(activePatientId);
        }

        if (result) {
            showToast(`Patient "${p.name}" deleted and removed from Supabase.`, 'success');
        } else {
            showToast(`Patient deleted locally (Supabase sync may be pending).`, 'info');
        }
    });

    // -------------------------------------------------------------------------
    // SCHEDULE APPOINTMENT MODAL — wired to POST /api/appointments
    // -------------------------------------------------------------------------
    const apptModal = document.getElementById('modal-schedule-appt');
    let selectedApptTime = '';

    function openScheduleModal() {
        const p = patients.find(pat => pat.id === activePatientId);
        if (!p) return;
        document.getElementById('appt-patient-name').value = p.name;
        document.getElementById('appt-patient-id').value = p.id;
        // Set default date to today
        document.getElementById('appt-date').value = new Date().toISOString().split('T')[0];
        // Reset time selection
        selectedApptTime = '';
        document.getElementById('appt-time-selected').value = '';
        document.querySelectorAll('.time-slot-btn').forEach(btn => btn.classList.remove('selected'));
        apptModal.classList.remove('hidden');
    }

    function closeApptModal() {
        apptModal.classList.add('hidden');
    }

    document.getElementById('btn-schedule-appointment').addEventListener('click', openScheduleModal);
    document.getElementById('btn-appt-modal-close').addEventListener('click', closeApptModal);
    document.getElementById('btn-appt-modal-cancel').addEventListener('click', closeApptModal);

    // Time slot selection
    document.querySelectorAll('.time-slot-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedApptTime = btn.dataset.time;
            document.getElementById('appt-time-selected').value = selectedApptTime;
        });
    });

    // Close modal on overlay click
    apptModal.addEventListener('click', (e) => {
        if (e.target === apptModal) closeApptModal();
    });

    document.getElementById('btn-appt-modal-submit').addEventListener('click', async () => {
        const patientId = document.getElementById('appt-patient-id').value;
        const patientName = document.getElementById('appt-patient-name').value;
        const date = document.getElementById('appt-date').value;
        const time = selectedApptTime;
        const goal = document.getElementById('appt-goal').value;

        if (!date) {
            showToast('Please select an appointment date.', 'error');
            return;
        }
        if (!time) {
            showToast('Please select a time slot.', 'error');
            return;
        }

        const apptData = { patientId, patientName, date, time, goal };

        const submitBtn = document.getElementById('btn-appt-modal-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Scheduling...';

        const result = await fetchFromAPI('/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apptData)
        });

        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm Appointment';

        // Create notification for new appointment
        const notifData = {
            type: 'INFO',
            patientId,
            patientName,
            date,
            message: `Appointment scheduled for ${patientName} on ${date} at ${time} — Goal: ${goal}`
        };
        fetchFromAPI('/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notifData)
        });

        // Update local state
        appointments.push({ patientId, patientName, date, time, reason: goal });
        notifications.unshift({ type: 'INFO', patientId, patientName, message: notifData.message, timestamp: 'Just now' });
        renderAppointments();
        renderNotifications();
        closeApptModal();

        if (result) {
            showToast(`Appointment confirmed for ${patientName} on ${date} at ${time}.`, 'success');
        } else {
            showToast('Appointment saved locally (Supabase sync pending).', 'info');
        }
    });

    // Toggle Registration Form
    document.getElementById('link-show-register').addEventListener('click', () => {
        document.getElementById('login-form-section').classList.add('hidden');
        document.getElementById('register-form-section').classList.remove('hidden');
    });

    // Toggle Login Form
    document.getElementById('link-show-login').addEventListener('click', () => {
        document.getElementById('register-form-section').classList.add('hidden');
        document.getElementById('login-form-section').classList.remove('hidden');
    });

    // Handle Login Submit
    document.getElementById('btn-login-submit').addEventListener('click', async () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorMsg = document.getElementById('login-error');

        if (!email || !password) {
            errorMsg.textContent = "Please fill in all fields.";
            errorMsg.classList.remove('hidden');
            return;
        }

        errorMsg.classList.add('hidden');

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();
            if (response.ok && result.token) {
                localStorage.setItem('auth_token', result.token);
                localStorage.setItem('auth_user', JSON.stringify(result.user));
                
                // Initialize screen and state
                checkAuth();
            } else {
                errorMsg.textContent = result.error || "Login failed. Verify credentials.";
                errorMsg.classList.remove('hidden');
            }
        } catch (e) {
            console.error("Login request failed:", e);
            errorMsg.textContent = "Unable to connect to login server.";
            errorMsg.classList.remove('hidden');
        }
    });

    // Handle Register Submit
    document.getElementById('btn-register-submit').addEventListener('click', async () => {
        const name = document.getElementById('register-name').value;
        const specialty = document.getElementById('register-specialty').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const errorMsg = document.getElementById('register-error');

        if (!name || !email || !password) {
            errorMsg.textContent = "Name, email, and password are required.";
            errorMsg.classList.remove('hidden');
            return;
        }

        errorMsg.classList.add('hidden');

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, specialty, email, password })
            });

            const result = await response.json();
            if (response.ok) {
                showToast('Profile registered! You can now sign in.', 'success');
                // Switch back to login
                document.getElementById('register-form-section').classList.add('hidden');
                document.getElementById('login-form-section').classList.remove('hidden');
                document.getElementById('login-email').value = email;
                document.getElementById('login-password').value = "";
            } else {
                errorMsg.textContent = result.error || "Registration failed. Try again.";
                errorMsg.classList.remove('hidden');
            }
        } catch (e) {
            console.error("Register request failed:", e);
            errorMsg.textContent = "Unable to connect to server.";
            errorMsg.classList.remove('hidden');
        }
    });

    // Handle Logout Submit
    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        location.reload();
    });

    // Close add patient modal on overlay click
    document.getElementById('modal-add-patient').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal-add-patient')) closeAddPatientModal();
    });

    // Check auth status
    function checkAuth() {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('auth_user');
        const authScreen = document.getElementById('auth-screen');

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                
                // Update sidebar user metadata displays
                const sidebarUserH4 = document.querySelector('.sidebar-user h4');
                const sidebarUserP = document.querySelector('.sidebar-user p');
                const sidebarAvatar = document.querySelector('.user-avatar');
                
                if (sidebarUserH4) sidebarUserH4.textContent = user.name;
                if (sidebarUserP) sidebarUserP.textContent = user.specialty;
                if (sidebarAvatar && user.name) {
                    sidebarAvatar.textContent = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                }

                // Sync settings input
                const docNameInput = document.getElementById('setting-doctor-name');
                if (docNameInput) docNameInput.value = user.name;

                // Hide auth overlay
                authScreen.classList.add('hidden');

                // Initialize dashboard components
                updateMetrics();
                renderAppointments();
                renderNotifications();
                renderPatientsList();
                if (patients.length > 0) {
                    selectPatient(patients[0].id);
                }

                // Fetch database records
                loadDataFromBackend();
            } catch (e) {
                console.error("Error initializing session:", e);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                authScreen.classList.remove('hidden');
            }
        } else {
            authScreen.classList.remove('hidden');
        }
    }

    // Run auth check to boot app
    checkAuth();
});
