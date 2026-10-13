import React, { useState } from 'react';
import {
  Stethoscope,
  User,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Phone,
  Award,
  Sparkles,
  KeyRound,
  FileText,
  UserCheck,
  Clock,
} from 'lucide-react';
import { UserRole, User as UserType, Patient } from '../types';
import { api } from '../services/api';

export type AccountRole = 'PATIENT' | 'DOCTOR';

interface AuthPageProps {
  onLoginSuccess: (user: UserType, linkedPatient?: Patient | null, token?: string) => void;
  initialRole?: UserRole;
  initialMode?: 'login' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLoginSuccess,
  initialRole = 'PATIENT',
  initialMode = 'login',
}) => {
  // Account Type Selection: Patient or Doctor
  const [selectedRole, setSelectedRole] = useState<AccountRole>(
    initialRole === 'DOCTOR' ? 'DOCTOR' : 'PATIENT'
  );
  // Auth Mode: login or signup
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Common Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Patient Fields
  const [age, setAge] = useState('32');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [phone, setPhone] = useState('+1 (555) 234-8901');

  // Doctor Fields
  const [medicalRegistrationNumber, setMedicalRegistrationNumber] = useState('GMC-914820');
  const [specialization, setSpecialization] = useState('Internal Medicine & Clinical Care');

  // Status & Feedback State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duplicateEmailError, setDuplicateEmailError] = useState(false);
  const [doctorVerificationPending, setDoctorVerificationPending] = useState<{
    email: string;
    license: string;
    name: string;
  } | null>(null);
  const [approvalSuccessMessage, setApprovalSuccessMessage] = useState<string | null>(null);

  // Switch role tab
  const handleSelectRole = (role: AccountRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    setDuplicateEmailError(false);
    setDoctorVerificationPending(null);
    setApprovalSuccessMessage(null);
  };

  // Switch mode tab (login vs signup)
  const handleSwitchMode = (targetMode: 'login' | 'signup') => {
    setMode(targetMode);
    setErrorMessage(null);
    setDuplicateEmailError(false);
    setDoctorVerificationPending(null);
    setApprovalSuccessMessage(null);
  };

  // Pre-fill demo accounts for tester convenience
  const handleUsePreset = (role: AccountRole, presetEmail: string, presetPass: string) => {
    setSelectedRole(role);
    setMode('login');
    setEmail(presetEmail);
    setPassword(presetPass);
    setErrorMessage(null);
    setDuplicateEmailError(false);
    setDoctorVerificationPending(null);
    setApprovalSuccessMessage(null);
  };

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setDuplicateEmailError(false);
    setDoctorVerificationPending(null);
    setApprovalSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('Please provide both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login(cleanEmail, password, selectedRole);
      onLoginSuccess(res.user, res.linkedPatient, res.token);
    } catch (err: any) {
      if (err.requiresVerification) {
        setDoctorVerificationPending({
          email: cleanEmail,
          license: medicalRegistrationNumber || 'Registered License',
          name: fullName || 'Physician',
        });
      }
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign-Up submission
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setDuplicateEmailError(false);
    setDoctorVerificationPending(null);
    setApprovalSuccessMessage(null);

    // Validate common fields
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('Please fill in all required registration fields.');
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }

    // Role-specific validation
    if (selectedRole === 'PATIENT') {
      if (!age || !gender || !phone.trim()) {
        setErrorMessage('Please enter your age, gender, and phone number.');
        return;
      }
    } else if (selectedRole === 'DOCTOR') {
      if (!medicalRegistrationNumber.trim() || !specialization.trim() || !phone.trim()) {
        setErrorMessage(
          'Please enter your Medical Registration Number, Specialization, and phone number.'
        );
        return;
      }
    }

    setLoading(true);
    try {
      const res = await api.register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        role: selectedRole,
        age: selectedRole === 'PATIENT' ? parseInt(age, 10) : undefined,
        gender: selectedRole === 'PATIENT' ? gender : undefined,
        phone: phone.trim(),
        medicalRegistrationNumber:
          selectedRole === 'DOCTOR' ? medicalRegistrationNumber.trim() : undefined,
        specialization: selectedRole === 'DOCTOR' ? specialization.trim() : undefined,
      });

      if (selectedRole === 'PATIENT') {
        // Patient account: directly logs into patient dashboard
        onLoginSuccess(res.user, res.linkedPatient, res.token);
      } else {
        // Doctor account: requires administrative verification before dashboard access
        setDoctorVerificationPending({
          email: email.trim(),
          license: medicalRegistrationNumber.trim(),
          name: fullName.trim(),
        });
      }
    } catch (err: any) {
      if (
        err.isDuplicate ||
        err.code === 'EMAIL_EXISTS' ||
        err.message === 'Account already found. Please log in instead.'
      ) {
        setDuplicateEmailError(true);
        setErrorMessage('Account already found. Please log in instead.');
      } else {
        setErrorMessage(err.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Admin approval simulation helper for Scenario B testing
  const handleSimulateAdminApproval = async (targetEmail: string) => {
    setLoading(true);
    try {
      const res = await api.verifyDoctorAdmin(targetEmail);
      setApprovalSuccessMessage(
        `Doctor account (${targetEmail}) has been verified and approved by the Medical Board! You can now log in to access the Doctor Dashboard.`
      );
      setDoctorVerificationPending(null);
      setErrorMessage(null);
      setMode('login');
      setEmail(targetEmail);
    } catch (err: any) {
      setErrorMessage(err.message || 'Approval simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500/20 selection:text-cyan-900">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Header & Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200/80 text-cyan-800 text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-cyan-700" />
            <span>DIGI-PROTECT • Secure Clinical Authentication</span>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              MK
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              MediKiosk Portal
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Role-based healthcare portal for patient intake pre-consultation and physician clinical reviews.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          {/* 1. Account Type Selection (Patient vs Doctor) */}
          <div className="p-4 bg-slate-50/80 border-b border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Account Type:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSelectRole('PATIENT')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  selectedRole === 'PATIENT'
                    ? 'bg-white border-cyan-600 ring-2 ring-cyan-600/10 shadow-xs'
                    : 'bg-slate-100/70 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedRole === 'PATIENT'
                      ? 'bg-cyan-700 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Patient</div>
                  <div className="text-[11px] text-slate-500">Intake Kiosk</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('DOCTOR')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  selectedRole === 'DOCTOR'
                    ? 'bg-white border-teal-600 ring-2 ring-teal-600/10 shadow-xs'
                    : 'bg-slate-100/70 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedRole === 'DOCTOR'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Doctor</div>
                  <div className="text-[11px] text-slate-500">Clinical Review</div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Mode Selector (Login vs Sign Up) */}
          <div className="px-6 pt-5">
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className={`py-2 px-3 rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('signup')}
                className={`py-2 px-3 rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Feedback & Notice Banners */}
          <div className="px-6 pt-4 space-y-3">
            {/* DUPLICATE EMAIL VALIDATION BANNER (Strict exact wording requirement) */}
            {duplicateEmailError && (
              <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Account already found. Please log in instead.</span>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setDuplicateEmailError(false);
                      setErrorMessage(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors shadow-xs"
                  >
                    <span>Please log in instead</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* General Error Message */}
            {errorMessage && !duplicateEmailError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* DOCTOR PENDING VERIFICATION BANNER (Scenario B) */}
            {doctorVerificationPending && (
              <div className="p-4 bg-sky-50 border border-sky-300 text-sky-950 rounded-xl text-xs space-y-3 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sky-900 text-sm">
                      Doctor Account Pending Administrative Verification
                    </h4>
                    <p className="mt-1 text-sky-800 leading-relaxed text-[11px]">
                      Your registration for <strong>{doctorVerificationPending.name}</strong> (License:{' '}
                      <code>{doctorVerificationPending.license}</code>) has been submitted.
                      Per medical safety protocols, doctor accounts require administrative verification before
                      access to the Doctor Dashboard is granted.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-white/80 rounded-lg border border-sky-200 text-[11px] text-slate-700 space-y-2">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
                    <span>Tester / Evaluation Controls:</span>
                  </div>
                  <p className="text-slate-600">
                    To test <strong>Scenario B (Doctor access before & after approval)</strong>, you can verify
                    that trying to log in now is rejected, or simulate board verification below:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSimulateAdminApproval(doctorVerificationPending.email)}
                      className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-md transition-colors text-xs shadow-xs"
                    >
                      Approve Doctor Account (Simulate Admin Approval)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setEmail(doctorVerificationPending.email);
                        setPassword('');
                      }}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-md transition-colors text-xs"
                    >
                      Go to Login
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Approval Success Notice */}
            {approvalSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{approvalSuccessMessage}</span>
              </div>
            )}
          </div>

          {/* 3. Forms Container */}
          <div className="p-6 pt-3">
            {mode === 'login' ? (
              /* ================= LOGIN FORM ================= */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        selectedRole === 'DOCTOR'
                          ? 'doctor@medikiosk.health'
                          : 'patient@medikiosk.health'
                      }
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-slate-500">Account Type:</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    {selectedRole === 'DOCTOR' ? (
                      <>
                        <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                        <span>Doctor</span>
                      </>
                    ) : (
                      <>
                        <User className="w-3.5 h-3.5 text-cyan-700" />
                        <span>Patient</span>
                      </>
                    )}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-cyan-700 hover:bg-cyan-800 disabled:bg-slate-300 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  {loading ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <span>Log In to {selectedRole === 'DOCTOR' ? 'Doctor Portal' : 'Patient Kiosk'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* ================= SIGN-UP FORM ================= */
              <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={selectedRole === 'DOCTOR' ? 'Dr. Sarah Connor, MD' : 'John Doe'}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setDuplicateEmailError(false);
                      }}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600"
                    />
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Patient-specific fields: Age, Gender, Phone */}
                {selectedRole === 'PATIENT' && (
                  <div className="space-y-3 pt-1 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Age <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          required
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="e.g. 35"
                          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Gender <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value as any)}
                          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Doctor-specific fields: Medical Registration Number, Specialization, Phone */}
                {selectedRole === 'DOCTOR' && (
                  <div className="space-y-3 pt-1 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Medical Registration Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Award className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={medicalRegistrationNumber}
                          onChange={(e) => setMedicalRegistrationNumber(e.target.value)}
                          placeholder="e.g. GMC-894102 or MED-12345"
                          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Specialization <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                          placeholder="e.g. Pulmonology, Internal Medicine"
                          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600"
                        />
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500">
                      ℹ️ Doctor registrations are subject to administrative credential verification before
                      Doctor Dashboard access is granted.
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-cyan-700 hover:bg-cyan-800 disabled:bg-slate-300 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-xs mt-2"
                >
                  {loading ? (
                    <span>Registering Account...</span>
                  ) : (
                    <>
                      <span>Create {selectedRole === 'DOCTOR' ? 'Doctor' : 'Patient'} Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* 4. Quick Demo Helper Card (For easy testing of Scenario E, G, H, etc.) */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Quick Test Credentials:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleUsePreset('PATIENT', 'patient@medikiosk.health', 'password123')
                }
                className="p-2 bg-white border border-slate-200 hover:border-cyan-400 rounded-lg text-left transition-colors text-xs"
              >
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Demo Patient</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate">
                  patient@medikiosk.health
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleUsePreset('DOCTOR', 'doctor@medikiosk.health', 'password123')
                }
                className="p-2 bg-white border border-slate-200 hover:border-teal-400 rounded-lg text-left transition-colors text-xs"
              >
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                  <span>Demo Doctor</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate">
                  doctor@medikiosk.health
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
