import {
  Patient,
  InterviewSession,
  MedicalDocument,
  EPrescription,
  AuditLogEntry,
  User,
  DoctorBrief,
  MedicalFact,
  RedFlag,
  MissingInformation,
  MedicalContradiction,
  TimelineEvent,
} from '../types';

export interface ClinicalDataPackage {
  facts: MedicalFact[];
  redFlags: RedFlag[];
  missingInfo: MissingInformation[];
  contradictions: MedicalContradiction[];
  brief: DoctorBrief | null;
  timeline: TimelineEvent[];
}

export const api = {
  // Auth & Roles
  async getCurrentUser(): Promise<{ user: User & { activeRole: 'PATIENT' | 'DOCTOR' }; doctorProfile: User }> {
    const res = await fetch('/api/auth/current-user');
    if (!res.ok) throw new Error('Failed to fetch user state');
    return res.json();
  },

  async switchRole(role: 'PATIENT' | 'DOCTOR'): Promise<{ success: boolean; role: string }> {
    const res = await fetch('/api/auth/switch-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error('Failed to switch role');
    return res.json();
  },

  // Reset Demo Scenario to clean initial state
  async resetDemo(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/demo/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to reset demo scenario');
    return res.json();
  },

  // Patients
  async getPatients(): Promise<Patient[]> {
    const res = await fetch('/api/patients');
    if (!res.ok) throw new Error('Failed to fetch patients list');
    return res.json();
  },

  async getPatient(id: string): Promise<Patient> {
    const res = await fetch(`/api/patients/${id}`);
    if (!res.ok) throw new Error('Failed to fetch patient details');
    return res.json();
  },

  async registerPatient(data: Partial<Patient>): Promise<Patient> {
    const res = await fetch('/api/patients/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to register patient');
    }
    return res.json();
  },

  // Interview
  async getInterview(patientId: string): Promise<InterviewSession> {
    const res = await fetch(`/api/interview/${patientId}`);
    if (!res.ok) throw new Error('Failed to fetch interview');
    return res.json();
  },

  async sendInterviewMessage(
    patientId: string,
    text: string,
    isVoice = false
  ): Promise<{ session: InterviewSession; aiMessage: any; usedGemini: boolean }> {
    const res = await fetch(`/api/interview/${patientId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, isVoice }),
    });
    if (!res.ok) throw new Error('Failed to send interview message');
    return res.json();
  },

  // Documents
  async getDocuments(patientId: string): Promise<MedicalDocument[]> {
    const res = await fetch(`/api/documents/${patientId}`);
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  async uploadDocument(patientId: string, data: Partial<MedicalDocument>): Promise<MedicalDocument> {
    const res = await fetch(`/api/documents/${patientId}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to upload document');
    return res.json();
  },

  // Clinical Knowledge
  async getClinicalData(patientId: string): Promise<ClinicalDataPackage> {
    const res = await fetch(`/api/clinical/${patientId}`);
    if (!res.ok) throw new Error('Failed to fetch clinical profile');
    return res.json();
  },

  async verifyFact(patientId: string, factId: string, verified: boolean, doctorNotes?: string): Promise<any> {
    const res = await fetch(`/api/doctor/facts/${factId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, verified, doctorNotes }),
    });
    if (!res.ok) throw new Error('Failed to verify fact');
    return res.json();
  },

  async resolveContradiction(patientId: string, contraId: string, doctorResolution: string): Promise<any> {
    const res = await fetch(`/api/doctor/contradictions/${contraId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, doctorResolution }),
    });
    if (!res.ok) throw new Error('Failed to resolve contradiction');
    return res.json();
  },

  async acknowledgeRedFlag(patientId: string, flagId: string): Promise<any> {
    const res = await fetch(`/api/doctor/redflags/${flagId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId }),
    });
    if (!res.ok) throw new Error('Failed to acknowledge red flag');
    return res.json();
  },

  async confirmDoctorBrief(patientId: string, clinicalImpressionDraft: string, doctorNotes?: string): Promise<any> {
    const res = await fetch(`/api/doctor/brief/${patientId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clinicalImpressionDraft, doctorNotes }),
    });
    if (!res.ok) throw new Error('Failed to confirm doctor brief');
    return res.json();
  },

  // Prescriptions
  async getPrescription(patientId: string): Promise<EPrescription> {
    const res = await fetch(`/api/prescriptions/${patientId}`);
    if (!res.ok) throw new Error('Failed to fetch prescription');
    return res.json();
  },

  async updatePrescriptionDraft(patientId: string, data: Partial<EPrescription>): Promise<EPrescription> {
    const res = await fetch(`/api/prescriptions/${patientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update prescription draft');
    return res.json();
  },

  async authorizePrescription(patientId: string, doctorNotes?: string): Promise<{ success: boolean; prescription: EPrescription }> {
    const res = await fetch(`/api/prescriptions/${patientId}/authorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorNotes }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to authorize prescription');
    }
    return res.json();
  },

  async verifyPrescription(prescriptionId: string): Promise<any> {
    const res = await fetch(`/api/prescriptions/verify/${encodeURIComponent(prescriptionId)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Prescription not found');
    }
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLogEntry[]> {
    const res = await fetch('/api/audit-logs');
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },
};
