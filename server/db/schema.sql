-- =============================================================================
-- CLINIKS: University Clinic Management & Clinical Triage Database Schema
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('STUDENT', 'CLINICIAN', 'ADMIN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Student Clinic Profile
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    matric_no VARCHAR(50) UNIQUE NOT NULL,
    jaja_no VARCHAR(50) UNIQUE NOT NULL,
    faculty VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    level VARCHAR(20) DEFAULT '100L',
    blood_group VARCHAR(5) DEFAULT 'O+',
    genotype VARCHAR(5) DEFAULT 'AA',
    emergency_contact VARCHAR(100),
    allergies TEXT[] DEFAULT '{}',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Pre-Consultation Appointments & Triage Engine
CREATE TABLE IF NOT EXISTS triage_cases (
    id VARCHAR(50) PRIMARY KEY, -- e.g. TRG-9021
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    matric_no VARCHAR(50) NOT NULL,
    jaja_no VARCHAR(50) NOT NULL,
    faculty VARCHAR(100),
    department VARCHAR(100),
    visit_category VARCHAR(100) NOT NULL,
    preferred_date DATE NOT NULL,
    complaint TEXT NOT NULL,
    pain_scale INT CHECK (pain_scale BETWEEN 1 AND 10),
    duration VARCHAR(50),
    clinical_answers JSONB DEFAULT '[]'::jsonb,
    
    -- Real LLM Evaluation Output
    llm_priority VARCHAR(50) CHECK (llm_priority IN ('HIGH', 'MODERATE', 'ROUTINE')),
    llm_urgency_score INT CHECK (llm_urgency_score BETWEEN 1 AND 100),
    llm_patient_brief TEXT,
    llm_safety_warnings TEXT[] DEFAULT '{}',
    suggested_room VARCHAR(100),
    recommended_session VARCHAR(100),
    
    -- Clinician Approval Workflow
    status VARCHAR(50) DEFAULT 'PENDING_APPROVAL' CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'OVERRIDDEN', 'COMPLETED')),
    assigned_room VARCHAR(100),
    assigned_session VARCHAR(100),
    clinician_notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Immutable Health Record Ledger (Tamper-Evident)
CREATE TABLE IF NOT EXISTS immutable_records (
    id VARCHAR(50) PRIMARY KEY, -- e.g. REC-2026-081
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    consultant_name VARCHAR(255) NOT NULL,
    facility VARCHAR(255) NOT NULL,
    chief_complaint TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    vitals JSONB NOT NULL, -- { bp, pulse, temp, weight }
    prescriptions JSONB NOT NULL, -- [{ name, dosage, duration }]
    clinical_notes TEXT,
    is_locked BOOLEAN DEFAULT TRUE,
    record_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of vitals + diagnosis + timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Consultant-to-Student Messaging & Notifications
CREATE TABLE IF NOT EXISTS consultant_messages (
    id VARCHAR(50) PRIMARY KEY, -- e.g. MSG-7429
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    sender_name VARCHAR(255) NOT NULL,
    sender_role VARCHAR(100) NOT NULL,
    sender_avatar TEXT,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    tag VARCHAR(50) DEFAULT 'Clinical Advisory',
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    unread BOOLEAN DEFAULT TRUE,
    related_report_id VARCHAR(50) REFERENCES immutable_records(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_triage_status ON triage_cases(status);
CREATE INDEX IF NOT EXISTS idx_triage_student ON triage_cases(student_id);
CREATE INDEX IF NOT EXISTS idx_records_student ON immutable_records(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_student ON consultant_messages(student_id);
