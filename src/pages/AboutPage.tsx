import React from 'react';
import { ShieldCheck, Lock, AlertTriangle, FileText, CheckCircle2, Stethoscope, Scale } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Clinical Governance & Safety Architecture</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Safety Boundaries, Privacy & Medical Governance
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          MediKiosk is engineered strictly as a clinical decision-support and intake synthesis tool. It adheres to strict healthcare boundary principles ensuring safety and accountability.
        </p>
      </div>

      {/* Safety Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-slate-200 bg-white rounded-xl p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-800 flex items-center justify-center">
            <Scale className="w-5 h-5 text-cyan-700" />
          </div>
          <h2 className="font-bold text-slate-900 text-sm">Non-Autonomous Diagnostic Boundary</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            AI never autonomously diagnoses a medical condition or prescribes medication. Every AI output is explicitly labeled as a <strong>draft for doctor review</strong>. All treatment plans require human clinical review and digital signing by a verified physician.
          </p>
        </div>

        <div className="border border-slate-200 bg-white rounded-xl p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
            <Lock className="w-5 h-5 text-teal-700" />
          </div>
          <h2 className="font-bold text-slate-900 text-sm">Privacy & Least-Privilege Data Access</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Patient health information is treated under stringent role-based access control. Public QR verification endpoints only display authorization metadata, doctor registration, and validity hashes, strictly redacting confidential diagnostic narratives.
          </p>
        </div>

        <div className="border border-slate-200 bg-white rounded-xl p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
          </div>
          <h2 className="font-bold text-slate-900 text-sm">Deterministic Red-Flag Layer</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Clinical safety rules operate alongside language models to guarantee that critical presentations—such as severe dyspnea, suspected sepsis, and drug contraindications—are immediately flagged as priority review items rather than suppressed.
          </p>
        </div>

        <div className="border border-slate-200 bg-white rounded-xl p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <FileText className="w-5 h-5 text-emerald-700" />
          </div>
          <h2 className="font-bold text-slate-900 text-sm">Comprehensive Regulatory Audit Trail</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every clinical action—including intake registration, digital consent, OCR extraction, doctor edits, contradiction resolution, and electronic prescription signing—is permanently recorded in an immutable audit log.
          </p>
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-2 text-xs text-slate-600">
        <h3 className="font-bold text-slate-900 text-sm">Prototype & Regulatory Context</h3>
        <p className="leading-relaxed">
          MediKiosk is intended for supervised hospital outpatient triage, clinical care facilities, and telemedicine intake. Clinical scenarios are pre-loaded to demonstrate the full clinical workflow, contradiction detection, and doctor authorization cycle.
        </p>
      </div>
    </div>
  );
};
