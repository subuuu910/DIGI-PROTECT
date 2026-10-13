import React, { useState } from 'react';
import {
  MessageSquare,
  UploadCloud,
  Calendar,
  FileText,
  Pill,
  AlertOctagon,
  UserPlus,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  Patient,
  InterviewSession,
  MedicalDocument,
  EPrescription,
  TimelineEvent,
  DoctorBrief,
  RedFlag,
} from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { AdaptiveInterview } from '../components/patient/AdaptiveInterview';
import { DocumentUpload } from '../components/patient/DocumentUpload';
import { TimelineView } from '../components/patient/TimelineView';
import { PatientPrescriptionView } from '../components/patient/PatientPrescriptionView';
import { OcrResultsViewer } from '../components/patient/OcrResultsViewer';
import { EmergencyAssistModal } from '../components/patient/EmergencyAssistModal';
import { RegistrationModal } from '../components/patient/RegistrationModal';

interface PatientPortalPageProps {
  currentPatient: Patient;
  allPatients: Patient[];
  onSelectPatient: (patientId: string) => void;
  interview: InterviewSession;
  documents: MedicalDocument[];
  timeline: TimelineEvent[];
  brief: DoctorBrief | null;
  prescription: EPrescription;
  redFlags: RedFlag[];
  onSendInterviewMessage: (text: string, isVoice?: boolean) => Promise<void>;
  onUploadDocument: (data: Partial<MedicalDocument>) => Promise<void>;
  onRegisterPatient: (data: Partial<Patient>) => Promise<void>;
  onNavigateToVerify: (prescriptionId: string) => void;
  loading: boolean;
  initialStep?: 'interview' | 'upload' | 'timeline' | 'brief' | 'prescription';
}

export const PatientPortalPage: React.FC<PatientPortalPageProps> = ({
  currentPatient,
  allPatients,
  onSelectPatient,
  interview,
  documents,
  timeline,
  brief,
  prescription,
  redFlags,
  onSendInterviewMessage,
  onUploadDocument,
  onRegisterPatient,
  onNavigateToVerify,
  loading,
  initialStep = 'interview',
}) => {
  const [activeStep, setActiveStep] = useState<
    'interview' | 'upload' | 'timeline' | 'brief' | 'prescription'
  >(initialStep);

  React.useEffect(() => {
    if (initialStep) {
      setActiveStep(initialStep);
    }
  }, [initialStep]);

  const [selectedDocPreview, setSelectedDocPreview] = useState<MedicalDocument | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const isPrescriptionReady =
    prescription.status === 'AUTHORIZED' || prescription.status === 'VERIFIED';

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Patient Header & Quick Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyan-700 text-white font-bold flex items-center justify-center text-lg shadow-xs">
            {currentPatient.fullName[0]}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">{currentPatient.fullName}</h1>
              <span className="font-mono text-xs text-slate-500 font-medium">ID: {currentPatient.patientId}</span>
              <StatusBadge priority={currentPatient.priority} />
              <StatusBadge status={currentPatient.status} />
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
              <span>{currentPatient.age} Years</span>
              <span aria-hidden="true">·</span>
              <span>{currentPatient.gender}</span>
              <span aria-hidden="true">·</span>
              <span>Phone: <span className="font-mono tabular-nums">{currentPatient.phone}</span></span>
              <span aria-hidden="true">·</span>
              <span>Emergency Contact: {currentPatient.emergencyContact?.name}</span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Patient Selector */}
          <select
            value={currentPatient.id}
            onChange={(e) => onSelectPatient(e.target.value)}
            className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 bg-white text-slate-700 font-medium"
          >
            {allPatients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} ({p.patientId}) - {p.priority}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-cyan-700" />
            <span>New Patient</span>
          </button>

          <button
            onClick={() => setShowEmergencyModal(true)}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Emergency assistance protocol"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            <span>Emergency Assist</span>
          </button>
        </div>
      </div>

      {/* Patient Stepper Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        <button
          onClick={() => setActiveStep('interview')}
          className={`p-3 rounded-lg border text-left transition-all ${
            activeStep === 'interview'
              ? 'bg-cyan-700 text-white border-cyan-700 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <MessageSquare className="w-4 h-4" />
            <span className="font-mono text-[10px] opacity-80">Step 1</span>
          </div>
          <span className="font-bold block text-xs">AI Interview</span>
          <span className="text-[11px] opacity-80 truncate block">Symptoms & History</span>
        </button>

        <button
          onClick={() => setActiveStep('upload')}
          className={`p-3 rounded-lg border text-left transition-all ${
            activeStep === 'upload'
              ? 'bg-cyan-700 text-white border-cyan-700 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <UploadCloud className="w-4 h-4" />
            <span className="font-mono text-[10px] opacity-80">Step 2</span>
          </div>
          <span className="font-bold block text-xs">Documents & OCR</span>
          <span className="text-[11px] opacity-80 truncate block">Upload Past Records</span>
        </button>

        <button
          onClick={() => setActiveStep('timeline')}
          className={`p-3 rounded-lg border text-left transition-all ${
            activeStep === 'timeline'
              ? 'bg-cyan-700 text-white border-cyan-700 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <Calendar className="w-4 h-4" />
            <span className="font-mono text-[10px] opacity-80">Step 3</span>
          </div>
          <span className="font-bold block text-xs">Medical Timeline</span>
          <span className="text-[11px] opacity-80 truncate block">Milestones & Labs</span>
        </button>

        <button
          onClick={() => setActiveStep('brief')}
          className={`p-3 rounded-lg border text-left transition-all ${
            activeStep === 'brief'
              ? 'bg-cyan-700 text-white border-cyan-700 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <FileText className="w-4 h-4" />
            <span className="font-mono text-[10px] opacity-80">Step 4</span>
          </div>
          <span className="font-bold block text-xs">60s Brief Preview</span>
          <span className="text-[11px] opacity-80 truncate block">Doctor Summary</span>
        </button>

        <button
          onClick={() => setActiveStep('prescription')}
          className={`col-span-2 sm:col-span-1 p-3 rounded-lg border text-left transition-all ${
            activeStep === 'prescription'
              ? 'bg-cyan-700 text-white border-cyan-700 shadow-xs'
              : isPrescriptionReady
              ? 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <Pill className="w-4 h-4" />
            <span className="font-mono text-[10px] opacity-80">Step 5</span>
          </div>
          <span className="font-bold block text-xs">E-Prescription</span>
          <span className="text-[11px] opacity-80 truncate block">
            {isPrescriptionReady ? 'Authorized & Signed' : 'Pending Doctor'}
          </span>
        </button>
      </div>

      {/* ACTIVE STEP CONTENT */}
      {activeStep === 'interview' && (
        <AdaptiveInterview
          session={interview}
          patient={currentPatient}
          onSendMessage={onSendInterviewMessage}
          loading={loading}
        />
      )}

      {activeStep === 'upload' && (
        <DocumentUpload
          documents={documents}
          onUpload={onUploadDocument}
          onSelectDocForPreview={(doc) => setSelectedDocPreview(doc)}
          loading={loading}
        />
      )}

      {activeStep === 'timeline' && (
        <TimelineView
          timeline={timeline}
          onSelectDoc={(docId) => {
            const found = documents.find((d) => d.id === docId);
            if (found) setSelectedDocPreview(found);
          }}
        />
      )}

      {activeStep === 'brief' && brief && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Patient Pre-Consultation Summary (60-Second Brief Preview)
              </h3>
              <p className="text-xs text-slate-500">
                This is the clinical brief generated for your attending physician prior to the consultation.
              </p>
            </div>
            <StatusBadge priority={brief.priority} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                Chief Complaint & Duration
              </span>
              <p className="text-sm font-semibold text-slate-900">{brief.chiefComplaint}</p>
              <p className="text-slate-600">
                <strong>Duration:</strong> {brief.duration}
              </p>
              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Reported Symptoms:</span>
                <ul className="space-y-1 text-slate-700">
                  {brief.currentSymptoms.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
              <div>
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-1">
                  Reported Medications & History
                </span>
                <p className="text-slate-700">
                  {brief.currentMedicines.join(', ') || 'No daily medicines reported'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 bg-amber-50 p-2 rounded border border-amber-200">
                <span className="font-bold text-amber-900 uppercase tracking-wider text-[11px] block mb-0.5">
                  Allergies Flagged
                </span>
                <p className="text-amber-800 font-medium">
                  {brief.allergies.join(', ') || 'None recorded'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-1">
                  Triage Status
                </span>
                <p className="text-slate-700">
                  Your profile has been forwarded to Station #02. Please take a seat in the waiting lounge.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeStep === 'prescription' && (
        <PatientPrescriptionView
          prescription={prescription}
          onNavigateToVerify={onNavigateToVerify}
        />
      )}

      {/* Modals */}
      <OcrResultsViewer
        document={selectedDocPreview}
        onClose={() => setSelectedDocPreview(null)}
      />

      <EmergencyAssistModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        patient={currentPatient}
        redFlags={redFlags}
      />

      <RegistrationModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSubmit={onRegisterPatient}
      />
    </div>
  );
};
