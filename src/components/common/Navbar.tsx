import React from 'react';
import {
  Stethoscope,
  UserCheck,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { UserRole, AppView, User } from '../../types';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  activeRole: UserRole;
  isDoctorApproved?: boolean;
  currentUser?: User | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  activeRole,
  isDoctorApproved = false,
  currentUser,
  onLogout,
}) => {
  const isPatient = activeRole === 'PATIENT';
  const isDoctor = activeRole === 'DOCTOR';
  const isVerifiedDoctor = isDoctor && isDoctorApproved;
  const isUnverifiedDoctor = isDoctor && !isDoctorApproved;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onNavigate('landing')}
          className="text-xl font-bold tracking-tight text-slate-900 hover:text-cyan-800 transition-colors flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            MK
          </div>
          <span>MediKiosk</span>
        </button>

        {/* Zone 2: Role-based Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          {/* 1. Overview — Available to all authenticated roles */}
          <button
            onClick={() => onNavigate('landing')}
            className={`transition-colors hover:text-slate-900 pb-0.5 whitespace-nowrap ${
              currentView === 'landing' ? 'text-cyan-800 border-b-2 border-cyan-700 font-semibold' : ''
            }`}
          >
            Overview
          </button>

          {/* PATIENT TABS:
              1. Overview (above)
              2. Patient Kiosk
              3. Verify Prescription
              4. Safety and System
              5. AI Analysis
              6. My Profile */}
          {isPatient && (
            <>
              {/* 2. Patient Kiosk */}
              <button
                onClick={() => onNavigate('patient')}
                className={`transition-colors hover:text-slate-900 pb-0.5 whitespace-nowrap ${
                  currentView === 'patient' ? 'text-cyan-800 border-b-2 border-cyan-700 font-semibold' : ''
                }`}
              >
                Patient Kiosk
              </button>

              {/* 3. Verify Prescription */}
              <button
                onClick={() => onNavigate('verify')}
                className={`transition-colors hover:text-slate-900 pb-0.5 whitespace-nowrap ${
                  currentView === 'verify' ? 'text-cyan-800 border-b-2 border-cyan-700 font-semibold' : ''
                }`}
              >
                Verify Prescription
              </button>

              {/* 4. Safety and System */}
              <button
                onClick={() => onNavigate('about')}
                className={`transition-colors hover:text-slate-900 pb-0.5 whitespace-nowrap ${
                  currentView === 'about' ? 'text-cyan-800 border-b-2 border-cyan-700 font-semibold' : ''
                }`}
              >
                Safety and System
              </button>

              {/* 5. AI Analysis */}
              <button
                onClick={() => onNavigate('ai-analysis')}
                className={`transition-colors hover:text-slate-900 pb-0.5 whitespace-nowrap ${
                  currentView === 'ai-analysis' ? 'text-cyan-800 border-b-2 border-cyan-700 font-semibold' : ''
                }`}
              >
                AI Analysis
              </button>

              {/* 6. My Profile */}
              <button
                onClick={() => onNavigate('profile')}
                className={`transition-colors hover:text-slate-900 pb-0.5 whitespace-nowrap ${
                  currentView === 'profile' ? 'text-cyan-800 border-b-2 border-cyan-700 font-semibold' : ''
                }`}
              >
                My Profile
              </button>
            </>
          )}

          {/* VERIFIED DOCTOR TABS:
              1. Overview (above)
              2. Doctor Workspace
              3. Patient Queue
              4. Safety and System
              5. My Profile */}
          {isVerifiedDoctor && (
            <>
              {/* 2. Doctor Workspace */}
              <button
                onClick={() => onNavigate('doctor-workspace')}
                className={`transition-colors hover:text-slate-900 pb-0.5 whitespace-nowrap ${
                  currentView === 'doctor-workspace' || currentView === 'doctor'
                    ? 'text-cyan-800 border-b-2 border-cyan-700 font-semibold'
                    : ''
                }`}
              >
                Doctor Workspace
              </button>

              {/* 3. Patient Queue */}
              <button
                onClick={() => onNavigate('doctor-queue')}
                className={`transition-colors hover:text-slate-900 pb-0.5 whitespace-nowrap ${
                  currentView === 'doctor-queue' ? 'text-cyan-800 border-b-2 border-cyan-700 font-semibold' : ''
                }`}
              >
                Patient Queue
              </button>

              {/* 4. Safety and System */}
              <button
                onClick={() => onNavigate('about')}
                className={`transition-colors hover:text-slate-900 pb-0.5 whitespace-nowrap ${
                  currentView === 'about' ? 'text-cyan-800 border-b-2 border-cyan-700 font-semibold' : ''
                }`}
              >
                Safety and System
              </button>

              {/* 5. My Profile */}
              <button
                onClick={() => onNavigate('profile')}
                className={`transition-colors hover:text-slate-900 pb-0.5 whitespace-nowrap ${
                  currentView === 'profile' ? 'text-cyan-800 border-b-2 border-cyan-700 font-semibold' : ''
                }`}
              >
                My Profile
              </button>
            </>
          )}

          {/* UNVERIFIED DOCTOR TABS (No Doctor Workspace or Patient Queue while pending) */}
          {isUnverifiedDoctor && (
            <>
              <button
                onClick={() => onNavigate('about')}
                className={`transition-colors hover:text-slate-900 pb-0.5 whitespace-nowrap ${
                  currentView === 'about' ? 'text-cyan-800 border-b-2 border-cyan-700 font-semibold' : ''
                }`}
              >
                Safety and System
              </button>

              <button
                onClick={() => onNavigate('profile')}
                className={`transition-colors hover:text-slate-900 pb-0.5 whitespace-nowrap ${
                  currentView === 'profile' ? 'text-cyan-800 border-b-2 border-cyan-700 font-semibold' : ''
                }`}
              >
                My Profile
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Authenticated User Badge & Logout (NO role-switching dropdown) */}
        <div className="flex items-center gap-3">
          {/* Unverified Doctor Alert Indicator */}
          {isUnverifiedDoctor && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Verification Pending</span>
            </div>
          )}

          {/* User Profile Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            {isPatient ? (
              <>
                <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-900 truncate max-w-[130px]">
                    {currentUser?.name || 'Patient'}
                  </div>
                  <div className="text-[10px] text-cyan-700 font-semibold">
                    Patient Account
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <Stethoscope className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-900 truncate max-w-[140px]">
                    {currentUser?.name || 'Dr. Eleanor Vance, MD'}
                  </div>
                  <div className="text-[10px] font-semibold">
                    {isVerifiedDoctor ? (
                      <span className="text-emerald-700">Verified Doctor</span>
                    ) : (
                      <span className="text-amber-700">Doctor (Pending)</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Strict Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="End session and return to Login"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
