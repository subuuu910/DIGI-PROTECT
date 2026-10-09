import React from 'react';

interface FooterProps {
  onNavigate: (view: 'landing' | 'patient' | 'doctor' | 'verify' | 'about') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">MediKiosk</span>
            <span aria-hidden="true">·</span>
            <span>Clinical Information Preparation & E-Prescription</span>
            <span aria-hidden="true">·</span>
            <span>Licensed Physician Oversight</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('landing')} className="hover:text-slate-800 transition-colors">
              Platform
            </button>
            <button onClick={() => onNavigate('about')} className="hover:text-slate-800 transition-colors">
              Clinical Safety
            </button>
            <button onClick={() => onNavigate('verify')} className="hover:text-slate-800 transition-colors">
              Prescription Verification
            </button>
            <button onClick={() => onNavigate('doctor')} className="hover:text-slate-800 transition-colors">
              Doctor Console
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400">
          <p>
            © {new Date().getFullYear()} MediKiosk Systems. All rights reserved. Built for supervised hospital outpatient triage.
          </p>
          <p className="text-[11px]">
            AI outputs are decision-support drafts. Prescribing authority resides strictly with verified physicians.
          </p>
        </div>
      </div>
    </footer>
  );
};
