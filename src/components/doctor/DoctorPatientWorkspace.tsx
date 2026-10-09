import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  HelpCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Pill,
  ShieldAlert,
  Edit3,
  ExternalLink,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
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
} from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { DoctorPrescriptionBuilder } from './DoctorPrescriptionBuilder';
import { TimelineView } from '../patient/TimelineView';
import { AuditLogViewer } from './AuditLogViewer';

interface DoctorPatientWorkspaceProps {
  patient: Patient;
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
  onSelectDocPreview: (doc: MedicalDocument) => void;
  loading: boolean;
}

export const DoctorPatientWorkspace: React.FC<DoctorPatientWorkspaceProps> = ({
  patient,
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
  onSelectDocPreview,
  loading,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'brief'
    | 'facts'
    | 'redflags'
    | 'contradictions'
    | 'missing'
    | 'documents'
    | 'timeline'
    | 'prescription'
    | 'audit'
  >('brief');

  const [doctorImpression, setDoctorImpression] = useState(
    brief?.clinicalImpressionDraft || 'Acute lower respiratory symptoms requiring clinical review.'
  );
  const [contraResolutionText, setContraResolutionText] = useState(
    'Clarified verbally with patient: Confirmed previous adverse cutaneous reaction to Amoxicillin. Marked Penicillin allergy as active in clinical profile. Macrolide or non-beta-lactam prescribed.'
  );
  const [editingFactId, setEditingFactId] = useState<string | null>(null);
  const [factNoteInput, setFactNoteInput] = useState('');

  const unresolvedContradictions = contradictions.filter((c) => !c.resolved);

  return (
    <div className="space-y-6">
      {/* Patient Clinical Profile Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyan-700 text-white font-bold flex items-center justify-center text-lg shadow-xs">
            {patient.fullName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-900">{patient.fullName}</h2>
              <span className="font-mono text-xs text-slate-500 font-medium">ID: {patient.patientId}</span>
              <StatusBadge priority={patient.priority} />
              <StatusBadge status={patient.status} />
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
              <span>{patient.age} y/o</span>
              <span aria-hidden="true">·</span>
              <span>{patient.gender}</span>
              <span aria-hidden="true">·</span>
              <span>DOB: <span className="font-mono tabular-nums">{patient.dob}</span></span>
              <span aria-hidden="true">·</span>
              <span>Phone: <span className="font-mono tabular-nums">{patient.phone}</span></span>
              <span aria-hidden="true">·</span>
              <span>Registered: <span className="font-mono tabular-nums">{new Date(patient.registeredAt).toLocaleDateString()}</span></span>
            </div>
          </div>
        </div>

        {/* Priority & Quick Actions */}
        <div className="flex items-center gap-3">
          {unresolvedContradictions.length > 0 && (
            <button
              onClick={() => setActiveTab('contradictions')}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-md text-xs font-semibold flex items-center gap-1.5 animate-pulse"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>{unresolvedContradictions.length} Contradiction Needs Resolution</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('prescription')}
            className="px-4 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-md text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Prescription & Treatment</span>
          </button>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('brief')}
          className={`px-3.5 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'brief'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-cyan-700" />
          <span>60-Second Doctor Brief</span>
        </button>

        <button
          onClick={() => setActiveTab('facts')}
          className={`px-3.5 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'facts'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
          <span>Evidence & Verified Facts ({facts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('redflags')}
          className={`px-3.5 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'redflags'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
          <span>Red Flags ({redFlags.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contradictions')}
          className={`px-3.5 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'contradictions'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Contradictions ({contradictions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('missing')}
          className={`px-3.5 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'missing'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-blue-700" />
          <span>Missing Info ({missingInfo.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-3.5 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'documents'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-slate-700" />
          <span>Documents & OCR ({documents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-3.5 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'timeline'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-slate-700" />
          <span>Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('prescription')}
          className={`px-3.5 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'prescription'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Pill className="w-3.5 h-3.5 text-emerald-700" />
          <span>E-Prescription</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-slate-700" />
          <span>Audit Log</span>
        </button>
      </div>

      {/* TAB CONTENT: 1. 60-SECOND DOCTOR BRIEF */}
      {activeTab === 'brief' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    60-Second Clinical Triage Brief
                  </h3>
                  <span className="text-xs bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded font-semibold">
                    AI-Synthesized Draft · Doctor Review Required
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Designed for 60-second scanning prior to face-to-face or video consultation.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onConfirmBrief(doctorImpression)}
                  disabled={loading}
                  className="px-4 py-1.5 bg-cyan-700 hover:bg-cyan-800 disabled:opacity-50 text-white rounded-md text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>
                    {brief?.doctorReviewed ? 'Confirmed by Doctor' : 'Confirm & Validate Brief'}
                  </span>
                </button>
              </div>
            </div>

            {/* Structured Brief Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Chief Complaint & Symptoms */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-2">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                  Chief Complaint & Duration
                </span>
                <p className="text-sm font-semibold text-slate-900">
                  {brief?.chiefComplaint || patient.fullName}
                </p>
                <p className="text-slate-600">
                  <strong>Duration:</strong> {brief?.duration || '3 days acute onset'}
                </p>
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">Extracted Symptoms:</span>
                  <ul className="space-y-1 text-slate-700">
                    {brief?.currentSymptoms.map((symp, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-cyan-700">•</span>
                        <span>{symp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Medical History & Current Meds */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
                <div>
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-1">
                    Relevant Medical History
                  </span>
                  <p className="text-slate-700">
                    {brief?.relevantHistory.join(', ') || 'Mild Asthma with occasional bronchodilator use'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-1">
                    Current Medications (Intake & Records)
                  </span>
                  <p className="text-slate-700">
                    {brief?.currentMedicines.join(', ') || 'Salbutamol Inhaler, Paracetamol 650mg'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 bg-rose-50/80 p-2.5 rounded border border-rose-200">
                  <span className="font-bold text-rose-950 uppercase tracking-wider text-[11px] block mb-0.5">
                    Critical Allergies Flag
                  </span>
                  <p className="text-rose-900 font-medium">
                    {brief?.allergies[0] || 'Penicillin allergy recorded in past records'}
                  </p>
                </div>
              </div>

              {/* Potential Red Flags */}
              <div className="border border-amber-200 bg-amber-50/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 uppercase tracking-wider text-[11px]">
                    Potential Red Flags ({redFlags.length})
                  </span>
                  <span className="text-[11px] font-semibold text-amber-800">
                    Priority Review Required
                  </span>
                </div>
                <div className="space-y-1.5">
                  {redFlags.map((rf) => (
                    <div key={rf.id} className="text-slate-800 text-[11px]">
                      <p className="font-semibold text-amber-950">• {rf.title}</p>
                      <p className="text-slate-600 pl-2.5">{rf.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contradictions & Missing Info */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      Detected Contradictions ({contradictions.length})
                    </span>
                    <button
                      onClick={() => setActiveTab('contradictions')}
                      className="text-cyan-700 hover:text-cyan-800 font-semibold text-[11px]"
                    >
                      Resolve in Tab →
                    </button>
                  </div>
                  {contradictions.map((contra) => (
                    <div key={contra.id} className="text-[11px] text-slate-700">
                      <p className="font-semibold text-amber-900">• {contra.title}</p>
                      <p className="text-slate-500 pl-2.5">
                        Status: {contra.resolved ? 'Resolved by Doctor' : 'Pending Resolution'}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-1">
                    Missing Information Variables
                  </span>
                  <div className="space-y-1 text-[11px]">
                    {missingInfo.map((mi) => (
                      <p key={mi.id} className="text-slate-700">
                        • <strong>{mi.field}:</strong> {mi.resolvedValue || mi.suggestedFollowUpQuestion}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Clinical Impression & Notes */}
            <div className="border-t border-slate-200 pt-4 space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Attending Physician Clinical Impression & Evaluation
              </label>
              <textarea
                rows={3}
                value={doctorImpression}
                onChange={(e) => setDoctorImpression(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg text-xs leading-relaxed font-normal bg-white"
                placeholder="Doctor can edit or override the AI draft impression..."
              />
              <p className="text-[11px] text-slate-500">
                Doctor edits will override the AI draft and be recorded into the patient consultation audit log.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. EVIDENCE & VERIFIED FACTS */}
      {activeTab === 'facts' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Evidence-First Extracted Clinical Facts
              </h3>
              <p className="text-xs text-slate-500">
                Every extracted medical fact is traceable to a specific interview turn or uploaded document page.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {facts.filter((f) => f.verifiedByDoctor).length} / {facts.length} Verified
            </span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {facts.map((fact) => (
              <div
                key={fact.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  fact.isContradicted
                    ? 'bg-amber-50/40 hover:bg-amber-50/70'
                    : fact.verifiedByDoctor
                    ? 'bg-white hover:bg-slate-50/50'
                    : 'bg-slate-50/40'
                }`}
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="uppercase text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {fact.category}
                    </span>
                    {fact.verifiedByDoctor ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Doctor Verified
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        AI Draft
                      </span>
                    )}
                    {fact.isContradicted && (
                      <span className="text-[11px] text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-semibold">
                        Contradiction Flagged
                      </span>
                    )}
                  </div>

                  <p className="font-semibold text-slate-900 text-xs sm:text-sm">{fact.fact}</p>

                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <span>Source: {fact.sourceName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-cyan-800">{fact.sourceReference}</span>
                  </div>

                  {fact.doctorNotes && (
                    <p className="text-[11px] text-slate-700 italic pt-1">
                      Doctor Note: {fact.doctorNotes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                  <button
                    onClick={() => onVerifyFact(fact.id, !fact.verifiedByDoctor)}
                    disabled={loading}
                    className={`px-3 py-1 rounded text-xs font-semibold border transition-colors ${
                      fact.verifiedByDoctor
                        ? 'border-slate-300 text-slate-700 hover:bg-slate-50'
                        : 'bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800'
                    }`}
                  >
                    {fact.verifiedByDoctor ? 'Mark Unverified' : 'Confirm Fact'}
                  </button>

                  <button
                    onClick={() => {
                      setEditingFactId(fact.id);
                      setFactNoteInput(fact.doctorNotes || '');
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 border border-slate-200 rounded"
                    title="Add doctor note"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editingFactId && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="font-bold text-xs text-slate-800">
                Add / Edit Physician Clinical Annotation for Fact:
              </span>
              <input
                type="text"
                value={factNoteInput}
                onChange={(e) => setFactNoteInput(e.target.value)}
                placeholder="Enter doctor note to associate with this medical fact..."
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingFactId(null)}
                  className="px-3 py-1 text-xs border border-slate-300 rounded text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await onVerifyFact(editingFactId, true, factNoteInput);
                    setEditingFactId(null);
                  }}
                  className="px-3 py-1 text-xs bg-cyan-700 text-white rounded font-semibold hover:bg-cyan-800"
                >
                  Save Note
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 3. RED FLAGS */}
      {activeTab === 'redflags' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Potential Red Flags & Risk Assessment
            </h3>
            <p className="text-xs text-slate-500">
              Deterministic safety rules combined with AI-assisted clinical triage. Red flags are warnings, NOT confirmed diagnoses.
            </p>
          </div>

          <div className="space-y-3">
            {redFlags.map((flag) => (
              <div
                key={flag.id}
                className="border border-amber-200 bg-amber-50/50 rounded-lg p-4 space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-amber-200/60 text-amber-950 font-mono">
                      {flag.level}
                    </span>
                    <h4 className="font-bold text-amber-950 text-xs sm:text-sm">{flag.title}</h4>
                  </div>
                  {flag.acknowledgedByDoctor ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Doctor Acknowledged
                    </span>
                  ) : (
                    <button
                      onClick={() => onAcknowledgeRedFlag(flag.id)}
                      disabled={loading}
                      className="px-3 py-1 bg-amber-800 hover:bg-amber-900 text-white font-semibold rounded text-xs transition-colors self-start sm:self-auto"
                    >
                      Acknowledge Flag
                    </button>
                  )}
                </div>

                <p className="text-slate-700 leading-relaxed">{flag.description}</p>
                <div className="pt-2 border-t border-amber-200 text-amber-900 font-semibold">
                  <span>Clinical Recommendation:</span> {flag.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. CONTRADICTIONS */}
      {activeTab === 'contradictions' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Cross-Document & Interview Contradictions
            </h3>
            <p className="text-xs text-slate-500">
              Identifies conflicting statements between previous medical records and current intake interview.
            </p>
          </div>

          <div className="space-y-4">
            {contradictions.map((contra) => (
              <div
                key={contra.id}
                className={`border rounded-lg p-4 space-y-3 text-xs ${
                  contra.resolved
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-amber-300 bg-amber-50/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-bold text-amber-950 text-xs sm:text-sm">{contra.title}</h4>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                      contra.resolved
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                  >
                    {contra.resolved ? 'Resolved by Doctor' : 'Action Required: Doctor Verification'}
                  </span>
                </div>

                {/* Conflict Compare Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border border-slate-200 bg-white rounded p-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Previous Record Statement
                    </span>
                    <p className="font-semibold text-slate-900">{contra.itemA.statement}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Source: {contra.itemA.source} ({contra.itemA.date})
                    </p>
                  </div>

                  <div className="border border-slate-200 bg-white rounded p-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Current Intake Response
                    </span>
                    <p className="font-semibold text-slate-900">{contra.itemB.statement}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Source: {contra.itemB.source} ({contra.itemB.date})
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-slate-700">
                  <span className="font-bold text-slate-900">Required Physician Action:</span>{' '}
                  {contra.resolutionRequired}
                </div>

                {/* Resolution Controls */}
                {!contra.resolved ? (
                  <div className="pt-2 border-t border-amber-200 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Physician Resolution & Patient Clarification
                    </label>
                    <textarea
                      rows={2}
                      value={contraResolutionText}
                      onChange={(e) => setContraResolutionText(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                      placeholder="Explain how the conflict was resolved with patient..."
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => onResolveContradiction(contra.id, contraResolutionText)}
                        disabled={loading}
                        className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Resolution & Mark Cleared</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200 text-[11px] text-emerald-950">
                    <span className="font-bold">Doctor Resolution:</span> {contra.doctorResolution}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. MISSING INFO */}
      {activeTab === 'missing' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Missing Information Detection</h3>
            <p className="text-xs text-slate-500">
              Crucial clinical fields not captured during preliminary intake that require verification during consultation.
            </p>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {missingInfo.map((mi) => (
              <div key={mi.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{mi.field}</span>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      Captured at Triage Kiosk
                    </span>
                  </div>
                  <p className="text-slate-600">
                    <strong>Clinical Significance:</strong> {mi.clinicalSignificance}
                  </p>
                  {mi.resolvedValue && (
                    <p className="text-cyan-900 font-semibold pt-0.5">
                      Recorded Value: {mi.resolvedValue}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 6. DOCUMENTS & OCR */}
      {activeTab === 'documents' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Uploaded Documents & OCR Evidence</h3>
            <p className="text-xs text-slate-500">
              Inspect original medical stationery, prescriptions, and laboratory panels alongside OCR streams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start gap-4 text-xs"
              >
                <div className="w-20 h-24 bg-slate-200 rounded-md overflow-hidden shrink-0 border border-slate-200">
                  <img
                    src={doc.thumbnailUrl}
                    alt={doc.fileName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-bold text-slate-900 truncate">{doc.fileName}</p>
                  <p className="text-slate-500 text-[11px]">
                    {doc.fileType.replace('_', ' ')} · {doc.fileSize}
                  </p>
                  <span className="inline-block text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    OCR Processed
                  </span>
                  <div className="pt-2">
                    <button
                      onClick={() => onSelectDocPreview(doc)}
                      className="text-cyan-700 hover:text-cyan-800 font-semibold text-xs flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Inspect Raw OCR & Entities</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 7. TIMELINE */}
      {activeTab === 'timeline' && <TimelineView timeline={timeline} />}

      {/* TAB CONTENT: 8. TREATMENT & E-PRESCRIPTION */}
      {activeTab === 'prescription' && (
        <DoctorPrescriptionBuilder
          prescription={prescription}
          onUpdateDraft={onUpdatePrescriptionDraft}
          onAuthorize={onAuthorizePrescription}
          loading={loading}
          hasUnresolvedContradictions={unresolvedContradictions.length > 0}
        />
      )}

      {/* TAB CONTENT: 9. AUDIT LOG */}
      {activeTab === 'audit' && <AuditLogViewer logs={auditLogs} />}
    </div>
  );
};
