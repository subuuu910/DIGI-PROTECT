import React from 'react';
import { ShieldAlert, Stethoscope, ArrowLeft, Lock } from 'lucide-react';
import { User } from '../../types';

interface AccessRestrictedProps {
  currentUser: User;
  onOpenDoctorLogin: () => void;
  onReturnToPatient: () => void;
}

export const AccessRestricted: React.FC<AccessRestrictedProps> = ({
  currentUser,
  onOpenDoctorLogin,
  onReturnToPatient,
}) => {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
          <ShieldAlert className="w-8 h-8 text-amber-600" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded">
            Role-Based Access Control Enforced
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Doctor Workspace Restricted to Licensed Physicians
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            The clinical dashboard, priority triage queue, clinical brief verification, and electronic prescription authorization systems require licensed physician credentials.
          </p>
        </div>

        {/* Current User Pill */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs max-w-md mx-auto text-slate-700 flex items-center justify-between">
          <div className="text-left">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Active Session</span>
            <span className="font-bold text-slate-900">{currentUser.name}</span>
            <span className="text-slate-500 block text-[11px]">Role: {currentUser.role} · ID: {currentUser.patientId || currentUser.id}</span>
          </div>
          <span className="px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded font-semibold text-[11px]">
            Patient Portal Active
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onReturnToPatient}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Patient Kiosk</span>
          </button>

          <button
            onClick={onOpenDoctorLogin}
            className="w-full sm:w-auto px-5 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Sign In with Physician Credentials</span>
          </button>
        </div>
      </div>
    </div>
  );
};
