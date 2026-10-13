import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import crypto from 'node:crypto';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_PATIENTS,
  CURRENT_DOCTOR,
  INITIAL_INTERVIEW_RAHUL,
  INITIAL_DOCUMENTS_RAHUL,
  INITIAL_FACTS_RAHUL,
  INITIAL_RED_FLAGS_RAHUL,
  INITIAL_MISSING_INFO_RAHUL,
  INITIAL_CONTRADICTIONS_RAHUL,
  INITIAL_DOCTOR_BRIEF_RAHUL,
  INITIAL_PRESCRIPTION_RAHUL,
  INITIAL_AUDIT_LOGS,
  INITIAL_TIMELINE_RAHUL,
} from './src/data/mockData.ts';
import {
  Patient,
  InterviewSession,
  MedicalDocument,
  MedicalFact,
  RedFlag,
  MissingInformation,
  MedicalContradiction,
  DoctorBrief,
  EPrescription,
  AuditLogEntry,
  TimelineEvent,
  User,
} from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Stored User Interface
export interface StoredUser {
  id: string;
  name: string;
  email: string; // stored lowercase
  phone?: string;
  role: 'PATIENT' | 'DOCTOR';
  isDoctorApproved: boolean;
  approvalStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
  doctorLicense?: string;
  doctorSpecialty?: string;
  hospitalAffiliation?: string;
  avatarUrl?: string;
  age?: number;
  gender?: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
}

// Password hashing & verification
function hashPassword(password: string, saltInput?: string): { salt: string; hash: string } {
  const salt = saltInput || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password: string, salt: string, hash: string): boolean {
  try {
    const computed = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
  } catch {
    return false;
  }
}

function toSafeUser(user: StoredUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    doctorLicense: user.doctorLicense,
    doctorSpecialty: user.doctorSpecialty,
    hospitalAffiliation: user.hospitalAffiliation,
    isDoctorApproved: user.isDoctorApproved,
    approvalStatus: user.approvalStatus,
    phone: user.phone,
  };
}

// In-Memory User and Session Database
const usersByEmail = new Map<string, StoredUser>();
const usersById = new Map<string, StoredUser>();

// Pre-seeded patient user (Patient@123)
const seedPatientPass = hashPassword('Patient@123');
const SEED_PATIENT: StoredUser = {
  id: 'pat-user-01',
  name: 'Patient User',
  email: 'patient@medikiosk.health',
  phone: '+1 555-0199',
  role: 'PATIENT',
  isDoctorApproved: false,
  approvalStatus: 'APPROVED',
  age: 34,
  gender: 'Male',
  salt: seedPatientPass.salt,
  passwordHash: seedPatientPass.hash,
  createdAt: new Date().toISOString(),
};
usersByEmail.set(SEED_PATIENT.email.toLowerCase(), SEED_PATIENT);
usersById.set(SEED_PATIENT.id, SEED_PATIENT);

// Pre-seeded verified doctor (Doctor@123)
const seedDoctorPass = hashPassword('Doctor@123');
const SEED_VERIFIED_DOCTOR: StoredUser = {
  id: 'doc-01',
  name: 'Dr. Eleanor Vance, MD',
  email: 'e.vance@medikiosk.health',
  phone: '+1 555-0144',
  role: 'DOCTOR',
  isDoctorApproved: true,
  approvalStatus: 'APPROVED',
  doctorLicense: 'GMC-UK-789421',
  doctorSpecialty: 'Internal Medicine & Cardiology',
  hospitalAffiliation: 'MediKiosk Clinical Outpatient Care',
  avatarUrl: '/src/assets/images/avatar_doctor_verma_1791477926306.jpg',
  salt: seedDoctorPass.salt,
  passwordHash: seedDoctorPass.hash,
  createdAt: new Date().toISOString(),
};
usersByEmail.set(SEED_VERIFIED_DOCTOR.email.toLowerCase(), SEED_VERIFIED_DOCTOR);
usersById.set(SEED_VERIFIED_DOCTOR.id, SEED_VERIFIED_DOCTOR);

// Pre-seeded unverified doctor (Doctor@123)
const SEED_UNVERIFIED_DOCTOR: StoredUser = {
  id: 'doc-pending-02',
  name: 'Dr. Julian Hayes, MD',
  email: 'j.hayes@medikiosk.health',
  phone: '+1 555-0188',
  role: 'DOCTOR',
  isDoctorApproved: false,
  approvalStatus: 'PENDING',
  doctorLicense: 'GMC-PENDING-8821',
  doctorSpecialty: 'Cardiology Fellow (Credentials Under Review)',
  hospitalAffiliation: 'General Hospital (Verification Pending)',
  avatarUrl: '/src/assets/images/avatar_doctor_verma_1791477926306.jpg',
  salt: seedDoctorPass.salt,
  passwordHash: seedDoctorPass.hash,
  createdAt: new Date().toISOString(),
};
usersByEmail.set(SEED_UNVERIFIED_DOCTOR.email.toLowerCase(), SEED_UNVERIFIED_DOCTOR);
usersById.set(SEED_UNVERIFIED_DOCTOR.id, SEED_UNVERIFIED_DOCTOR);

// Pending OTP Registration tickets
interface PendingRegistration {
  ticketId: string;
  role: 'PATIENT' | 'DOCTOR';
  fullName: string;
  email: string; // lowercase
  phone: string;
  age?: number;
  gender?: string;
  doctorLicense?: string;
  doctorSpecialty?: string;
  salt: string;
  passwordHash: string;
  otp: string; // 6-digit random
  deliveryMethod: 'email' | 'sms';
  createdAt: number;
  expiresAt: number;
  lastSentAt: number;
  attempts: number;
}
const pendingRegistrations = new Map<string, PendingRegistration>();

// Active Sessions
interface ActiveSession {
  sessionId: string;
  userId: string;
  role: 'PATIENT' | 'DOCTOR';
  createdAt: number;
  expiresAt: number;
}
const sessions = new Map<string, ActiveSession>();

// In-Memory Clinical Database
const db = {
  currentUser: toSafeUser(SEED_PATIENT) as User,
  patients: [...INITIAL_PATIENTS] as Patient[],
  interviews: new Map<string, InterviewSession>([
    ['pat-1024', { ...INITIAL_INTERVIEW_RAHUL }],
  ]),
  documents: new Map<string, MedicalDocument[]>([
    ['pat-1024', [...INITIAL_DOCUMENTS_RAHUL]],
  ]),
  facts: new Map<string, MedicalFact[]>([
    ['pat-1024', [...INITIAL_FACTS_RAHUL]],
  ]),
  redFlags: new Map<string, RedFlag[]>([
    ['pat-1024', [...INITIAL_RED_FLAGS_RAHUL]],
  ]),
  missingInfo: new Map<string, MissingInformation[]>([
    ['pat-1024', [...INITIAL_MISSING_INFO_RAHUL]],
  ]),
  contradictions: new Map<string, MedicalContradiction[]>([
    ['pat-1024', [...INITIAL_CONTRADICTIONS_RAHUL]],
  ]),
  briefs: new Map<string, DoctorBrief>([
    ['pat-1024', { ...INITIAL_DOCTOR_BRIEF_RAHUL }],
  ]),
  prescriptions: new Map<string, EPrescription>([
    ['pat-1024', { ...INITIAL_PRESCRIPTION_RAHUL }],
  ]),
  timelines: new Map<string, TimelineEvent[]>([
    ['pat-1024', [...INITIAL_TIMELINE_RAHUL]],
  ]),
  auditLogs: [...INITIAL_AUDIT_LOGS] as AuditLogEntry[],
};

// Initialize Gemini Client
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Gemini AI initialization notice:', err);
  }
}

// Audit Log Helper
function logAudit(
  actor: string,
  actorRole: 'PATIENT' | 'DOCTOR' | 'ADMIN',
  action: string,
  entityType: AuditLogEntry['entityType'],
  entityId: string,
  details: string,
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL' = 'SUCCESS'
) {
  const newLog: AuditLogEntry = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    actor,
    actorRole,
    action,
    entityType,
    entityId,
    details,
    status,
  };
  db.auditLogs.unshift(newLog);
  return newLog;
}

function resetDatabaseToDemo() {
  db.currentUser = toSafeUser(SEED_PATIENT);
  db.patients = JSON.parse(JSON.stringify(INITIAL_PATIENTS));
  db.interviews = new Map<string, InterviewSession>([
    ['pat-1024', JSON.parse(JSON.stringify(INITIAL_INTERVIEW_RAHUL))],
  ]);
  db.documents = new Map<string, MedicalDocument[]>([
    ['pat-1024', JSON.parse(JSON.stringify(INITIAL_DOCUMENTS_RAHUL))],
  ]);
  db.facts = new Map<string, MedicalFact[]>([
    ['pat-1024', JSON.parse(JSON.stringify(INITIAL_FACTS_RAHUL))],
  ]);
  db.redFlags = new Map<string, RedFlag[]>([
    ['pat-1024', JSON.parse(JSON.stringify(INITIAL_RED_FLAGS_RAHUL))],
  ]);
  db.missingInfo = new Map<string, MissingInformation[]>([
    ['pat-1024', JSON.parse(JSON.stringify(INITIAL_MISSING_INFO_RAHUL))],
  ]);
  db.contradictions = new Map<string, MedicalContradiction[]>([
    ['pat-1024', JSON.parse(JSON.stringify(INITIAL_CONTRADICTIONS_RAHUL))],
  ]);
  db.briefs = new Map<string, DoctorBrief>([
    ['pat-1024', JSON.parse(JSON.stringify(INITIAL_DOCTOR_BRIEF_RAHUL))],
  ]);
  db.prescriptions = new Map<string, EPrescription>([
    ['pat-1024', JSON.parse(JSON.stringify(INITIAL_PRESCRIPTION_RAHUL))],
  ]);
  db.timelines = new Map<string, TimelineEvent[]>([
    ['pat-1024', JSON.parse(JSON.stringify(INITIAL_TIMELINE_RAHUL))],
  ]);
  db.auditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
}

// -----------------------------------------------------------------------------
// API ROUTES
// -----------------------------------------------------------------------------

// Reset Demo Scenario to pristine initial state
app.post('/api/demo/reset', (req, res) => {
  resetDatabaseToDemo();
  logAudit(
    'MediKiosk System Controller',
    'PATIENT',
    'Demo Scenario Restored / Refreshed',
    'PATIENT',
    'MK1024',
    'Restored initial clinical triage state for patient records.'
  );
  res.json({
    success: true,
    message: 'Demo scenario successfully refreshed to initial state',
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    time: new Date().toISOString(),
    geminiActive: !!process.env.GEMINI_API_KEY,
    totalPatients: db.patients.length,
  });
});

// Session Resolution Middleware
app.use((req, res, next) => {
  const token =
    (req.cookies && req.cookies.medikiosk_session) ||
    (req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ') &&
      req.headers.authorization.slice(7));

  if (token && sessions.has(token)) {
    const session = sessions.get(token)!;
    if (session.expiresAt > Date.now()) {
      const user = usersById.get(session.userId);
      if (user) {
        (req as any).user = user;
        db.currentUser = toSafeUser(user);
      }
    } else {
      sessions.delete(token);
    }
  }
  next();
});

// Authorization Middleware: Doctor Role & Verification Check
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({
      error: 'Authentication required. Please log in to access this resource.',
      code: 'UNAUTHORIZED',
    });
  }
  next();
}

function requireVerifiedDoctor(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== 'DOCTOR') {
    return res.status(403).json({
      error: 'Access denied: Doctor role required.',
      code: 'FORBIDDEN_DOCTOR_ROLE_REQUIRED',
    });
  }
  if (!user.isDoctorApproved) {
    return res.status(403).json({
      error: 'Your doctor account is awaiting verification. Doctor Dashboard access will be available after approval.',
      code: 'DOCTOR_VERIFICATION_PENDING',
    });
  }
  next();
}

// -----------------------------------------------------------------------------
// AUTHENTICATION API ROUTES
// -----------------------------------------------------------------------------

// Check Email Uniqueness (Case-Insensitive)
app.post('/api/auth/check-email', (req, res) => {
  const email = (req.body.email || '').toLowerCase().trim();
  if (!email) return res.json({ exists: false });
  if (usersByEmail.has(email)) {
    return res.json({
      exists: true,
      message: 'Account already found. Please log in instead.',
    });
  }
  return res.json({ exists: false });
});

// Sign Up: Patient or Doctor
app.post('/api/auth/signup', (req, res) => {
  const {
    role,
    fullName,
    email,
    phone,
    password,
    confirmPassword,
    age,
    gender,
    doctorLicense,
    doctorSpecialty,
    deliveryMethod,
  } = req.body;

  if (!role || !['PATIENT', 'DOCTOR'].includes(role)) {
    return res.status(400).json({ error: 'Valid role (PATIENT or DOCTOR) is required.' });
  }

  if (!fullName || !email || !phone || !password) {
    return res.status(400).json({ error: 'Full name, email, mobile number, and password are required.' });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  if (role === 'DOCTOR') {
    if (!doctorLicense || !doctorLicense.trim()) {
      return res.status(400).json({ error: 'Medical Registration Number is required for doctor accounts.' });
    }
    if (!doctorSpecialty || !doctorSpecialty.trim()) {
      return res.status(400).json({ error: 'Medical Specialization is required for doctor accounts.' });
    }
  }

  // Case-insensitive email uniqueness check
  const normEmail = email.toLowerCase().trim();
  if (usersByEmail.has(normEmail)) {
    return res.status(409).json({
      error: 'Account already found. Please log in instead.',
      code: 'ACCOUNT_ALREADY_EXISTS',
    });
  }

  // Generate 6-digit random OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const ticketId = `ticket-${crypto.randomUUID()}`;
  const { salt, hash } = hashPassword(password);
  const now = Date.now();

  const registration: PendingRegistration = {
    ticketId,
    role,
    fullName: fullName.trim(),
    email: normEmail,
    phone: phone.trim(),
    age: age ? parseInt(age, 10) : undefined,
    gender,
    doctorLicense: doctorLicense?.trim(),
    doctorSpecialty: doctorSpecialty?.trim(),
    salt,
    passwordHash: hash,
    otp,
    deliveryMethod: deliveryMethod === 'sms' ? 'sms' : 'email',
    createdAt: now,
    expiresAt: now + 5 * 60 * 1000,
    lastSentAt: now,
    attempts: 0,
  };

  pendingRegistrations.set(ticketId, registration);

  logAudit(
    fullName,
    role,
    'Account Registration Initiated - OTP Generated',
    'PATIENT',
    ticketId,
    `Generated ${registration.deliveryMethod} OTP verification ticket for ${normEmail}.`
  );

  res.json({
    success: true,
    ticketId,
    demoOtp: otp,
    expiresAt: registration.expiresAt,
    deliveryMethod: registration.deliveryMethod,
    message: 'Registration initiated. Please verify with the demo OTP provided.',
  });
});

// Verify OTP & Activate Account
app.post('/api/auth/verify-otp', (req, res) => {
  const { ticketId, otp } = req.body;
  if (!ticketId || !otp) {
    return res.status(400).json({ error: 'Registration ticket ID and OTP code are required.' });
  }

  const ticket = pendingRegistrations.get(ticketId);
  if (!ticket) {
    return res.status(404).json({ error: 'Verification session expired or not found. Please sign up again.' });
  }

  if (Date.now() > ticket.expiresAt) {
    pendingRegistrations.delete(ticketId);
    return res.status(400).json({ error: 'OTP has expired. Please request a new OTP.' });
  }

  ticket.attempts += 1;
  if (ticket.attempts > 5) {
    pendingRegistrations.delete(ticketId);
    return res.status(429).json({ error: 'Too many failed verification attempts. Please sign up again.' });
  }

  if (ticket.otp !== otp.trim()) {
    const remaining = 5 - ticket.attempts;
    return res.status(400).json({
      error: `Incorrect OTP code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      attemptsRemaining: remaining,
    });
  }

  if (usersByEmail.has(ticket.email)) {
    pendingRegistrations.delete(ticketId);
    return res.status(409).json({ error: 'Account already found. Please log in instead.' });
  }

  const userId = ticket.role === 'DOCTOR' ? `doc-${Date.now()}` : `pat-user-${Date.now()}`;
  const isDoctor = ticket.role === 'DOCTOR';

  const newUser: StoredUser = {
    id: userId,
    name: ticket.fullName,
    email: ticket.email,
    phone: ticket.phone,
    role: ticket.role,
    isDoctorApproved: isDoctor ? false : false,
    approvalStatus: isDoctor ? 'PENDING' : 'APPROVED',
    doctorLicense: ticket.doctorLicense,
    doctorSpecialty: ticket.doctorSpecialty,
    hospitalAffiliation: isDoctor ? 'Medical Council (Verification Pending)' : undefined,
    avatarUrl: isDoctor ? '/src/assets/images/avatar_doctor_verma_1791477926306.jpg' : undefined,
    age: ticket.age,
    gender: ticket.gender,
    salt: ticket.salt,
    passwordHash: ticket.passwordHash,
    createdAt: new Date().toISOString(),
  };

  usersByEmail.set(ticket.email, newUser);
  usersById.set(userId, newUser);

  if (ticket.role === 'PATIENT') {
    const patientIdCode = `MK${Math.floor(1000 + Math.random() * 9000)}`;
    const patRecord: Patient = {
      id: userId,
      patientId: patientIdCode,
      fullName: ticket.fullName,
      age: ticket.age || 32,
      gender: (ticket.gender as any) || 'Male',
      dob: '1994-06-20',
      phone: ticket.phone,
      email: ticket.email,
      emergencyContact: { name: 'Emergency Contact', relationship: 'Family', phone: ticket.phone },
      existingConditions: [],
      knownAllergies: [],
      currentMedicines: [],
      consentGiven: true,
      priority: 'GREEN',
      status: 'Waiting',
      registeredAt: 'Just now',
    };
    db.patients.unshift(patRecord);
  }

  const sessionId = crypto.randomUUID();
  const sessionExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
  sessions.set(sessionId, {
    sessionId,
    userId,
    role: ticket.role,
    createdAt: Date.now(),
    expiresAt: sessionExpiry,
  });

  res.cookie('medikiosk_session', sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  pendingRegistrations.delete(ticketId);

  logAudit(
    newUser.name,
    newUser.role,
    'Account Verified & Activated',
    'PATIENT',
    userId,
    `OTP verified successfully. User registered as ${newUser.role} (${newUser.approvalStatus}).`
  );

  res.json({
    success: true,
    user: toSafeUser(newUser),
    message: isDoctor
      ? 'Doctor account created and pending verification.'
      : 'Patient account verified successfully.',
  });
});

// Resend OTP with 30s Cooldown
app.post('/api/auth/resend-otp', (req, res) => {
  const { ticketId, deliveryMethod } = req.body;
  const ticket = pendingRegistrations.get(ticketId);
  if (!ticket) {
    return res.status(404).json({ error: 'Registration request not found. Please sign up again.' });
  }

  const now = Date.now();
  const elapsedSec = (now - ticket.lastSentAt) / 1000;
  if (elapsedSec < 30) {
    return res.status(429).json({
      error: 'Please wait before requesting another OTP.',
      cooldownSeconds: Math.ceil(30 - elapsedSec),
    });
  }

  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
  ticket.otp = newOtp;
  ticket.attempts = 0;
  ticket.lastSentAt = now;
  ticket.expiresAt = now + 5 * 60 * 1000;
  if (deliveryMethod) ticket.deliveryMethod = deliveryMethod === 'sms' ? 'sms' : 'email';

  res.json({
    success: true,
    ticketId,
    demoOtp: newOtp,
    expiresAt: ticket.expiresAt,
    cooldownSeconds: 30,
    message: 'A fresh OTP has been generated.',
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password, accountType } = req.body;
  let user: StoredUser | undefined;

  if (accountType) {
    if (accountType === 'patient') user = usersByEmail.get('patient@medikiosk.health');
    else if (accountType === 'doctor_verified') user = usersByEmail.get('e.vance@medikiosk.health');
    else if (accountType === 'doctor_unverified') user = usersByEmail.get('j.hayes@medikiosk.health');
  } else {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email address and password are required.' });
    }
    const normEmail = email.toLowerCase().trim();
    const candidate = usersByEmail.get(normEmail);
    if (!candidate || !verifyPassword(password, candidate.salt, candidate.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }
    user = candidate;
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. User not found.' });
  }

  const sessionId = crypto.randomUUID();
  const sessionExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
  sessions.set(sessionId, {
    sessionId,
    userId: user.id,
    role: user.role,
    createdAt: Date.now(),
    expiresAt: sessionExpiry,
  });

  res.cookie('medikiosk_session', sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  db.currentUser = toSafeUser(user);

  logAudit(
    user.name,
    user.role,
    `User Logged In (${user.role})`,
    'PATIENT',
    user.id,
    `Session established for ${user.name}. Approval: ${user.isDoctorApproved}.`
  );

  res.json({ success: true, user: toSafeUser(user) });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const token =
    (req.cookies && req.cookies.medikiosk_session) ||
    (req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ') &&
      req.headers.authorization.slice(7));

  if (token) {
    sessions.delete(token);
  }

  res.clearCookie('medikiosk_session', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Current User Session
app.get('/api/auth/current-user', (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ user: null });
  }

  const verifiedDoctor = usersByEmail.get('e.vance@medikiosk.health');
  res.json({
    user: toSafeUser(user),
    doctorProfile:
      user.role === 'DOCTOR'
        ? toSafeUser(user)
        : verifiedDoctor
        ? toSafeUser(verifiedDoctor)
        : toSafeUser(user),
  });
});

// Administrator Approval for Doctor Accounts
app.post('/api/auth/admin/approve-doctor', (req, res) => {
  const { doctorId } = req.body;
  let user: StoredUser | undefined;

  if (doctorId) {
    user = usersById.get(doctorId);
  }
  if (!user) {
    user = usersByEmail.get('j.hayes@medikiosk.health');
  }

  if (!user || user.role !== 'DOCTOR') {
    return res.status(404).json({ error: 'Doctor account not found.' });
  }

  user.isDoctorApproved = true;
  user.approvalStatus = 'APPROVED';

  logAudit(
    'Hospital Administrator',
    'ADMIN',
    'Doctor Verification Approved',
    'DOCTOR_REVIEW',
    user.id,
    `Administrative board confirmed medical credentials for ${user.name} (${user.doctorLicense}).`
  );

  res.json({ success: true, user: toSafeUser(user) });
});

// Patients API
app.get('/api/patients', (req, res) => {
  res.json(db.patients);
});

app.get('/api/patients/:id', (req, res) => {
  const patient = db.patients.find((p) => p.id === req.params.id || p.patientId === req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  res.json(patient);
});

app.post('/api/patients/register', (req, res) => {
  const data = req.body;
  if (!data.fullName || !data.age || !data.phone) {
    return res.status(400).json({ error: 'Full name, age, and phone number are required.' });
  }

  const newId = `pat-${1020 + db.patients.length + 1}`;
  const newPatientId = `MK${1020 + db.patients.length + 1}`;

  const newPatient: Patient = {
    id: newId,
    patientId: newPatientId,
    fullName: data.fullName,
    age: parseInt(data.age, 10),
    gender: data.gender || 'Other',
    dob: data.dob || '1990-01-01',
    phone: data.phone,
    email: data.email || `${data.fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    emergencyContact: data.emergencyContact || {
      name: 'Primary Contact',
      relationship: 'Family',
      phone: data.phone,
    },
    existingConditions: data.existingConditions || [],
    knownAllergies: data.knownAllergies || ['None declared'],
    currentMedicines: data.currentMedicines || [],
    consentGiven: !!data.consentGiven,
    consentTimestamp: new Date().toISOString(),
    priority: 'GREEN',
    status: 'Waiting',
    registeredAt: new Date().toISOString(),
    waitingTimeMinutes: 0,
  };

  db.patients.push(newPatient);

  // Initialize empty state for this patient
  db.interviews.set(newId, {
    id: `int-${newPatientId}`,
    patientId: newId,
    startedAt: new Date().toISOString(),
    status: 'in_progress',
    chiefComplaint: '',
    duration: '',
    severity: 'Mild',
    symptoms: [],
    associatedSymptoms: [],
    progressPercent: 10,
    messages: [
      {
        id: `m-init-${Date.now()}`,
        sender: 'ai',
        text: `Welcome ${newPatient.fullName}. I am your MediKiosk AI Clinical Triage Assistant. Please describe what chief symptoms or discomfort you are experiencing today.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedReplies: ['Fever and headache', 'Persistent cough', 'Stomach ache', 'Routine check-up'],
      },
    ],
  });

  db.documents.set(newId, []);
  db.facts.set(newId, []);
  db.redFlags.set(newId, []);
  db.missingInfo.set(newId, []);
  db.contradictions.set(newId, []);
  db.timelines.set(newId, [
    {
      id: `tl-reg-${Date.now()}`,
      date: 'Today',
      title: 'MediKiosk Intake Registration',
      category: 'Clinical Interview',
      description: 'Patient checked in at MediKiosk and granted medical triage consent.',
    },
  ]);

  logAudit(
    newPatient.fullName,
    'PATIENT',
    'Patient Registration & Consent',
    'PATIENT',
    newPatientId,
    `Registered new patient with informed consent granted.`
  );

  res.status(201).json(newPatient);
});

// Interview API
app.get('/api/interview/:patientId', (req, res) => {
  const session = db.interviews.get(req.params.patientId);
  if (!session) {
    return res.status(404).json({ error: 'Interview session not found' });
  }
  res.json(session);
});

app.post('/api/interview/:patientId/message', async (req, res) => {
  const { patientId } = req.params;
  const { text, isVoice } = req.body;

  const session = db.interviews.get(patientId);
  const patient = db.patients.find((p) => p.id === patientId);

  if (!session || !patient) {
    return res.status(404).json({ error: 'Session or patient not found' });
  }

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  // 1. Add patient message
  const patientMsg: any = {
    id: `m-pat-${Date.now()}`,
    sender: 'patient',
    text: text.trim(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isVoice: !!isVoice,
  };
  session.messages.push(patientMsg);

  // 2. Generate Adaptive AI follow-up response
  let aiReplyText = '';
  let suggestedReplies: string[] = [];
  let updatedSymptoms: string[] = [...session.symptoms];

  if (session.messages.length === 2) {
    session.chiefComplaint = text.trim();
  }

  // If Gemini API is available, invoke Gemini-3.8-flash for adaptive clinical inquiry
  let usedGemini = false;
  if (aiClient && process.env.GEMINI_API_KEY) {
    try {
      const historyPrompt = session.messages
        .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
        .join('\n');

      const systemPrompt = `You are the MediKiosk AI Clinical Pre-Consultation Assistant for an outpatient healthcare kiosk.
CRITICAL MEDICAL SAFETY:
- You NEVER diagnose or prescribe.
- You prepare structured clinical information for the supervising doctor.
- You conduct an adaptive clinical interview: ask ONE focused, empathetic follow-up question based on the patient's symptoms, duration, severity, medications, or allergies.
- Patient Name: ${patient.fullName}, Age: ${patient.age}, Gender: ${patient.gender}.
- Respond strictly in JSON format with two keys:
  "reply": (string, your next single concise question to the patient, under 40 words),
  "suggestedReplies": (array of 2-3 short strings with realistic patient replies),
  "extractedSymptom": (optional string symptom detected from latest answer)`;

      const geminiResponse = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Previous conversation:\n${historyPrompt}\n\nRespond with the next question in JSON.`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        },
      });

      if (geminiResponse.text) {
        const parsed = JSON.parse(geminiResponse.text);
        if (parsed.reply) {
          aiReplyText = parsed.reply;
          suggestedReplies = parsed.suggestedReplies || [];
          if (parsed.extractedSymptom) {
            updatedSymptoms.push(parsed.extractedSymptom);
          }
          usedGemini = true;
        }
      }
    } catch (aiErr) {
      console.warn('Gemini call fallback triggered:', aiErr);
    }
  }

  // Adaptive Rule-based clinical fallback if AI API is unconfigured or failed
  if (!usedGemini) {
    const turnCount = session.messages.filter((m) => m.sender === 'patient').length;
    const lowerText = text.toLowerCase();

    if (turnCount === 1) {
      aiReplyText = 'How many days or hours have you been experiencing this, and is the discomfort constant or intermittent?';
      suggestedReplies = ['Started 3 days ago', 'Since this morning', 'Comes and goes'];
      if (!session.chiefComplaint) session.chiefComplaint = text;
    } else if (turnCount === 2) {
      session.duration = text;
      aiReplyText = 'On a scale from mild to severe, how intense is it? Are you noticing any breathing difficulty or chills?';
      suggestedReplies = ['Mild discomfort', 'Moderate with chills', 'Severe pain'];
    } else if (turnCount === 3) {
      if (lowerText.includes('severe')) session.severity = 'Severe';
      else if (lowerText.includes('mild')) session.severity = 'Mild';
      else session.severity = 'Moderate';

      aiReplyText = 'Have you taken any home remedies, paracetamol, or current medications for this?';
      suggestedReplies = ['Took Paracetamol 650mg', 'No medicine taken', 'Using regular inhaler'];
    } else if (turnCount === 4) {
      aiReplyText = 'Do you have any known drug allergies, such as Penicillin, Sulfa, or aspirin?';
      suggestedReplies = ['No known allergies', 'Allergic to Penicillin', 'Allergic to Sulfa'];
    } else {
      aiReplyText = 'Thank you for sharing this clinical detail. Your pre-consultation intake is now compiled and ready for doctor review. You can also upload any previous medical reports.';
      suggestedReplies = ['Upload past prescription', 'View my summary', 'Proceed to queue'];
      session.status = 'completed';
      session.progressPercent = 100;
    }
  }

  const aiMsg: any = {
    id: `m-ai-${Date.now()}`,
    sender: 'ai',
    text: aiReplyText,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestedReplies,
  };
  session.messages.push(aiMsg);

  // Update progress
  const patientTurns = session.messages.filter((m) => m.sender === 'patient').length;
  session.progressPercent = Math.min(100, Math.round(patientTurns * 20));
  if (session.progressPercent >= 100) {
    session.status = 'completed';
    session.completedAt = new Date().toISOString();
  }

  // Update Patient Priority if red flags detected in text
  if (
    text.toLowerCase().includes('chest pain') ||
    text.toLowerCase().includes('difficulty breathing') ||
    text.toLowerCase().includes('fainting')
  ) {
    patient.priority = 'RED';
  }

  logAudit(
    patient.fullName,
    'PATIENT',
    'Adaptive Interview Exchange',
    'AI_BRIEF',
    session.id,
    `Question responded; interview progress at ${session.progressPercent}%.`
  );

  res.json({
    session,
    aiMessage: aiMsg,
    usedGemini,
  });
});

// Documents & OCR API
app.get('/api/documents/:patientId', (req, res) => {
  const docs = db.documents.get(req.params.patientId) || [];
  res.json(docs);
});

app.post('/api/documents/:patientId/upload', async (req, res) => {
  const { patientId } = req.params;
  const { fileName, fileType, thumbnailUrl, rawText } = req.body;

  const docs = db.documents.get(patientId) || [];
  const patient = db.patients.find((p) => p.id === patientId);

  if (!fileName) {
    return res.status(400).json({ error: 'File name is required' });
  }

  const newDocId = `doc-${Date.now()}`;
  const newDoc: MedicalDocument = {
    id: newDocId,
    patientId,
    fileName,
    fileType: fileType || 'prescription',
    mimeType: fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
    fileSize: '1.9 MB',
    uploadedAt: new Date().toISOString(),
    thumbnailUrl: thumbnailUrl || '/src/assets/images/sample_prescription_doc_1791477939237.jpg',
    ocrStatus: 'completed',
    rawOcrText: rawText || `MEDICAL CLINIC RECORDS\nDate: ${new Date().toLocaleDateString()}\nPatient: ${patient?.fullName || 'Patient'}\nDx: Clinical Evaluation`,
    extractedEntities: {
      medicines: ['Paracetamol 500mg', 'Multivitamins'],
      conditions: ['Clinical Evaluation'],
      dates: [new Date().toLocaleDateString()],
    },
  };

  docs.unshift(newDoc);
  db.documents.set(patientId, docs);

  // Append timeline event
  const timeline = db.timelines.get(patientId) || [];
  timeline.unshift({
    id: `tl-${Date.now()}`,
    date: 'Today',
    title: `Uploaded Medical Record: ${fileName}`,
    category: fileType === 'lab_report' ? 'Lab Test' : 'Prescription',
    description: `OCR processed and indexed for doctor cross-referencing.`,
    sourceDocId: newDocId,
  });
  db.timelines.set(patientId, timeline);

  logAudit(
    patient?.fullName || 'Patient',
    'PATIENT',
    'Document Upload & OCR Processing',
    'OCR',
    newDocId,
    `Uploaded ${fileName} and extracted clinical entities.`
  );

  res.status(201).json(newDoc);
});

// Clinical Knowledge, Red Flags, Contradictions, 60s Doctor Brief
app.get('/api/clinical/:patientId', (req, res) => {
  const { patientId } = req.params;
  const patient = db.patients.find((p) => p.id === patientId || p.patientId === patientId);
  const pid = patient ? patient.id : patientId;

  res.json({
    facts: db.facts.get(pid) || [],
    redFlags: db.redFlags.get(pid) || [],
    missingInfo: db.missingInfo.get(pid) || [],
    contradictions: db.contradictions.get(pid) || [],
    brief: db.briefs.get(pid) || null,
    timeline: db.timelines.get(pid) || [],
  });
});

// Doctor Actions: Verify/Edit Fact
app.post('/api/doctor/facts/:factId/verify', requireVerifiedDoctor, (req, res) => {
  const { factId } = req.params;
  const { patientId, verified, doctorNotes } = req.body;

  const facts = db.facts.get(patientId);
  if (!facts) return res.status(404).json({ error: 'Patient facts not found' });

  const target = facts.find((f) => f.id === factId);
  if (!target) return res.status(404).json({ error: 'Fact not found' });

  target.verifiedByDoctor = verified !== undefined ? verified : true;
  if (doctorNotes !== undefined) target.doctorNotes = doctorNotes;

  logAudit(
    CURRENT_DOCTOR.name,
    'DOCTOR',
    'Doctor Medical Fact Verification',
    'DOCTOR_REVIEW',
    factId,
    `Fact [${target.fact.substring(0, 30)}...] status updated to verified=${target.verifiedByDoctor}.`
  );

  res.json({ success: true, fact: target });
});

// Doctor Actions: Resolve Contradiction
app.post('/api/doctor/contradictions/:contraId/resolve', requireVerifiedDoctor, (req, res) => {
  const { contraId } = req.params;
  const { patientId, doctorResolution } = req.body;

  const contras = db.contradictions.get(patientId);
  if (!contras) return res.status(404).json({ error: 'Contradictions not found' });

  const target = contras.find((c) => c.id === contraId);
  if (!target) return res.status(404).json({ error: 'Contradiction not found' });

  target.resolved = true;
  target.doctorResolution = doctorResolution || 'Clarified with patient: Confirmed drug allergy overrides verbal intake.';

  // Also update brief contradiction count
  const brief = db.briefs.get(patientId);
  if (brief) {
    brief.contradictionCount = Math.max(0, brief.contradictionCount - 1);
  }

  logAudit(
    CURRENT_DOCTOR.name,
    'DOCTOR',
    'Resolved Clinical Contradiction',
    'DOCTOR_REVIEW',
    contraId,
    `Resolved: ${target.doctorResolution}`
  );

  res.json({ success: true, contradiction: target });
});

// Doctor Actions: Acknowledge Red Flag
app.post('/api/doctor/redflags/:flagId/acknowledge', requireVerifiedDoctor, (req, res) => {
  const { flagId } = req.params;
  const { patientId } = req.body;

  const flags = db.redFlags.get(patientId);
  if (!flags) return res.status(404).json({ error: 'Red flags not found' });

  const target = flags.find((rf) => rf.id === flagId);
  if (!target) return res.status(404).json({ error: 'Red flag not found' });

  target.acknowledgedByDoctor = true;

  logAudit(
    CURRENT_DOCTOR.name,
    'DOCTOR',
    'Acknowledged Clinical Red Flag',
    'DOCTOR_REVIEW',
    flagId,
    `Doctor acknowledged: ${target.title}`
  );

  res.json({ success: true, redFlag: target });
});

// Doctor Actions: Review & Confirm Brief
app.post('/api/doctor/brief/:patientId/confirm', requireVerifiedDoctor, (req, res) => {
  const { patientId } = req.params;
  const { clinicalImpressionDraft, doctorNotes } = req.body;

  const brief = db.briefs.get(patientId);
  const patient = db.patients.find((p) => p.id === patientId);

  if (!brief || !patient) {
    return res.status(404).json({ error: 'Patient or brief not found' });
  }

  brief.doctorReviewed = true;
  brief.reviewedBy = CURRENT_DOCTOR.name;
  brief.reviewedAt = new Date().toISOString();
  if (clinicalImpressionDraft) brief.clinicalImpressionDraft = clinicalImpressionDraft;

  patient.status = 'In Consultation';

  logAudit(
    CURRENT_DOCTOR.name,
    'DOCTOR',
    'Doctor 60-Second Brief Confirmed',
    'DOCTOR_REVIEW',
    brief.id,
    `Physician verified all AI synthesized clinical facts and confirmed readiness for prescription.`
  );

  res.json({ success: true, brief });
});

// Prescriptions API
app.get('/api/prescriptions/:patientId', (req, res) => {
  const { patientId } = req.params;
  const rx = db.prescriptions.get(patientId);
  if (!rx) {
    // Generate draft template
    const patient = db.patients.find((p) => p.id === patientId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const newDraft: EPrescription = {
      id: `rx-${patient.id}`,
      prescriptionId: `MK-RX-2026-${patient.patientId}-EV`,
      patientId: patient.patientId,
      patientName: patient.fullName,
      patientAge: patient.age,
      patientGender: patient.gender,
      doctorId: CURRENT_DOCTOR.id,
      doctorName: CURRENT_DOCTOR.name,
      doctorLicense: CURRENT_DOCTOR.doctorLicense || 'GMC-734567',
      doctorSpecialty: CURRENT_DOCTOR.doctorSpecialty || 'Internal Medicine',
      clinicName: CURRENT_DOCTOR.hospitalAffiliation || 'MediKiosk Clinical Outpatient Care',
      issuedDate: new Date().toISOString().substring(0, 10),
      status: 'DRAFT',
      diagnosis: 'Clinical Consultation Required',
      medicines: [],
      generalInstructions: 'Follow physician advice. Rest and maintain fluid hydration.',
      doctorNotes: '',
      verificationHash: `v${Math.random().toString(36).substring(2, 15)}`,
      qrCodeDataUrl: '',
    };
    db.prescriptions.set(patientId, newDraft);
    return res.json(newDraft);
  }
  res.json(rx);
});

// Update Prescription Draft (Doctor only)
app.put('/api/prescriptions/:patientId', requireVerifiedDoctor, (req, res) => {
  const { patientId } = req.params;
  const data = req.body;

  let rx = db.prescriptions.get(patientId);
  if (!rx) return res.status(404).json({ error: 'Prescription not found' });

  // Update fields
  rx.diagnosis = data.diagnosis ?? rx.diagnosis;
  rx.medicines = data.medicines ?? rx.medicines;
  rx.generalInstructions = data.generalInstructions ?? rx.generalInstructions;
  rx.doctorNotes = data.doctorNotes ?? rx.doctorNotes;
  rx.dietAdvice = data.dietAdvice ?? rx.dietAdvice;
  rx.followUpDate = data.followUpDate ?? rx.followUpDate;

  res.json(rx);
});

// Authorize Prescription (Doctor Only with Digital Signature)
app.post('/api/prescriptions/:patientId/authorize', requireVerifiedDoctor, (req, res) => {
  const { patientId } = req.params;
  const { digitalSignaturePassword, doctorNotes } = req.body;

  const rx = db.prescriptions.get(patientId);
  const patient = db.patients.find((p) => p.id === patientId);

  if (!rx || !patient) {
    return res.status(404).json({ error: 'Prescription or patient not found' });
  }

  if (rx.medicines.length === 0) {
    return res.status(400).json({ error: 'Cannot authorize prescription without any prescribed medications.' });
  }

  // Authorize
  rx.status = 'AUTHORIZED';
  rx.authorizedAt = new Date().toISOString();
  rx.digitalSignature = `DIGITALLY_SIGNED_BY_${CURRENT_DOCTOR.name.toUpperCase().replace(/[^A-Z]/g, '_')}_${Date.now()}`;
  if (doctorNotes) rx.doctorNotes = doctorNotes;

  // Update patient status
  patient.status = 'Prescription Ready';

  // Add timeline entry
  const timeline = db.timelines.get(patientId) || [];
  timeline.unshift({
    id: `tl-rx-${Date.now()}`,
    date: 'Today',
    title: `E-Prescription Authorized: ${rx.prescriptionId}`,
    category: 'Treatment',
    description: `Prescribed ${rx.medicines.length} medications by ${CURRENT_DOCTOR.name}. Ready for pharmacy dispensing & QR verification.`,
  });
  db.timelines.set(patientId, timeline);

  logAudit(
    CURRENT_DOCTOR.name,
    'DOCTOR',
    'E-Prescription Digitally Authorized',
    'PRESCRIPTION',
    rx.prescriptionId,
    `Physician authorized official electronic prescription with ${rx.medicines.length} medicines.`
  );

  res.json({
    success: true,
    prescription: rx,
  });
});

// Public Verification API (Validates Prescription ID or QR payload)
app.get('/api/prescriptions/verify/:prescriptionId', (req, res) => {
  const targetId = req.params.prescriptionId.trim();

  let matchedRx: EPrescription | null = null;
  for (const rx of db.prescriptions.values()) {
    if (rx.prescriptionId.toLowerCase() === targetId.toLowerCase()) {
      matchedRx = rx;
      break;
    }
  }

  if (!matchedRx) {
    return res.status(404).json({
      valid: false,
      status: 'NOT_FOUND',
      message: 'No prescription found matching this verification identifier.',
    });
  }

  // Safety Boundary: Do not leak extensive sensitive medical notes on public verification page
  const verificationSummary = {
    valid: matchedRx.status === 'AUTHORIZED' || matchedRx.status === 'VERIFIED',
    status: matchedRx.status,
    prescriptionId: matchedRx.prescriptionId,
    issuedDate: matchedRx.issuedDate,
    authorizedAt: matchedRx.authorizedAt,
    patientNameInitials: matchedRx.patientName
      .split(' ')
      .map((n) => n[0] + '.')
      .join(' '),
    patientAge: matchedRx.patientAge,
    doctorName: matchedRx.doctorName,
    doctorLicense: matchedRx.doctorLicense,
    doctorSpecialty: matchedRx.doctorSpecialty,
    clinicName: matchedRx.clinicName,
    itemCount: matchedRx.medicines.length,
    verificationHash: matchedRx.verificationHash,
    digitalSignaturePresent: !!matchedRx.digitalSignature,
  };

  logAudit(
    'Verification Portal Client',
    'PATIENT',
    'Prescription QR / ID Verification Query',
    'VERIFICATION',
    matchedRx.prescriptionId,
    `Public verification conducted. Status: ${matchedRx.status}.`
  );

  res.json(verificationSummary);
});

// Audit Logs API (Doctor/Admin access)
app.get('/api/audit-logs', requireVerifiedDoctor, (req, res) => {
  res.json(db.auditLogs);
});

// -----------------------------------------------------------------------------
// VITE MIDDLEWARE / STATIC ASSETS
// -----------------------------------------------------------------------------
async function setupServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MediKiosk] Full-Stack Clinical Server running on port ${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start MediKiosk server:', err);
});
