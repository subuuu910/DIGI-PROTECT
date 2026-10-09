import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface SafetyBannerProps {
  compact?: boolean;
}

export const SafetyBanner: React.FC<SafetyBannerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-slate-100/90 border border-slate-200/80 px-3 py-1.5 rounded-md flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-700 shrink-0" />
          <span>
            <strong className="font-semibold text-slate-800">Medical Safety Protocol:</strong> AI generates structured draft information for doctor review. AI does not diagnose or prescribe independently.
          </span>
        </div>
        <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">Final Clinical Authorization Required</span>
      </div>
    );
  }

  return (
    <aside
      aria-label="Clinical Safety Advisory"
      className="bg-amber-50/70 border border-amber-200/90 rounded-lg p-3 sm:p-4 mb-5 text-xs sm:text-sm text-amber-900 flex items-start gap-3"
    >
      <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="font-semibold text-amber-950">
          Supervised Clinical Boundary & Non-Autonomous Diagnostic Notice
        </p>
        <p className="text-amber-900/90 leading-relaxed text-xs">
          MediKiosk is an AI-assisted pre-consultation and clinical information structuring system. All extracted symptoms, OCR entities, red-flag alerts, and summaries represent <strong>draft data for licensed physician review</strong>. The attending doctor remains the sole clinical decision-maker and must independently confirm findings before approving treatment plans or authorizing prescriptions.
        </p>
      </div>
    </aside>
  );
};
