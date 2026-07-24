const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables if backend/.env exists
try { require('dotenv').config({ path: path.join(__dirname, '.env') }); } catch(_) {}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Supabase Initialization
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wdpukbmhvhlyortjwotj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_REIoJWeL52wOfoOnEQX-ng_t-_7NvPE';
let supabase = null;
try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Remote Supabase Client initialized successfully.');
} catch (err) {
    console.error('Supabase Initialization failed:', err.message);
}

// Local SQLite Database Initialization (as resilient local cache and fallback)
const dbPath = path.join(__dirname, 'furcarisk.db');
const localDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Local SQLite connection failed:', err.message);
    } else {
        console.log('Connected to Local SQLite database (fallback cache) at:', dbPath);
        initializeLocalDatabase();
    }
});

function initializeLocalDatabase() {
    localDb.serialize(() => {
        localDb.run(`CREATE TABLE IF NOT EXISTS patients (
            id TEXT PRIMARY KEY,
            name TEXT,
            age INTEGER,
            gender TEXT,
            phoneNumber TEXT,
            smoking INTEGER,
            diabetes INTEGER,
            pocketDepth INTEGER,
            clinicalAttachmentLoss INTEGER,
            plaqueIndex INTEGER,
            bleeding INTEGER,
            mobility INTEGER,
            toothNumber TEXT,
            riskScore REAL,
            treatment TEXT,
            doctorName TEXT,
            date TEXT
        )`);

        localDb.run(`CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patientId TEXT,
            patientName TEXT,
            date TEXT,
            time TEXT,
            goal TEXT
        )`);

        localDb.run(`CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patientId TEXT,
            patientName TEXT,
            date TEXT,
            message TEXT,
            type TEXT,
            read INTEGER DEFAULT 0
        )`);

        localDb.get("SELECT COUNT(*) AS count FROM patients", (err, row) => {
            if (err) return;
            if (row.count === 0) {
                console.log("Seeding local database mock entries...");
                seedLocalMockData();
            }
        });
    });
}

function seedLocalMockData() {
    const mockPatients = [
        {
            id: "FR-23091",
            name: "Johnathan Smith",
            age: 42,
            gender: "Male",
            phoneNumber: "+1 (555) 019-2831",
            smoking: 1,
            diabetes: 1,
            pocketDepth: 5,
            clinicalAttachmentLoss: 4,
            plaqueIndex: 2,
            bleeding: 1,
            mobility: 1,
            toothNumber: "16",
            riskScore: 84.2,
            treatment: "Guided Tissue Regeneration (GTR) & Bone Grafting",
            doctorName: "Dr. Shahid",
            date: "2026-07-14"
        },
        {
            id: "FR-84022",
            name: "Eleanor Vance",
            age: 58,
            gender: "Female",
            phoneNumber: "+1 (555) 304-9812",
            smoking: 0,
            diabetes: 0,
            pocketDepth: 4,
            clinicalAttachmentLoss: 3,
            plaqueIndex: 2,
            bleeding: 1,
            mobility: 0,
            toothNumber: "46",
            riskScore: 68.5,
            treatment: "Scaling & Root Planing (SRP)",
            doctorName: "Dr. Shahid",
            date: "2026-07-10"
        }
    ];

    const stmt = localDb.prepare(`INSERT OR REPLACE INTO patients VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    mockPatients.forEach(p => {
        stmt.run(
            p.id, p.name, p.age, p.gender, p.phoneNumber, 
            p.smoking, p.diabetes, p.pocketDepth, p.clinicalAttachmentLoss, 
            p.plaqueIndex, p.bleeding, p.mobility, p.toothNumber, 
            p.riskScore, p.treatment, p.doctorName, p.date
        );
    });
    stmt.finalize();
}

// -------------------------------------------------------------------------
// API ROUTES WITH REMOTE SUPABASE PRIMARY & LOCAL SQLITE FALLBACK
// -------------------------------------------------------------------------

// --- Patients Routes ---

// Get all patients
app.get('/api/patients', async (req, res) => {
    if (supabase) {
        console.log('Fetching patients from Remote Supabase...');
        const { data, error } = await supabase.from('patients').select('*').order('name', { ascending: true });
        
        if (!error && data) {
            console.log('Successfully loaded patients from Supabase.');
            const patientsMapped = data.map(r => ({
                id: r.id,
                name: r.name,
                age: r.age,
                gender: r.gender,
                phoneNumber: r.phone_number,
                smoking: r.smoking === true,
                diabetes: r.diabetes === true,
                pocketDepth: r.pocket_depth,
                clinicalAttachmentLoss: r.clinical_attachment_loss,
                plaqueIndex: r.plaque_index,
                bleeding: r.bleeding === true,
                mobility: r.mobility,
                toothNumber: r.tooth_number,
                riskScore: r.risk_score,
                treatment: r.treatment,
                doctorName: r.doctor_name,
                date: r.date,
                timeline: Array.isArray(r.timeline) ? r.timeline : JSON.parse(r.timeline || '[]')
            }));
            res.json(patientsMapped);
            return;
        }
        console.warn('Supabase query failed or table missing. Error details:', error ? error.message : 'No data');
        console.log('Falling back to local SQLite...');
    }

    localDb.all("SELECT * FROM patients ORDER BY name ASC", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        const patientsMapped = rows.map(r => ({
            ...r,
            smoking: r.smoking === 1,
            diabetes: r.diabetes === 1,
            bleeding: r.bleeding === 1,
            timeline: [
                { date: r.date, event: "Local Cache Record", desc: "Patient data fetched from local SQLite database fallback." }
            ]
        }));
        res.json(patientsMapped);
    });
});

// Create/Update patient (UPSERT)
app.post('/api/patients', async (req, res) => {
    const p = req.body;
    if (!p.id || !p.name) {
        res.status(400).json({ error: "Patient id and name are required fields" });
        return;
    }

    // Save to Supabase (Primary)
    let remoteSuccess = false;
    if (supabase) {
        console.log(`Saving patient ${p.id} to Supabase...`);
        const payload = {
            id: p.id,
            name: p.name,
            age: p.age || 0,
            gender: p.gender || 'Unknown',
            phone_number: p.phoneNumber || '',
            smoking: p.smoking === true,
            diabetes: p.diabetes === true,
            pocket_depth: p.pocketDepth || 0,
            clinical_attachment_loss: p.clinicalAttachmentLoss || 0,
            plaque_index: p.plaqueIndex || 0,
            bleeding: p.bleeding === true,
            mobility: p.mobility || 0,
            tooth_number: p.toothNumber || '',
            risk_score: p.riskScore || 0.0,
            treatment: p.treatment || '',
            doctor_name: p.doctorName || '',
            date: p.date || new Date().toISOString().split('T')[0],
            timeline: p.timeline || []
        };

        const { error } = await supabase.from('patients').upsert(payload);
        if (!error) {
            console.log(`Successfully upserted patient ${p.id} on Supabase.`);
            remoteSuccess = true;
        } else {
            console.warn(`Supabase upsert failed: ${error.message}. Syncing to local cache...`);
        }
    }

    // Always mirror to SQLite (for cache consistency)
    const localQuery = `INSERT OR REPLACE INTO patients (
        id, name, age, gender, phoneNumber, smoking, diabetes, 
        pocketDepth, clinicalAttachmentLoss, plaqueIndex, bleeding, 
        mobility, toothNumber, riskScore, treatment, doctorName, date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    localDb.run(localQuery, [
        p.id, p.name, p.age || 0, p.gender || 'Unknown', p.phoneNumber || '', 
        p.smoking ? 1 : 0, p.diabetes ? 1 : 0, p.pocketDepth || 0, p.clinicalAttachmentLoss || 0, 
        p.plaqueIndex || 0, p.bleeding ? 1 : 0, p.mobility || 0, p.toothNumber || '', 
        p.riskScore || 0.0, p.treatment || '', p.doctorName || '', p.date || new Date().toISOString().split('T')[0]
    ], function(err) {
        if (err && !remoteSuccess) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Patient saved successfully", id: p.id, remoteSynced: remoteSuccess });
    });
});

// Delete patient
app.delete('/api/patients/:id', async (req, res) => {
    const pid = req.params.id;
    let remoteSuccess = false;
    
    if (supabase) {
        console.log(`Deleting patient ${pid} from Supabase...`);
        const { error } = await supabase.from('patients').delete().eq('id', pid);
        if (!error) {
            console.log(`Successfully deleted patient ${pid} from Supabase.`);
            remoteSuccess = true;
        } else {
            console.warn(`Supabase delete failed: ${error.message}`);
        }
    }

    localDb.run("DELETE FROM patients WHERE id = ?", [pid], function(err) {
        if (err && !remoteSuccess) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Patient deleted successfully", remoteSynced: remoteSuccess });
    });
});

// --- Appointments Routes ---

// Get all appointments
app.get('/api/appointments', async (req, res) => {
    if (supabase) {
        console.log('Fetching appointments from Supabase...');
        const { data, error } = await supabase.from('appointments').select('*').order('date', { ascending: true });
        
        if (!error && data) {
            const mapped = data.map(r => ({
                id: r.id,
                patientId: r.patient_id,
                patientName: r.patient_name,
                date: r.date,
                time: r.time,
                goal: r.goal
            }));
            res.json(mapped);
            return;
        }
    }

    localDb.all("SELECT * FROM appointments ORDER BY date ASC, time ASC", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Create appointment
app.post('/api/appointments', async (req, res) => {
    const a = req.body;
    if (!a.patientId || !a.patientName || !a.date || !a.time) {
        res.status(400).json({ error: "Missing appointment required fields" });
        return;
    }

    let remoteSuccess = false;
    if (supabase) {
        console.log('Sending appointment to Supabase...');
        const { error } = await supabase.from('appointments').insert({
            patient_id: a.patientId,
            patient_name: a.patientName,
            date: a.date,
            time: a.time,
            goal: a.goal || ''
        });
        if (!error) {
            remoteSuccess = true;
        } else {
            console.warn(`Supabase insert failed: ${error.message}`);
        }
    }

    localDb.run(`INSERT INTO appointments (patientId, patientName, date, time, goal) VALUES (?, ?, ?, ?, ?)`,
        [a.patientId, a.patientName, a.date, a.time, a.goal || ''],
        function(err) {
            if (err && !remoteSuccess) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: "Appointment scheduled successfully", localId: this.lastID, remoteSynced: remoteSuccess });
        }
    );
});

// --- Notifications Routes ---

// Get all notifications
app.get('/api/notifications', async (req, res) => {
    if (supabase) {
        console.log('Fetching notifications from Supabase...');
        const { data, error } = await supabase.from('notifications').select('*').order('id', { ascending: false });
        if (!error && data) {
            const mapped = data.map(r => ({
                id: r.id,
                patientId: r.patient_id,
                patientName: r.patient_name,
                date: r.date,
                message: r.message,
                type: r.type,
                read: r.read === true
            }));
            res.json(mapped);
            return;
        }
    }

    localDb.all("SELECT * FROM notifications ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        const mapped = rows.map(r => ({
            ...r,
            read: r.read === 1
        }));
        res.json(mapped);
    });
});

// Create notification
app.post('/api/notifications', async (req, res) => {
    const n = req.body;
    if (!n.message) {
        res.status(400).json({ error: "Notification message is required" });
        return;
    }

    let remoteSuccess = false;
    if (supabase) {
        console.log('Sending notification to Supabase...');
        const { error } = await supabase.from('notifications').insert({
            patient_id: n.patientId || '',
            patient_name: n.patientName || '',
            date: n.date || new Date().toISOString().split('T')[0],
            message: n.message,
            type: n.type || 'INFO',
            read: n.read === true
        });
        if (!error) remoteSuccess = true;
    }

    localDb.run(`INSERT INTO notifications (patientId, patientName, date, message, type, read) VALUES (?, ?, ?, ?, ?, ?)`,
        [n.patientId || '', n.patientName || '', n.date || new Date().toISOString().split('T')[0], n.message, n.type || 'INFO', n.read ? 1 : 0],
        function(err) {
            if (err && !remoteSuccess) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: "Notification created successfully", localId: this.lastID, remoteSynced: remoteSuccess });
        }
    );
});

// Clear all notifications
app.post('/api/notifications/clear', async (req, res) => {
    let remoteSuccess = false;
    if (supabase) {
        console.log('Clearing all notifications on Supabase...');
        const { error } = await supabase.from('notifications').delete().neq('id', 0);
        if (!error) remoteSuccess = true;
    }

    localDb.run("DELETE FROM notifications", [], function(err) {
        if (err && !remoteSuccess) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "All notifications cleared", remoteSynced: remoteSuccess });
    });
});

// --- Authentication Routes (Supabase Auth & Local Triage Fallback) ---

// Register Endpoint
app.post('/api/auth/register', async (req, res) => {
    const { email, password, name, specialty } = req.body;
    if (!email || !password || !name) {
        res.status(400).json({ error: "Email, password, and name are required." });
        return;
    }

    if (supabase) {
        console.log(`Registering user ${email} on Supabase...`);
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    display_name: name,
                    specialty: specialty || 'Clinical Periodontist'
                }
            }
        });

        if (!error && data && data.user) {
            console.log(`Successfully registered user ${email} on Supabase.`);
            res.json({
                message: "Registration successful!",
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.user_metadata.display_name,
                    specialty: data.user.user_metadata.specialty
                }
            });
            return;
        }
        console.warn(`Supabase registration failed: ${error ? error.message : 'No user data'}. Trying offline fallback...`);
    }

    // Local Fallback (for demo/triage)
    console.log(`Performing local register fallback for user ${email}...`);
    res.json({
        message: "Registration successful! (Offline Fallback mode)",
        user: {
            id: `usr-${Math.floor(1000 + Math.random() * 9000)}`,
            email: email,
            name: name,
            specialty: specialty || 'Clinical Periodontist'
        }
    });
});

// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: "Email and password are required." });
        return;
    }

    if (supabase) {
        console.log(`Authenticating user ${email} on Supabase...`);
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (!error && data && data.user && data.session) {
            console.log(`Successfully logged in user ${email} via Supabase.`);
            res.json({
                message: "Login successful!",
                token: data.session.access_token,
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.user_metadata.display_name || 'Dr. Shahid',
                    specialty: data.user.user_metadata.specialty || 'Clinical Periodontist'
                }
            });
            return;
        }
        console.warn(`Supabase login failed: ${error ? error.message : 'Invalid session'}. Checking offline login...`);
    }

    // Local Fallback Login (accepts any credentials for ease of testing/demo)
    console.log(`Performing local login fallback for user ${email}...`);
    res.json({
        message: "Login successful! (Offline Fallback mode)",
        token: `mock-token-${Math.floor(100000 + Math.random() * 900000)}`,
        user: {
            id: 'mock-user-123',
            email: email,
            name: email.split('@')[0].toUpperCase(),
            specialty: 'Clinical Specialist'
        }
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`FurcaRiskAI backend server running on port ${PORT}`);
});
