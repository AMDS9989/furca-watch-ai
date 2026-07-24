-- =============================================================================
-- FurcaRiskAI – Supabase Database Schema Setup Script
-- Paste this script into your Supabase Dashboard -> SQL Editor and click RUN
-- =============================================================================

-- 1. Create Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT DEFAULT 'Other',
    phone_number TEXT,
    smoking BOOLEAN DEFAULT false,
    diabetes BOOLEAN DEFAULT false,
    pocket_depth NUMERIC DEFAULT 0,
    clinical_attachment_loss NUMERIC DEFAULT 0,
    plaque_index NUMERIC DEFAULT 0,
    bleeding BOOLEAN DEFAULT false,
    mobility INTEGER DEFAULT 0,
    tooth_number TEXT,
    risk_score NUMERIC DEFAULT 0,
    treatment TEXT,
    doctor_name TEXT,
    date DATE DEFAULT CURRENT_DATE,
    timeline JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'Scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'INFO',
    read BOOLEAN DEFAULT false,
    date TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Clinicians / Auth Profiles Table
CREATE TABLE IF NOT EXISTS public.clinicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    specialty TEXT DEFAULT 'Periodontist',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Set Permissive Policies for Web & App Access
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write on patients" ON public.patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on clinicians" ON public.clinicians FOR ALL USING (true) WITH CHECK (true);

-- 5. Seed Initial Mock Data
INSERT INTO public.patients (id, name, age, gender, phone_number, smoking, diabetes, pocket_depth, clinical_attachment_loss, plaque_index, bleeding, mobility, tooth_number, risk_score, treatment, doctor_name)
VALUES
  ('FR-10024', 'Sarah Jenkins', 45, 'Female', '+1 555-0192', true, false, 7, 5, 2, true, 2, 'Tooth #19 (Mandibular First Molar)', 82, 'Surgical Crown Lengthening + Regenerative Therapy', 'Dr. Test'),
  ('FR-10025', 'Robert Chen', 58, 'Male', '+1 555-0148', false, true, 5, 3, 1, false, 1, 'Tooth #30 (Mandibular First Molar)', 58, 'Scaling and Root Planing (SRP) + Antimicrobial Irrigation', 'Dr. Test'),
  ('FR-10026', 'Maria Rodriguez', 34, 'Female', '+1 555-0177', false, false, 3, 1, 0, false, 0, 'Tooth #14 (Maxillary First Molar)', 22, 'Routine Supportive Periodontal Therapy (SPT)', 'Dr. Test')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.appointments (patient_id, patient_name, date, time, reason)
VALUES
  ('FR-10024', 'Sarah Jenkins', CURRENT_DATE + INTERVAL '1 day', '09:30 AM', 'Furcation Re-evaluation & Probe Depth Check'),
  ('FR-10025', 'Robert Chen', CURRENT_DATE + INTERVAL '2 days', '11:00 AM', 'Scaling and Root Planing (SRP) Session 2')
ON CONFLICT DO NOTHING;

INSERT INTO public.notifications (title, message, type)
VALUES
  ('Critical Furcation Risk Alert', 'Patient Sarah Jenkins (FR-10024) score exceeded 80% risk threshold.', 'CRITICAL'),
  ('Appointment Scheduled', 'Robert Chen scheduled SRP for tomorrow 11:00 AM.', 'INFO')
ON CONFLICT DO NOTHING;
