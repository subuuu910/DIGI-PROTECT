import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  FileText,
  AlertTriangle,
  FileCheck2,
  Clock,
  QrCode,
  CheckCircle2,
  PlayCircle,
  Activity,
  HeartPulse,
} from 'lucide-react';
import { SafetyBanner } from '../components/common/SafetyBanner';

interface LandingPageProps {
  onStartPatient: () => void;
  onOpenDoctor: () => void;
  onOpenVerify: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPatient,
  onOpenDoctor,
  onOpenVerify,
}) => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 pt-10 pb-16 lg:pt-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200/80 text-cyan-900 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
                <span>AI Clinical Information Preparation · Doctor-Supervised</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                  AI-Powered Pre-Consultation for Smarter Care
                </h1>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                  Better information. Better consultations. MediKiosk prepares an evidence-first clinical brief from patient symptoms and uploaded records in under 60 seconds—giving doctors more time for actual care.
                </p>
              </div>

              {/* Safety Motto */}
              <div className="bg-slate-100/80 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-700 shrink-0" />
                <span>
                  <strong className="text-slate-900">Safety Principle:</strong> AI prepares information. Licensed physicians make clinical decisions and authorize prescriptions.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onStartPatient}
                  className="px-6 py-3 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
                >
                  <span>Start Pre-Consultation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onOpenDoctor}
                  className="px-5 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <Stethoscope className="w-4 h-4 text-cyan-700" />
                  <span>Doctor Portal</span>
                </button>
              </div>

              <div className="pt-2 flex items-center gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Speech & Text Intake</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>OCR Document Parsing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>QR E-Prescriptions</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900">
                <img
                  src="/src/assets/images/hero_medikiosk_system_1791477912795.jpg"
                  alt="MediKiosk Clinical Outpatient Terminal"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 sm:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-[11px] font-mono tracking-wider text-cyan-300 uppercase">
                    Terminal Node #03 · Outpatient Reception
                  </span>
                  <p className="text-sm font-bold mt-0.5">
                    Continuous Pre-Consultation & OCR Clinical Ingestion
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step Healthcare Clinical Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs uppercase font-bold tracking-wider text-cyan-800">
            End-To-End Clinical Care Pathway
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            How MediKiosk Transforms the Outpatient Journey
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            From arrival at the kiosk terminal to pharmacy dispensing, information flows safely under strict doctor supervision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 relative shadow-2xs">
            <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
              Step 01
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Patient Consent & Registration</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Patient provides demographics, baseline medical profile, and explicit digital informed consent.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 relative shadow-2xs">
            <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
              Step 02
            </span>
            <h3 className="font-bold text-slate-900 text-sm">AI Adaptive Interview</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Conversational interview via text or voice. Questions adapt dynamically to duration and severity.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 relative shadow-2xs">
            <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
              Step 03
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Document OCR Ingestion</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload past prescriptions or lab panels. OCR extracts medicines, lab values, and past allergies.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 relative shadow-2xs">
            <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
              Step 04
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Clinical Safety Engine</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Flags potential red flags, missing variables, and cross-document contradictions (e.g. penicillin allergy).
            </p>
          </div>

          <div className="bg-white border border-cyan-300 bg-cyan-50/30 rounded-xl p-5 space-y-2 relative shadow-2xs">
            <span className="font-mono text-xs font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded">
              Step 05
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Doctor Authorization & QR Rx</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Doctor reviews the 60s brief, confirms findings, enters treatment, and digitally signs the e-prescription.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs uppercase font-bold tracking-wider text-cyan-800">
            Intelligent Clinical Core
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Eight Safety-Engineered Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Engineered to elevate consultation quality and eliminate critical oversights in outpatient environments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 hover:border-slate-300 transition-colors shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Adaptive AI Interview</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Converses naturally with patients, probing specific onset, severity, and associated symptoms rather than rigid forms.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 hover:border-slate-300 transition-colors shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">OCR Document Extraction</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Parses paper prescriptions and lab reports into structured entities: medications, dosages, lab ranges, and notes.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 hover:border-slate-300 transition-colors shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Red-Flag Detection</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Identifies priority clinical indicators (Green, Amber, Red) with deterministic triage rules to alert physician.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 hover:border-slate-300 transition-colors shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Contradiction Engine</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Correlates past medical records with current intake answers to detect dangerous conflicts, such as forgotten drug allergies.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 hover:border-slate-300 transition-colors shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">60-Second Doctor Brief</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Provides attending physicians with a concise, scannable summary covering chief complaint, duration, meds, and flags.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 hover:border-slate-300 transition-colors shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Doctor Verification Overrides</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Physicians independently edit, confirm, or reject AI extracted information. Doctor verification strictly supersedes AI drafts.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 hover:border-slate-300 transition-colors shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Authorized E-Prescription</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generates legal e-prescriptions only after doctor authorization and digital signature, complete with cryptographic hash.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 hover:border-slate-300 transition-colors shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">QR Code Authentication</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enables pharmacy verification of authenticity and dispensing validity via prescription ID or scannable QR code.
            </p>
          </div>
        </div>
      </section>

      {/* Safety Notice Callout */}
      <section className="max-w-4xl mx-auto px-4">
        <SafetyBanner />
      </section>
    </div>
  );
};
