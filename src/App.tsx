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
  AppView,
} from './types';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { LandingPage } from './pages/LandingPage';
import { PatientPortalPage } from './pages/PatientPortalPage';
import { DoctorPortalPage } from './pages/DoctorPortalPage';
import { VerificationPage } from './pages/VerificationPage';
import { AboutPage } from './pages/AboutPage';
import { ProfilePage } from './pages/ProfilePage';
import { DoctorPendingApprovalNotice } from './components/doctor/DoctorPendingApprovalNotice';
import { AuthPage } from './components/auth/AuthPage';

const getInitialView = (): AppView => {
  if (typeof window === 'undefined') return 'landing';
  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view') as any;
  if (
    viewParam &&
    [
      'landing',
      'doctor-workspace',
      'doctor-queue',
      'verify',
      'about',
      'ai-analysis',
      'profile',
    ].includes(viewParam)
  ) {
    return viewParam === 'doctor' ? 'doctor-workspace' : viewParam;
  }
  return 'landing';
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

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(getInitialView);
  const [activeRole, setActiveRole] = useState<UserRole>(getInitialRole);
  const [isDoctorApproved, setIsDoctorApproved] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [initialChecking, setInitialChecking] = useState<boolean>(true);

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
    view: AppView,
    role: UserRole,
    patientId: string
  ) => {
    try {
      localStorage.setItem('medikiosk_current_view', view);
      localStorage.setItem('medikiosk_active_role', role);
      localStorage.setItem('medikiosk_patient_id', patientId);
      localStorage.removeItem('medikiosk_demo_active');

      const url = new URL(window.location.href);
      url.searchParams.set('view', view);
      url.searchParams.set('role', role);
      url.searchParams.set('patient', patientId);
      url.searchParams.delete('demo');
      window.history.replaceState({}, '', url.toString());
    } catch (e) {
      // ignore
    }
  };

  // Role-Based Navigation Security Validator
  const checkRoleAccess = useCallback(
    (
      targetView: AppView,
      role: UserRole,
      approved: boolean
    ): { allowed: boolean; safeView: AppView; reason?: string } => {
      const normView: AppView = targetView === 'doctor' ? 'doctor-workspace' : targetView;

      if (role === 'PATIENT') {
        // Patient permitted tabs: landing, patient, verify, about, ai-analysis, profile
        if (['doctor', 'doctor-workspace', 'doctor-queue'].includes(normView)) {
          return {
            allowed: false,
            safeView: 'landing',
            reason: 'Access denied: Doctor Workspace and Patient Queue are restricted to licensed doctors.',
          };
        }
        return { allowed: true, safeView: normView };
      }

      if (role === 'DOCTOR') {
        if (!approved) {
          // Unverified Doctor: Doctor Workspace and Patient Queue are strictly restricted!
          if (['doctor', 'doctor-workspace', 'doctor-queue'].includes(normView)) {
            return {
              allowed: false,
              safeView: 'doctor-workspace', // Will render DoctorPendingApprovalNotice
              reason: 'Doctor verification is pending administrative and medical council approval.',
            };
          }
          if (['patient', 'verify', 'ai-analysis'].includes(normView)) {
            return {
              allowed: false,
              safeView: 'landing',
              reason: 'Access denied: Patient features are restricted for Doctor accounts.',
            };
          }
          return { allowed: true, safeView: normView };
        }

        // Verified Doctor: Permitted tabs are landing, doctor-workspace, doctor-queue, about, profile
        if (['patient', 'verify', 'ai-analysis'].includes(normView)) {
          return {
            allowed: false,
            safeView: 'doctor-workspace',
            reason: 'Access denied: Patient intake views are reserved for patient terminals.',
          };
        }
        return { allowed: true, safeView: normView };
      }

      return { allowed: true, safeView: normView };
    },
    []
  );

  const loadPatientContext = async (patientId: string) => {
    try {
      const [intSession, docs, clin, rx] = await Promise.all([
        api.getInterview(patientId),
        api.getDocuments(patientId),
        api.getClinicalData(patientId),
        api.getPrescription(patientId),
      ]);

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

  // Initial Load (and on page refresh): Authentication is the FIRST screen
  const loadInitialData = useCallback(async () => {
    try {
      setInitialChecking(true);
      const authData = await api.getCurrentUser().catch(() => ({ user: null }));

      if (!authData || !authData.user) {
        setUserProfile(null);
        setInitialChecking(false);
        return;
      }

      const authenticatedUser = authData.user;
      const role = authenticatedUser.role || 'PATIENT';
      const approved = !!authenticatedUser.isDoctorApproved;

      setActiveRole(role);
      setIsDoctorApproved(approved);
      setUserProfile(authenticatedUser);

      const patientsList = await api.getPatients().catch(() => []);
      setPatients(patientsList);

      if (role === 'DOCTOR' && approved) {
        try {
          const logs = await api.getAuditLogs();
          setAuditLogs(logs);
        } catch (e) {
          // ignore
        }
      }

      const initialPid = patientsList[0]?.id || 'pat-1024';
      setSelectedPatientId(initialPid);
      await loadPatientContext(initialPid);

      const initialView = getInitialView();
      const accessCheck = checkRoleAccess(initialView, role, approved);
      if (!accessCheck.allowed) {
        setCurrentView(accessCheck.safeView);
        syncUrlAndStorage(accessCheck.safeView, role, initialPid);
      } else {
        setCurrentView(initialView);
      }
    } catch (err: any) {
      console.error('Failed to load initial data:', err);
      setUserProfile(null);
    } finally {
      setInitialChecking(false);
    }
  }, [checkRoleAccess]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handle View Navigation with strict Role Guards
  const handleNavigate = (view: AppView) => {
    const normView: AppView = view === 'doctor' ? 'doctor-workspace' : view;
    const accessCheck = checkRoleAccess(normView, activeRole, isDoctorApproved);

    if (!accessCheck.allowed) {
      if (accessCheck.reason && (!isDoctorApproved || activeRole === 'PATIENT')) {
        addToast('error', 'Restricted Area', accessCheck.reason);
      }
      setCurrentView(accessCheck.safeView);
      syncUrlAndStorage(accessCheck.safeView, activeRole, selectedPatientId);
      return;
    }

    setCurrentView(normView);
    syncUrlAndStorage(normView, activeRole, selectedPatientId);
  };

  // Handle Patient selection change
  const handleSelectPatient = async (patientId: string) => {
    setSelectedPatientId(patientId);
    syncUrlAndStorage(currentView, activeRole, patientId);
    setLoading(true);
    await loadPatientContext(patientId);
    setLoading(false);
    const selected = patients.find((p) => p.id === patientId);
    if (selected) {
      addToast('info', `Switched Patient: ${selected.fullName}`, `Loaded clinical profile and medical history.`);
    }
  };

  // Handle successful login or OTP activation from AuthPage
  const handleAuthSuccess = async (user: User) => {
    setUserProfile(user);
    const role = user.role;
    const approved = !!user.isDoctorApproved;
    setActiveRole(role);
    setIsDoctorApproved(approved);

    try {
      setLoading(true);
      const patientsList = await api.getPatients().catch(() => []);
      setPatients(patientsList);

      const pid = role === 'PATIENT' && user.id ? user.id : (patientsList[0]?.id || 'pat-1024');
      setSelectedPatientId(pid);
      await loadPatientContext(pid);

      if (role === 'DOCTOR' && approved) {
        try {
          const logs = await api.getAuditLogs();
          setAuditLogs(logs);
        } catch (e) {
          // ignore
        }
      }

      let nextView: AppView = 'landing';
      if (role === 'DOCTOR') {
        nextView = approved ? 'doctor-workspace' : 'doctor-workspace';
      } else {
        nextView = 'landing';
      }

      setCurrentView(nextView);
      syncUrlAndStorage(nextView, role, pid);
      addToast('success', `Welcome, ${user.name}`, `Signed in successfully.`);
    } catch (err: any) {
      console.warn('Post-auth initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Administrator Approval simulation for Doctor accounts
  const handleApproveDoctor = async () => {
    if (!userProfile) return;
    try {
      setLoading(true);
      const res = await api.approveDoctor(userProfile.id);
      if (res.success && res.user) {
        setUserProfile(res.user);
        setIsDoctorApproved(true);
        setCurrentView('doctor-workspace');
        syncUrlAndStorage('doctor-workspace', 'DOCTOR', selectedPatientId);
        try {
          const logs = await api.getAuditLogs();
          setAuditLogs(logs);
        } catch (e) {
          // ignore
        }
        addToast('success', 'Doctor Account Approved', 'Administrative board verification complete. Doctor Workspace unlocked.');
      }
    } catch (err: any) {
      addToast('error', 'Approval Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Logout authenticated user: MUST destroy session and return to Login screen immediately
  const handleLogout = async () => {
    try {
      setLoading(true);
      await api.logout().catch(() => {});
    } catch {
      // ignore
    } finally {
      setUserProfile(null);
      setActiveRole('PATIENT');
      setIsDoctorApproved(false);
      try {
        localStorage.removeItem('medikiosk_active_role');
        localStorage.removeItem('medikiosk_current_view');
        localStorage.removeItem('medikiosk_patient_id');
        localStorage.removeItem('medikiosk_demo_active');
        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState({}, '', url.toString());
      } catch (e) {
        // ignore
      }
      setLoading(false);
      addToast('info', 'Logged Out', 'Your session has ended. Please log in.');
    }
  };

  // Send Interview Message
  const handleSendInterviewMessage = async (text: string, isVoice = false) => {
    if (!selectedPatientId) return;
    try {
      setLoading(true);
      const res = await api.sendInterviewMessage(selectedPatientId, text, isVoice);
      setInterview(res.session);

      try {
        localStorage.setItem(`medikiosk_interview_${selectedPatientId}`, JSON.stringify(res.session));
      } catch (e) {
        // ignore
      }

      // Refresh clinical data
      const clin = await api.getClinicalData(selectedPatientId);
      setClinicalData(clin);

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
      const [docs, clin] = await Promise.all([
        api.getDocuments(selectedPatientId),
        api.getClinicalData(selectedPatientId),
      ]);
      setDocuments(docs);
      setClinicalData(clin);
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
      const patientsList = await api.getPatients();
      setPatients(patientsList);
      setSelectedPatientId(newPat.id);
      syncUrlAndStorage(currentView, activeRole, newPat.id);
      await loadPatientContext(newPat.id);
      addToast('success', 'Registration Complete', `Welcome ${newPat.fullName}! Informed consent recorded.`);
    } catch (err: any) {
      addToast('error', 'Registration Error', err.message || 'Could not register patient');
    } finally {
      setLoading(false);
    }
  };

  // Doctor Fact Verification (Verified Doctor Only)
  const handleVerifyFact = async (factId: string, verified: boolean, doctorNotes?: string) => {
    if (!selectedPatientId) return;
    try {
      await api.verifyFact(selectedPatientId, factId, verified, doctorNotes);
      const clin = await api.getClinicalData(selectedPatientId);
      setClinicalData(clin);
      if (activeRole === 'DOCTOR' && isDoctorApproved) {
        const logs = await api.getAuditLogs().catch(() => []);
        setAuditLogs(logs);
      }
      addToast('info', 'Doctor Verification Updated', `Clinical fact marked as verified=${verified}`);
    } catch (err: any) {
      addToast('error', 'Verification Failed', err.message);
    }
  };

  // Doctor Resolve Contradiction (Verified Doctor Only)
  const handleResolveContradiction = async (contraId: string, resolution: string) => {
    if (!selectedPatientId) return;
    try {
      await api.resolveContradiction(selectedPatientId, contraId, resolution);
      const clin = await api.getClinicalData(selectedPatientId);
      setClinicalData(clin);
      if (activeRole === 'DOCTOR' && isDoctorApproved) {
        const logs = await api.getAuditLogs().catch(() => []);
        setAuditLogs(logs);
      }
      addToast('success', 'Contradiction Resolved', 'Physician resolution recorded. Allergy conflict cleared.');
    } catch (err: any) {
      addToast('error', 'Resolution Failed', err.message);
    }
  };

  // Doctor Acknowledge Red Flag (Verified Doctor Only)
  const handleAcknowledgeRedFlag = async (flagId: string) => {
    if (!selectedPatientId) return;
    try {
      await api.acknowledgeRedFlag(selectedPatientId, flagId);
      const clin = await api.getClinicalData(selectedPatientId);
      setClinicalData(clin);
      if (activeRole === 'DOCTOR' && isDoctorApproved) {
        const logs = await api.getAuditLogs().catch(() => []);
        setAuditLogs(logs);
      }
      addToast('info', 'Red Flag Acknowledged', 'Attending doctor noted safety alert.');
    } catch (err: any) {
      addToast('error', 'Action Failed', err.message);
    }
  };

  // Doctor Confirm Brief (Verified Doctor Only)
  const handleConfirmBrief = async (clinicalImpressionDraft: string, doctorNotes?: string) => {
    if (!selectedPatientId) return;
    try {
      await api.confirmDoctorBrief(selectedPatientId, clinicalImpressionDraft, doctorNotes);
      const clin = await api.getClinicalData(selectedPatientId);
      setClinicalData(clin);
      if (activeRole === 'DOCTOR' && isDoctorApproved) {
        const logs = await api.getAuditLogs().catch(() => []);
        setAuditLogs(logs);
      }
      addToast('success', '60-Second Brief Confirmed', 'Physician verified intake findings.');
    } catch (err: any) {
      addToast('error', 'Confirmation Failed', err.message);
    }
  };

  // Update Prescription Draft (Verified Doctor Only)
  const handleUpdatePrescriptionDraft = async (data: Partial<EPrescription>) => {
    if (!selectedPatientId) return;
    try {
      const updated = await api.updatePrescriptionDraft(selectedPatientId, data);
      setPrescription(updated);
    } catch (err: any) {
      addToast('error', 'Draft Update Failed', err.message);
    }
  };

  // Authorize Prescription (Verified Doctor Only)
  const handleAuthorizePrescription = async (doctorNotes?: string) => {
    if (!selectedPatientId) return;
    try {
      setLoading(true);
      const res = await api.authorizePrescription(selectedPatientId, doctorNotes);
      setPrescription(res.prescription);
      const [patientsList, clin] = await Promise.all([
        api.getPatients(),
        api.getClinicalData(selectedPatientId),
      ]);
      setPatients(patientsList);
      setClinicalData(clin);
      if (activeRole === 'DOCTOR' && isDoctorApproved) {
        const logs = await api.getAuditLogs().catch(() => []);
        setAuditLogs(logs);
      }
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

  // 1. Initial Session Check Screen
  if (initialChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-xl bg-cyan-600 flex items-center justify-center font-bold text-xl shadow-lg animate-pulse">
          MK
        </div>
        <p className="text-sm font-medium text-slate-300">Checking clinical session...</p>
      </div>
    );
  }

  // 2. Authentication MUST be the FIRST screen when unauthenticated
  if (!userProfile) {
    return (
      <>
        <AuthPage onAuthSuccess={handleAuthSuccess} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-cyan-500/20 selection:text-cyan-900">
      {/* Top Bar Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        activeRole={activeRole}
        isDoctorApproved={isDoctorApproved}
        currentUser={userProfile}
        onLogout={handleLogout}
      />

      {/* Main View Port */}
      <main className="flex-1">
        {/* 1. OVERVIEW (Landing Page) */}
        {currentView === 'landing' && (
          <LandingPage
            onStartPatient={() => {
              if (activeRole === 'PATIENT') {
                handleNavigate('patient');
              } else {
                addToast('info', 'Patient Kiosk', 'Patient intake is reserved for patient users.');
              }
            }}
            onOpenDoctor={() => {
              if (activeRole === 'DOCTOR') {
                handleNavigate('doctor-workspace');
              } else {
                addToast('info', 'Doctor Access', 'Doctor Workspace is restricted to licensed doctors. Log in with a Doctor account.');
              }
            }}
            onOpenVerify={() => {
              handleNavigate('verify');
            }}
          />
        )}

        {/* 2. PATIENT KIOSK (Patient Portal with Intake Stepper) */}
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
            initialStep="interview"
          />
        )}

        {/* 3. AI ANALYSIS (Patient Portal with 60s Brief Preview active) */}
        {currentView === 'ai-analysis' && currentPatient && interview && prescription && (
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
            initialStep="brief"
          />
        )}

        {/* 4. DOCTOR WORKSPACE & PATIENT QUEUE (Doctor Portal or Pending Notice) */}
        {(currentView === 'doctor-workspace' || currentView === 'doctor-queue' || currentView === 'doctor') && (
          activeRole === 'DOCTOR' && !isDoctorApproved ? (
            <DoctorPendingApprovalNotice
              doctor={userProfile}
              onLogout={handleLogout}
              onApproveDoctor={handleApproveDoctor}
              onNavigateToOverview={() => handleNavigate('landing')}
            />
          ) : currentPatient && prescription && userProfile ? (
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
              activeViewMode={currentView === 'doctor-queue' ? 'queue' : 'workspace'}
              onViewModeChange={(mode) => handleNavigate(mode === 'queue' ? 'doctor-queue' : 'doctor-workspace')}
            />
          ) : null
        )}

        {/* 5. VERIFY PRESCRIPTION */}
        {currentView === 'verify' && (
          <VerificationPage initialId={verifyTargetId} />
        )}

        {/* 6. SAFETY AND SYSTEM */}
        {currentView === 'about' && <AboutPage />}

        {/* 7. MY PROFILE */}
        {currentView === 'profile' && (
          <ProfilePage
            user={userProfile}
            patient={currentPatient}
            activeRole={activeRole}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Global Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

