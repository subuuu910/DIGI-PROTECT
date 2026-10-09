import React, { useState, useEffect, useCallback } from 'react';
import { api, ClinicalDataPackage } from './services/api';
import {
  Patient,
  InterviewSession,
  MedicalDocument,
  EPrescription,
  AuditLogEntry,
  User,
  UserRole,
} from './types';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { LandingPage } from './pages/LandingPage';
import { PatientPortalPage } from './pages/PatientPortalPage';
import { DoctorPortalPage } from './pages/DoctorPortalPage';
import { VerificationPage } from './pages/VerificationPage';
import { AboutPage } from './pages/AboutPage';

const getInitialView = (): 'landing' | 'patient' | 'doctor' | 'verify' | 'about' => {
  if (typeof window === 'undefined') return 'landing';
  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view') as any;
  if (viewParam && ['landing', 'patient', 'doctor', 'verify', 'about'].includes(viewParam)) {
    return viewParam;
  }
  const isDemo = params.get('demo') === 'true' || localStorage.getItem('medikiosk_demo_active') === 'true';
  const saved = localStorage.getItem('medikiosk_current_view') as any;
  if (saved && ['landing', 'patient', 'doctor', 'verify', 'about'].includes(saved)) {
    return saved;
  }
  return isDemo ? 'patient' : 'landing';
};

const getInitialRole = (): UserRole => {
  if (typeof window === 'undefined') return 'PATIENT';
  const params = new URLSearchParams(window.location.search);
  const roleParam = params.get('role');
  if (roleParam === 'DOCTOR' || roleParam === 'PATIENT') return roleParam;
  const saved = localStorage.getItem('medikiosk_active_role');
  if (saved === 'DOCTOR' || saved === 'PATIENT') return saved as UserRole;
  return 'PATIENT';
};

const getInitialPatientId = (): string => {
  if (typeof window === 'undefined') return 'pat-1024';
  const params = new URLSearchParams(window.location.search);
  const patParam = params.get('patient');
  if (patParam) return patParam;
  const saved = localStorage.getItem('medikiosk_patient_id');
  if (saved) return saved;
  return 'pat-1024';
};

const getInitialIsDemo = (): boolean => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('demo') === 'true' || localStorage.getItem('medikiosk_demo_active') === 'true';
};

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'patient' | 'doctor' | 'verify' | 'about'>(getInitialView);
  const [activeRole, setActiveRole] = useState<UserRole>(getInitialRole);
  const [isDemoActive, setIsDemoActive] = useState<boolean>(getInitialIsDemo);
  const [userProfile, setUserProfile] = useState<User | null>(null);

  // Core Data State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(getInitialPatientId);
  const [interview, setInterview] = useState<InterviewSession | null>(null);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [clinicalData, setClinicalData] = useState<ClinicalDataPackage | null>(null);
  const [prescription, setPrescription] = useState<EPrescription | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Verification lookup ID state
  const [verifyTargetId, setVerifyTargetId] = useState<string>('MK-RX-2026-1024-EV');

  // UI state
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], title: string, message?: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const syncUrlAndStorage = (
    view: 'landing' | 'patient' | 'doctor' | 'verify' | 'about',
    role: UserRole,
    patientId: string,
    demoActive: boolean
  ) => {
    try {
      localStorage.setItem('medikiosk_current_view', view);
      localStorage.setItem('medikiosk_active_role', role);
      localStorage.setItem('medikiosk_patient_id', patientId);
      localStorage.setItem('medikiosk_demo_active', demoActive ? 'true' : 'false');

      const url = new URL(window.location.href);
      url.searchParams.set('view', view);
      url.searchParams.set('role', role);
      url.searchParams.set('patient', patientId);
      if (demoActive) {
        url.searchParams.set('demo', 'true');
      } else {
        url.searchParams.delete('demo');
      }
      window.history.replaceState({}, '', url.toString());
    } catch (e) {
      // ignore
    }
  };

  const loadPatientContext = async (patientId: string) => {
    try {
      const [intSession, docs, clin, rx] = await Promise.all([
        api.getInterview(patientId),
        api.getDocuments(patientId),
        api.getClinicalData(patientId),
        api.getPrescription(patientId),
      ]);

      // Check if there are locally persisted recent queries for this patient
      let sessionToUse = intSession;
      try {
        const localSaved = localStorage.getItem(`medikiosk_interview_${patientId}`);
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          if (parsed?.messages?.length > intSession.messages.length) {
            sessionToUse = parsed;
          }
        }
      } catch (e) {
        // ignore
      }

      setInterview(sessionToUse);
      setDocuments(docs);
      setClinicalData(clin);
      setPrescription(rx);
    } catch (err: any) {
      console.warn('Error loading patient context:', err);
    }
  };

  // Initial Load (and on page refresh)
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const isDemo = getInitialIsDemo();

      // IMPORTANT: Do NOT automatically reset demo on page refresh!
      // This preserves the user's new queries, interview messages, and edits when refreshing the website.

      const [authData, patientsList, logs] = await Promise.all([
        api.getCurrentUser(),
        api.getPatients(),
        api.getAuditLogs(),
      ]);

      setUserProfile(authData.doctorProfile);
      setPatients(patientsList);
      setAuditLogs(logs);

      const initialPid = getInitialPatientId();
      const targetPid = isDemo
        ? 'pat-1024'
        : (patientsList.find((p) => p.id === initialPid)?.id || patientsList[0]?.id || 'pat-1024');

      setSelectedPatientId(targetPid);
      await loadPatientContext(targetPid);
    } catch (err: any) {
      console.error('Failed to load initial data:', err);
      addToast('error', 'Network Notice', 'Operating with cached clinical data.');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handle View Navigation
  const handleNavigate = (view: 'landing' | 'patient' | 'doctor' | 'verify' | 'about') => {
    setCurrentView(view);
    syncUrlAndStorage(view, activeRole, selectedPatientId, isDemoActive);
  };

  // Handle Patient selection change
  const handleSelectPatient = async (patientId: string) => {
    setSelectedPatientId(patientId);
    syncUrlAndStorage(currentView, activeRole, patientId, isDemoActive);
    setLoading(true);
    await loadPatientContext(patientId);
    setLoading(false);
    const selected = patients.find((p) => p.id === patientId);
    if (selected) {
      addToast('info', `Switched Patient: ${selected.fullName}`, `Loaded clinical profile and medical history.`);
    }
  };

  // Switch Active Role
  const handleRoleSwitch = async (role: UserRole) => {
    setActiveRole(role);
    syncUrlAndStorage(role === 'DOCTOR' ? 'doctor' : 'patient', role, selectedPatientId, isDemoActive);
    try {
      await api.switchRole(role as any);
      if (role === 'DOCTOR') {
        setCurrentView('doctor');
        addToast('info', 'Doctor Workspace Activated', 'Consulting as Dr. Eleanor Vance, MD (GMC-734567)');
      } else {
        setCurrentView('patient');
        addToast('info', 'Patient Kiosk Activated', 'Operating pre-consultation intake terminal.');
      }
    } catch (err) {
      console.warn('Role switch error:', err);
    }
  };

  // View / Switch to Demo Scenario without wiping user's queries
  const handleLaunchDemo = async () => {
    try {
      setIsDemoActive(true);
      setSelectedPatientId('pat-1024');
      setCurrentView('patient');
      setActiveRole('PATIENT');
      syncUrlAndStorage('patient', 'PATIENT', 'pat-1024', true);

      setLoading(true);
      await loadPatientContext('pat-1024');
      addToast(
        'info',
        'Demo Scenario Active: Rahul Verma (42, MK1024)',
        'Your questions and progress are preserved when you refresh the page.'
      );
    } catch (err: any) {
      console.error('Failed to launch demo:', err);
      addToast('error', 'Demo Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Explicitly Reset Demo to clean default stage (only when user clicks "Reset to Default")
  const handleResetDemoToDefault = async () => {
    try {
      setLoading(true);
      await api.resetDemo();
      try {
        localStorage.removeItem('medikiosk_interview_pat-1024');
      } catch (e) {
        // ignore
      }
      setIsDemoActive(true);
      setSelectedPatientId('pat-1024');
      setCurrentView('patient');
      setActiveRole('PATIENT');
      syncUrlAndStorage('patient', 'PATIENT', 'pat-1024', true);

      // Reload patients and patient context
      const [patientsList, logs] = await Promise.all([
        api.getPatients(),
        api.getAuditLogs(),
      ]);
      setPatients(patientsList);
      setAuditLogs(logs);
      await loadPatientContext('pat-1024');

      addToast(
        'success',
        'Demo Scenario Reset to Default',
        'Original baseline triage scenario restored for Rahul Verma (MK1024).'
      );
    } catch (err: any) {
      console.error('Failed to reset demo:', err);
      addToast('error', 'Reset Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Send Interview Message
  const handleSendInterviewMessage = async (text: string, isVoice = false) => {
    if (!selectedPatientId) return;
    try {
      setLoading(true);
      const res = await api.sendInterviewMessage(selectedPatientId, text, isVoice);
      setInterview(res.session);

      // Persist latest session in localStorage so refreshing the website always preserves new queries
      try {
        localStorage.setItem(`medikiosk_interview_${selectedPatientId}`, JSON.stringify(res.session));
      } catch (e) {
        // ignore
      }

      // Refresh clinical data
      const [clin, logs] = await Promise.all([
        api.getClinicalData(selectedPatientId),
        api.getAuditLogs(),
      ]);
      setClinicalData(clin);
      setAuditLogs(logs);

      if (res.usedGemini) {
        addToast('success', 'Gemini AI Clinical Evaluation', 'Synthesized next adaptive follow-up inquiry.');
      }
    } catch (err: any) {
      addToast('error', 'Message Failed', err.message || 'Could not process interview message');
    } finally {
      setLoading(false);
    }
  };

  // Document Upload
  const handleUploadDocument = async (data: Partial<MedicalDocument>) => {
    if (!selectedPatientId) return;
    try {
      setLoading(true);
      await api.uploadDocument(selectedPatientId, data);
      const [docs, clin, logs] = await Promise.all([
        api.getDocuments(selectedPatientId),
        api.getClinicalData(selectedPatientId),
        api.getAuditLogs(),
      ]);
      setDocuments(docs);
      setClinicalData(clin);
      setAuditLogs(logs);
      addToast('success', 'Document Ingested & OCR Processed', `Extracted clinical entities from ${data.fileName}`);
    } catch (err: any) {
      addToast('error', 'Upload Error', err.message || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  // Register New Patient
  const handleRegisterPatient = async (data: Partial<Patient>) => {
    try {
      setLoading(true);
      const newPat = await api.registerPatient(data);
      const [patientsList, logs] = await Promise.all([
        api.getPatients(),
        api.getAuditLogs(),
      ]);
      setPatients(patientsList);
      setAuditLogs(logs);
      setSelectedPatientId(newPat.id);
      setIsDemoActive(false);
      syncUrlAndStorage(currentView, activeRole, newPat.id, false);
      await loadPatientContext(newPat.id);
      addToast('success', 'Registration Complete', `Welcome ${newPat.fullName}! Informed consent recorded.`);
    } catch (err: any) {
      addToast('error', 'Registration Error', err.message || 'Could not register patient');
    } finally {
      setLoading(false);
    }
  };

  // Doctor Fact Verification
  const handleVerifyFact = async (factId: string, verified: boolean, doctorNotes?: string) => {
    if (!selectedPatientId) return;
    try {
      await api.verifyFact(selectedPatientId, factId, verified, doctorNotes);
      const [clin, logs] = await Promise.all([
        api.getClinicalData(selectedPatientId),
        api.getAuditLogs(),
      ]);
      setClinicalData(clin);
      setAuditLogs(logs);
      addToast('info', 'Doctor Verification Updated', `Clinical fact marked as verified=${verified}`);
    } catch (err: any) {
      addToast('error', 'Verification Failed', err.message);
    }
  };

  // Doctor Resolve Contradiction
  const handleResolveContradiction = async (contraId: string, resolution: string) => {
    if (!selectedPatientId) return;
    try {
      await api.resolveContradiction(selectedPatientId, contraId, resolution);
      const [clin, logs] = await Promise.all([
        api.getClinicalData(selectedPatientId),
        api.getAuditLogs(),
      ]);
      setClinicalData(clin);
      setAuditLogs(logs);
      addToast('success', 'Contradiction Resolved', 'Physician resolution recorded. Allergy conflict cleared.');
    } catch (err: any) {
      addToast('error', 'Resolution Failed', err.message);
    }
  };

  // Doctor Acknowledge Red Flag
  const handleAcknowledgeRedFlag = async (flagId: string) => {
    if (!selectedPatientId) return;
    try {
      await api.acknowledgeRedFlag(selectedPatientId, flagId);
      const [clin, logs] = await Promise.all([
        api.getClinicalData(selectedPatientId),
        api.getAuditLogs(),
      ]);
      setClinicalData(clin);
      setAuditLogs(logs);
      addToast('info', 'Red Flag Acknowledged', 'Attending doctor noted safety alert.');
    } catch (err: any) {
      addToast('error', 'Action Failed', err.message);
    }
  };

  // Doctor Confirm Brief
  const handleConfirmBrief = async (clinicalImpressionDraft: string, doctorNotes?: string) => {
    if (!selectedPatientId) return;
    try {
      await api.confirmDoctorBrief(selectedPatientId, clinicalImpressionDraft, doctorNotes);
      const [clin, logs] = await Promise.all([
        api.getClinicalData(selectedPatientId),
        api.getAuditLogs(),
      ]);
      setClinicalData(clin);
      setAuditLogs(logs);
      addToast('success', '60-Second Brief Confirmed', 'Physician verified intake findings.');
    } catch (err: any) {
      addToast('error', 'Confirmation Failed', err.message);
    }
  };

  // Update Prescription Draft
  const handleUpdatePrescriptionDraft = async (data: Partial<EPrescription>) => {
    if (!selectedPatientId) return;
    try {
      const updated = await api.updatePrescriptionDraft(selectedPatientId, data);
      setPrescription(updated);
    } catch (err: any) {
      addToast('error', 'Draft Update Failed', err.message);
    }
  };

  // Authorize Prescription
  const handleAuthorizePrescription = async (doctorNotes?: string) => {
    if (!selectedPatientId) return;
    try {
      setLoading(true);
      const res = await api.authorizePrescription(selectedPatientId, doctorNotes);
      setPrescription(res.prescription);
      const [patientsList, clin, logs] = await Promise.all([
        api.getPatients(),
        api.getClinicalData(selectedPatientId),
        api.getAuditLogs(),
      ]);
      setPatients(patientsList);
      setClinicalData(clin);
      setAuditLogs(logs);
      addToast(
        'success',
        'Prescription Authorized & Digitally Signed!',
        `Prescription ${res.prescription.prescriptionId} is now final with verified QR code.`
      );
    } catch (err: any) {
      addToast('error', 'Authorization Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to Verification with specific ID
  const handleNavigateToVerify = (prescriptionId: string) => {
    setVerifyTargetId(prescriptionId);
    handleNavigate('verify');
  };

  const currentPatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-cyan-500/20 selection:text-cyan-900">
      {/* Top Bar Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        activeRole={activeRole}
        onRoleSwitch={handleRoleSwitch}
        onLaunchDemo={handleLaunchDemo}
        onResetDemoToDefault={handleResetDemoToDefault}
        isDemoActive={isDemoActive}
      />

      {/* Main View Port */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartPatient={() => {
              setActiveRole('PATIENT');
              handleNavigate('patient');
            }}
            onOpenDoctor={() => {
              setActiveRole('DOCTOR');
              handleNavigate('doctor');
            }}
            onLaunchDemo={handleLaunchDemo}
            onOpenVerify={() => handleNavigate('verify')}
          />
        )}

        {currentView === 'patient' && currentPatient && interview && prescription && (
          <PatientPortalPage
            currentPatient={currentPatient}
            allPatients={patients}
            onSelectPatient={handleSelectPatient}
            interview={interview}
            documents={documents}
            timeline={clinicalData?.timeline || []}
            brief={clinicalData?.brief || null}
            prescription={prescription}
            redFlags={clinicalData?.redFlags || []}
            onSendInterviewMessage={handleSendInterviewMessage}
            onUploadDocument={handleUploadDocument}
            onRegisterPatient={handleRegisterPatient}
            onNavigateToVerify={handleNavigateToVerify}
            loading={loading}
          />
        )}

        {currentView === 'doctor' && currentPatient && prescription && userProfile && (
          <DoctorPortalPage
            doctor={userProfile}
            patients={patients}
            selectedPatient={currentPatient}
            onSelectPatient={handleSelectPatient}
            brief={clinicalData?.brief || null}
            facts={clinicalData?.facts || []}
            redFlags={clinicalData?.redFlags || []}
            missingInfo={clinicalData?.missingInfo || []}
            contradictions={clinicalData?.contradictions || []}
            documents={documents}
            timeline={clinicalData?.timeline || []}
            prescription={prescription}
            auditLogs={auditLogs}
            onVerifyFact={handleVerifyFact}
            onResolveContradiction={handleResolveContradiction}
            onAcknowledgeRedFlag={handleAcknowledgeRedFlag}
            onConfirmBrief={handleConfirmBrief}
            onUpdatePrescriptionDraft={handleUpdatePrescriptionDraft}
            onAuthorizePrescription={handleAuthorizePrescription}
            loading={loading}
          />
        )}

        {currentView === 'verify' && (
          <VerificationPage initialId={verifyTargetId} />
        )}

        {currentView === 'about' && <AboutPage />}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Global Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
