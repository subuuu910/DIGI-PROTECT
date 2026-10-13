import React, { useState } from 'react';
import {
  X,
  Stethoscope,
  User,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { UserRole } from '../../types';
import { setStoredAuthToken } from '../../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any, linkedPatient?: any, token?: string) => void;
  onSwitchToRegister?: () => void;
  initialRole?: UserRole;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onSwitchToRegister,
  initialRole = 'DOCTOR',
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [identifier, setIdentifier] = useState(
    initialRole === 'DOCTOR' ? 'doctor@medikiosk.health' : 'patient@medikiosk.health'
  );
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'DOCTOR') {
      setIdentifier('doctor@medikiosk.health');
      setPassword('password123');
    } else {
      setIdentifier('patient@medikiosk.health');
      setPassword('password123');
    }
  };

  const handleQuickLogin = async (presetKey: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/auth/quick-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presetKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Quick login failed');
      if (data.token) setStoredAuthToken(data.token);
      onLoginSuccess(data.user, data.linkedPatient, data.token);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMessage('Please provide both your ID/email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
          role: selectedRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      if (data.token) setStoredAuthToken(data.token);
      onLoginSuccess(data.user, data.linkedPatient, data.token);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              MK
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">MediKiosk Role-Based Sign In</h2>
              <p className="text-[11px] text-slate-500">Secure Healthcare Authentication Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role Selection Tabs */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleRoleTabChange('DOCTOR')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                selectedRole === 'DOCTOR'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-cyan-700" />
              <span>Doctor Portal</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabChange('PATIENT')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                selectedRole === 'PATIENT'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 text-teal-700" />
              <span>Patient Kiosk</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {selectedRole === 'DOCTOR'
                  ? 'Medical License Number or Clinic Email'
                  : 'Patient ID (e.g. MK1024), Email or Phone'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    selectedRole === 'DOCTOR'
                      ? 'GMC-734567 or doctor@medikiosk.health'
                      : 'MK1024 or patient@medikiosk.health'
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm bg-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Passcode / PIN</label>
                <span className="text-[11px] text-slate-400 font-mono">Demo: password123</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter passcode"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm bg-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-cyan-700 hover:bg-cyan-800 disabled:opacity-50 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    Sign In as {selectedRole === 'DOCTOR' ? 'Attending Physician' : 'Patient'}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Sign In Options */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Instant 1-Click Demo Accounts
            </span>

            {selectedRole === 'DOCTOR' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('doctor')}
                  disabled={loading}
                  className="p-2.5 border border-cyan-200 bg-cyan-50/60 hover:bg-cyan-100 rounded-lg text-left transition-colors flex items-start gap-2 text-cyan-950"
                >
                  <Stethoscope className="w-4 h-4 text-cyan-700 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold block text-xs">Dr. Eleanor Vance, MD</span>
                    <span className="text-[10px] text-cyan-800 font-mono">GMC-734567 · Chief Doctor</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('doctor-2')}
                  disabled={loading}
                  className="p-2.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg text-left transition-colors flex items-start gap-2 text-slate-800"
                >
                  <Stethoscope className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold block text-xs">Dr. Arvind Verma, MD</span>
                    <span className="text-[10px] text-slate-500 font-mono">GMC-892144 · Pulmonologist</span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('rahul')}
                  disabled={loading}
                  className="w-full p-2.5 border border-cyan-200 bg-cyan-50/60 hover:bg-cyan-100 rounded-lg text-left transition-colors flex items-center justify-between text-cyan-950"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-cyan-700 shrink-0" />
                    <div>
                      <span className="font-bold text-xs block">Rahul Verma (MK1024)</span>
                      <span className="text-[10px] text-cyan-800">
                        Demo Patient · 3-Day Fever & Penicillin Allergy Conflict
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-cyan-700">Login →</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('anita')}
                  disabled={loading}
                  className="w-full p-2 border border-rose-200 bg-rose-50/40 hover:bg-rose-50 rounded-lg text-left transition-colors flex items-center justify-between text-rose-950"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <div>
                      <span className="font-bold text-xs block">Anita Sharma (MK1025)</span>
                      <span className="text-[10px] text-rose-700">Urgent Priority (Red) · Dyspnea & Chest Tightness</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-rose-700">Login →</span>
                </button>
              </div>
            )}
          </div>

          {/* New Patient Registration Switch */}
          {selectedRole === 'PATIENT' && onSwitchToRegister && (
            <div className="pt-2 text-center text-xs text-slate-500">
              <span>First time at MediKiosk? </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToRegister();
                }}
                className="text-cyan-700 hover:text-cyan-800 font-bold underline"
              >
                Register Intake Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
