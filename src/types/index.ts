export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export type AppView =
  | 'landing'
  | 'patient'
  | 'doctor'
  | 'doctor-workspace'
  | 'doctor-queue'
  | 'verify'
  | 'about'
  | 'ai-analysis'
  | 'profile';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  doctorLicense?: string;
  doctorSpecialty?: string;
  hospitalAffiliation?: string;
  isDoctorApproved?: boolean;
  approvalStatus?: 'APPROVED' | 'PENDING' | 'REJECTED';
  phone?: string;
}

export interface SignUpPatientData {
  fullName: string;
  email: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  password: string;
  confirmPassword?: string;
}

export interface SignUpDoctorData {
  fullName: string;
  email: string;
  phone: string;
  doctorLicense: string;
  doctorSpecialty: string;
  password: string;
  confirmPassword?: string;
}

export interface OtpVerificationPayload {
  ticketId: string;
  otp: string;
}

export type TriagePriority = 'GREEN' | 'AMBER' | 'RED';

export interface Patient {
  id: string;
  patientId: string; // e.g. MK1024
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  phone: string;
  email: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  existingConditions: string[];
  knownAllergies: string[];
  currentMedicines: string[];
  consentGiven: boolean;
  consentTimestamp?: string;
  priority: TriagePriority;
  status: 'Waiting' | 'In Consultation' | 'Prescription Ready' | 'Completed';
  registeredAt: string;
  waitingTimeMinutes?: number;
}

export interface InterviewMessage {
  id: string;
  sender: 'ai' | 'patient';
  text: string;
  timestamp: string;
  isVoice?: boolean;
  suggestedReplies?: string[];
  evidenceTag?: string;
}

export interface InterviewSession {
  id: string;
  patientId: string;
  startedAt: string;
  completedAt?: string;
  status: 'in_progress' | 'completed';
  chiefComplaint: string;
  duration: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  symptoms: string[];
  associatedSymptoms: string[];
  messages: InterviewMessage[];
  progressPercent: number;
}

export interface MedicalDocument {
  id: string;
  patientId: string;
  fileName: string;
  fileType: 'prescription' | 'lab_report' | 'xray' | 'discharge_summary' | 'other';
  mimeType: string;
  fileSize: string;
  uploadedAt: string;
  thumbnailUrl: string;
  ocrStatus: 'pending' | 'processing' | 'completed' | 'failed';
  rawOcrText?: string;
  extractedEntities?: {
    medicines?: string[];
    dosages?: string[];
    dates?: string[];
    conditions?: string[];
    allergies?: string[];
    labValues?: Array<{ parameter: string; value: string; unit: string; referenceRange: string; isAbnormal?: boolean }>;
    doctorNotes?: string;
  };
}

export interface MedicalFact {
  id: string;
  patientId: string;
  category: 'symptom' | 'history' | 'medicine' | 'allergy' | 'lab_result' | 'previous_treatment';
  fact: string;
  sourceType: 'interview' | 'document';
  sourceName: string;
  sourceReference: string; // e.g. "Question 3" or "Prescription.pdf (Page 1)"
  verifiedByDoctor: boolean;
  doctorNotes?: string;
  isContradicted?: boolean;
}

export interface RedFlag {
  id: string;
  level: 'AMBER' | 'RED';
  title: string;
  description: string;
  recommendation: string;
  sourceFactIds: string[];
  acknowledgedByDoctor: boolean;
}

export interface MissingInformation {
  id: string;
  field: string;
  clinicalSignificance: string;
  suggestedFollowUpQuestion: string;
  resolved: boolean;
  resolvedValue?: string;
}

export interface MedicalContradiction {
  id: string;
  title: string;
  itemA: {
    source: string;
    statement: string;
    date?: string;
  };
  itemB: {
    source: string;
    statement: string;
    date?: string;
  };
  resolutionRequired: string;
  resolved: boolean;
  doctorResolution?: string;
}

export interface DoctorBrief {
  id: string;
  patientId: string;
  generatedAt: string;
  priority: TriagePriority;
  chiefComplaint: string;
  currentSymptoms: string[];
  duration: string;
  relevantHistory: string[];
  currentMedicines: string[];
  allergies: string[];
  redFlagCount: number;
  missingInfoCount: number;
  contradictionCount: number;
  clinicalImpressionDraft: string;
  doctorReviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  category: 'Prescription' | 'Lab Test' | 'Clinical Interview' | 'Treatment';
  description: string;
  sourceDocId?: string;
  medicines?: string[];
  relevantFinding?: string;
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  dosage: string; // e.g. "500 mg"
  route: string; // e.g. "Oral"
  frequency: string; // e.g. "Twice daily after meals"
  duration: string; // e.g. "5 days"
  instructions: string; // e.g. "Complete full course. Drink plenty of water."
}

export interface EPrescription {
  id: string;
  prescriptionId: string; // e.g. MK-RX-2026-8942
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  doctorId: string;
  doctorName: string;
  doctorLicense: string;
  doctorSpecialty: string;
  clinicName: string;
  issuedDate: string;
  status: 'DRAFT' | 'AUTHORIZED' | 'VERIFIED' | 'DISPENSED' | 'EXPIRED';
  diagnosis: string;
  medicines: PrescriptionItem[];
  generalInstructions: string;
  doctorNotes: string;
  dietAdvice?: string;
  followUpDate?: string;
  qrCodeDataUrl: string;
  verificationHash: string;
  authorizedAt?: string;
  digitalSignature?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  entityType: 'PATIENT' | 'CONSENT' | 'DOCUMENT' | 'OCR' | 'AI_BRIEF' | 'DOCTOR_REVIEW' | 'PRESCRIPTION' | 'VERIFICATION';
  entityId: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL';
}
