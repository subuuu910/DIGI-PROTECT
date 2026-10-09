import React from 'react';
import { Stethoscope, UserCheck, QrCode, PlayCircle, RotateCcw } from 'lucide-react';
import { UserRole } from '../../types';

interface NavbarProps {
  currentView: 'landing' | 'patient' | 'doctor' | 'verify' | 'about';
  onNavigate: (view: 'landing' | 'patient' | 'doctor' | 'verify' | 'about') => void;
  activeRole: UserRole;
  onRoleSwitch: (role: UserRole) => void;
  onLaunchDemo: () => void;
  onResetDemoToDefault?: () => void;
  isDemoActive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  activeRole,
  onRoleSwitch,
  onLaunchDemo,
  onResetDemoToDefault,
  isDemoActive = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => onNavigate('landing')}
          className="text-xl font-bold tracking-tight text-slate-900 hover:text-cyan-800 transition-colors flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            MK
          </div>
          <span>MediKiosk</span>
        </button>

        {/* Zone 2: 4-6 Text Navigation Links with subtle active state */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('landing')}
            className={`transition-colors hover:text-slate-900 pb-0.5 whitespace-nowrap ${
              currentView === 'landing' ? 'text-cyan-800 border-b-2 border-cyan-700 font-semibold' : ''
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('patient')}
            className={`transition-colors hover:text-slate-900 pb-0.5 whitespace-nowrap ${
              currentView === 'patient' ? 'text-cyan-800 border-b-2 border-cyan-700 font-semibold' : ''
            }`}
          >
            Patient Kiosk
          </button>
          <button
            onClick={() => onNavigate('doctor')}
            className={`transition-colors hover:text-slate-900 pb-0.5 whitespace-nowrap ${
              currentView === 'doctor' ? 'text-cyan-800 border-b-2 border-cyan-700 font-semibold' : ''
            }`}
          >
            Doctor Workspace
          </button>
          <button
            onClick={() => onNavigate('verify')}
            className={`transition-colors hover:text-slate-900 pb-0.5 whitespace-nowrap ${
              currentView === 'verify' ? 'text-cyan-800 border-b-2 border-cyan-700 font-semibold' : ''
            }`}
          >
            Verify Prescription
          </button>
          <button
            onClick={() => onNavigate('about')}
            className={`transition-colors hover:text-slate-900 pb-0.5 whitespace-nowrap ${
              currentView === 'about' ? 'text-cyan-800 border-b-2 border-cyan-700 font-semibold' : ''
            }`}
          >
            Safety & System
          </button>
        </nav>

        {/* Zone 3: 1-2 Primary Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Demo Actions */}
          {isDemoActive ? (
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={onLaunchDemo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap border text-cyan-900 bg-cyan-50 border-cyan-300 hover:bg-cyan-100"
                title="View active demo scenario (preserves all your queries and notes across website refresh)"
              >
                <PlayCircle className="w-3.5 h-3.5 text-cyan-700" />
                <span>Demo (Rahul)</span>
              </button>
              {onResetDemoToDefault && (
                <button
                  onClick={onResetDemoToDefault}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap"
                  title="Reset demo data back to default initial state (clears new queries)"
                >
                  <RotateCcw className="w-3 h-3 text-slate-500" />
                  <span>Reset to Default</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onLaunchDemo}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-800 bg-cyan-50 border border-cyan-200/80 rounded-md hover:bg-cyan-100 transition-colors whitespace-nowrap"
              title="Load the pre-configured Rahul (MK1024) full clinical scenario"
            >
              <PlayCircle className="w-3.5 h-3.5 text-cyan-700" />
              <span>Load Demo (Rahul)</span>
            </button>
          )}

          {/* Role Toggle Switcher */}
          <div className="flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium">
            <button
              onClick={() => onRoleSwitch('PATIENT')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap flex items-center gap-1 ${
                activeRole === 'PATIENT'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-cyan-700" />
              <span>Patient</span>
            </button>
            <button
              onClick={() => onRoleSwitch('DOCTOR')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap flex items-center gap-1 ${
                activeRole === 'DOCTOR'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
              <span>Doctor</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
