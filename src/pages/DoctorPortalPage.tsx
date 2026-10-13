import React, { useState } from 'react';
import { ArrowLeft, Users, Stethoscope } from 'lucide-react';
import {
  Patient,
  DoctorBrief,
  MedicalFact,
  RedFlag,
  MissingInformation,
  MedicalContradiction,
  MedicalDocument,
  TimelineEvent,
  EPrescription,
  AuditLogEntry,
  User,
} from '../types';
import { DoctorDashboard } from '../components/doctor/DoctorDashboard';
import { DoctorPatientWorkspace } from '../components/doctor/DoctorPatientWorkspace';
import { OcrResultsViewer } from '../components/patient/OcrResultsViewer';

interface DoctorPortalPageProps {
  doctor: User;
  patients: Patient[];
  selectedPatient: Patient;
  onSelectPatient: (patientId: string) => void;
  brief: DoctorBrief | null;
  facts: MedicalFact[];
  redFlags: RedFlag[];
  missingInfo: MissingInformation[];
  contradictions: MedicalContradiction[];
  documents: MedicalDocument[];
  timeline: TimelineEvent[];
  prescription: EPrescription;
  auditLogs: AuditLogEntry[];
  onVerifyFact: (factId: string, verified: boolean, doctorNotes?: string) => Promise<void>;
  onResolveContradiction: (contraId: string, resolution: string) => Promise<void>;
  onAcknowledgeRedFlag: (flagId: string) => Promise<void>;
  onConfirmBrief: (clinicalImpressionDraft: string, doctorNotes?: string) => Promise<void>;
  onUpdatePrescriptionDraft: (data: Partial<EPrescription>) => Promise<void>;
  onAuthorizePrescription: (doctorNotes?: string) => Promise<void>;
  loading: boolean;
  activeViewMode?: 'workspace' | 'queue';
  onViewModeChange?: (mode: 'workspace' | 'queue') => void;
}

export const DoctorPortalPage: React.FC<DoctorPortalPageProps> = ({
  doctor,
  patients,
  selectedPatient,
  onSelectPatient,
  brief,
  facts,
  redFlags,
  missingInfo,
  contradictions,
  documents,
  timeline,
  prescription,
  auditLogs,
  onVerifyFact,
  onResolveContradiction,
  onAcknowledgeRedFlag,
  onConfirmBrief,
  onUpdatePrescriptionDraft,
  onAuthorizePrescription,
  loading,
  activeViewMode = 'workspace',
  onViewModeChange,
}) => {
  const [internalViewMode, setInternalViewMode] = useState<'workspace' | 'queue'>(activeViewMode);

  React.useEffect(() => {
    if (activeViewMode) {
      setInternalViewMode(activeViewMode);
    }
  }, [activeViewMode]);

  const viewMode = activeViewMode || internalViewMode;

  const handleSetViewMode = (mode: 'workspace' | 'queue') => {
    setInternalViewMode(mode);
    if (onViewModeChange) onViewModeChange(mode);
  };

  const [selectedDocPreview, setSelectedDocPreview] = useState<MedicalDocument | null>(null);

  const handleSelectFromQueue = (patientId: string) => {
    onSelectPatient(patientId);
    handleSetViewMode('workspace');
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Navigation Breadcrumb & Mode Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => handleSetViewMode('queue')}
            className={`flex items-center gap-1 font-medium transition-colors ${
              viewMode === 'queue' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Patient Queue</span>
          </button>
          <span className="text-slate-300">/</span>
          <button
            onClick={() => handleSetViewMode('workspace')}
            className={`font-medium transition-colors ${
              viewMode === 'workspace' ? 'text-cyan-800 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Clinical Workspace: {selectedPatient.fullName} ({selectedPatient.patientId})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'workspace' ? (
            <button
              onClick={() => handleSetViewMode('queue')}
              className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Patient Queue</span>
            </button>
          ) : (
            <button
              onClick={() => handleSetViewMode('workspace')}
              className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Resume Workspace ({selectedPatient.fullName})</span>
            </button>
          )}
        </div>
      </div>

      {viewMode === 'queue' ? (
        <DoctorDashboard
          patients={patients}
          selectedPatientId={selectedPatient.id}
          onSelectPatient={handleSelectFromQueue}
          doctorName={doctor.name}
          doctorLicense={doctor.doctorLicense || 'GMC-734567'}
          doctorSpecialty={doctor.doctorSpecialty || 'Internal Medicine'}
        />
      ) : (
        <DoctorPatientWorkspace
          patient={selectedPatient}
          brief={brief}
          facts={facts}
          redFlags={redFlags}
          missingInfo={missingInfo}
          contradictions={contradictions}
          documents={documents}
          timeline={timeline}
          prescription={prescription}
          auditLogs={auditLogs}
          onVerifyFact={onVerifyFact}
          onResolveContradiction={onResolveContradiction}
          onAcknowledgeRedFlag={onAcknowledgeRedFlag}
          onConfirmBrief={onConfirmBrief}
          onUpdatePrescriptionDraft={onUpdatePrescriptionDraft}
          onAuthorizePrescription={onAuthorizePrescription}
          onSelectDocPreview={(doc) => setSelectedDocPreview(doc)}
          loading={loading}
        />
      )}

      {/* Modal */}
      <OcrResultsViewer
        document={selectedDocPreview}
        onClose={() => setSelectedDocPreview(null)}
      />
    </div>
  );
};
