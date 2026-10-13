import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Sparkles,
  FileBadge,
  Activity,
  KeyRound,
} from 'lucide-react';
import { api } from '../../services/api';
import { User, SignUpPatientData, SignUpDoctorData } from '../../types';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sign up form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState<string>('34');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [doctorLicense, setDoctorLicense] = useState('');
  const [doctorSpecialty, setDoctorSpecialty] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Email duplicate state (exact required message)
  const [emailDuplicateError, setEmailDuplicateError] = useState<string | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // OTP state
  const [otpStep, setOtpStep] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'sms'>('email');
  const [ticketId, setTicketId] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState<number>(0);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [otpAttemptsLeft, setOtpAttemptsLeft] = useState<number>(5);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Generic errors
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpLoading, setSignUpLoading] = useState(false);

  // Cooldown countdown effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Check email uniqueness on blur
  const handleEmailBlur = async () => {
    if (!email || !email.includes('@')) return;
    try {
      setCheckingEmail(true);
      setEmailDuplicateError(null);
      const res = await api.checkEmail(email.trim());
      if (res.exists) {
        setEmailDuplicateError('Account already found. Please log in instead.');
      }
    } catch {
      // ignore
    } finally {
      setCheckingEmail(false);
    }
  };

  // Quick-fill test credentials
  const handleQuickFill = async (type: 'patient' | 'doctor_verified' | 'doctor_unverified') => {
    setLoginError(null);
    let fillEmail = '';
    let fillPass = '';
    if (type === 'patient') {
      fillEmail = 'patient@medikiosk.health';
      fillPass = 'Patient@123';
    } else if (type === 'doctor_verified') {
      fillEmail = 'e.vance@medikiosk.health';
      fillPass = 'Doctor@123';
    } else {
      fillEmail = 'j.hayes@medikiosk.health';
      fillPass = 'Doctor@123';
    }
    setLoginEmail(fillEmail);
    setLoginPassword(fillPass);
    setLoginLoading(true);
    try {
      const res = await api.login({ email: fillEmail, password: fillPass });
      if (res.success && res.user) {
        onAuthSuccess(res.user);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Please enter both email address and password.');
      return;
    }

    try {
      setLoginLoading(true);
      const res = await api.login({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      if (res.success && res.user) {
        onAuthSuccess(res.user);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Sign up handler
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);
    setEmailDuplicateError(null);

    // Validation
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      setSignUpError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setSignUpError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (password.length < 6) {
      setSignUpError('Password must be at least 6 characters long.');
      return;
    }

    if (role === 'PATIENT') {
      if (!age || parseInt(age, 10) <= 0) {
        setSignUpError('Please provide a valid age.');
        return;
      }
    } else if (role === 'DOCTOR') {
      if (!doctorLicense.trim()) {
        setSignUpError('Medical Registration Number is required for doctor accounts.');
        return;
      }
      if (!doctorSpecialty.trim()) {
        setSignUpError('Medical Specialization is required for doctor accounts.');
        return;
      }
    }

    try {
      setSignUpLoading(true);

      const payload: any = {
        role,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirmPassword,
        deliveryMethod,
      };

      if (role === 'PATIENT') {
        payload.age = parseInt(age, 10);
        payload.gender = gender;
      } else {
        payload.doctorLicense = doctorLicense.trim();
        payload.doctorSpecialty = doctorSpecialty.trim();
      }

      const res = await api.signUp(payload);

      if (res.success) {
        setTicketId(res.ticketId);
        setDemoOtp(res.demoOtp);
        setOtpExpiresAt(res.expiresAt);
        setResendCooldown(30);
        setOtpAttemptsLeft(5);
        setOtpStep(true);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Account already found')) {
        setEmailDuplicateError('Account already found. Please log in instead.');
      } else {
        setSignUpError(err.message || 'Sign up failed. Please try again.');
      }
    } finally {
      setSignUpLoading(false);
    }
  };

  // OTP Verification handler
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (!otpInput.trim()) {
      setOtpError('Please enter the 6-digit OTP.');
      return;
    }

    try {
      setOtpLoading(true);
      const res = await api.verifyOtp(ticketId, otpInput.trim());
      if (res.success && res.user) {
        onAuthSuccess(res.user);
      }
    } catch (err: any) {
      setOtpError(err.message || 'Invalid or expired OTP.');
      setOtpAttemptsLeft((prev) => Math.max(0, prev - 1));
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      setOtpError(null);
      setOtpLoading(true);
      const res = await api.resendOtp(ticketId, deliveryMethod);
      if (res.success) {
        setDemoOtp(res.demoOtp);
        setOtpExpiresAt(res.expiresAt);
        setResendCooldown(res.cooldownSeconds || 30);
        setOtpAttemptsLeft(5);
        setOtpInput('');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Failed to resend OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-lg w-full mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>MediKiosk Clinical Outpatient System</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Secure Authentication Portal
          </h1>
          <p className="text-sm text-slate-300">
            Sign in or register as a patient or doctor to access authorized clinical features.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 p-6 sm:p-8">
          {/* OTP STEP */}
          {otpStep ? (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-100 text-cyan-700 mx-auto">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Verify One-Time Password (OTP)
                </h2>
                <p className="text-xs text-slate-600">
                  Account verification is required before activating your{' '}
                  <span className="font-semibold text-slate-800">
                    {role === 'DOCTOR' ? 'Doctor' : 'Patient'}
                  </span>{' '}
                  account.
                </p>
              </div>

              {/* Delivery channel selector */}
              <div className="bg-slate-100 p-1 rounded-lg grid grid-cols-2 gap-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('email')}
                  className={`py-2 rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                    deliveryMethod === 'email'
                      ? 'bg-white text-cyan-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('sms')}
                  className={`py-2 rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                    deliveryMethod === 'sms'
                      ? 'bg-white text-cyan-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Mobile OTP</span>
                </button>
              </div>

              {/* MANDATORY DEMO OTP BOX */}
              <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl p-4 text-center space-y-1.5">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Development & Demo Mode</span>
                </div>
                <div className="text-xs text-amber-800 font-medium">
                  {deliveryMethod === 'email' ? 'Selected channel: Email' : 'Selected channel: Mobile SMS'}
                </div>
                <div className="py-2">
                  <span className="text-xs text-slate-600 block mb-1">Your Demo OTP:</span>
                  <span className="font-mono text-3xl font-black text-cyan-900 tracking-widest bg-white px-4 py-1.5 rounded-lg border border-amber-200 shadow-2xs inline-block">
                    {demoOtp || '483921'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-700 leading-snug">
                  * Live email/SMS delivery is bypassed for this demo. Enter the real generated OTP above to activate your account.
                </p>
              </div>

              {/* OTP Form */}
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Enter 6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full px-4 py-3 text-center font-mono text-2xl tracking-widest bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-600 focus:bg-white text-slate-900 placeholder:text-slate-400 placeholder:tracking-normal placeholder:text-sm"
                    autoFocus
                  />
                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
                    <span>Attempts left: {otpAttemptsLeft}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Expires in 5 minutes
                    </span>
                  </div>
                </div>

                {otpError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{otpError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={otpLoading || otpInput.length < 6}
                  className="w-full py-3 bg-cyan-700 hover:bg-cyan-800 disabled:opacity-50 text-white font-semibold rounded-lg text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  {otpLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Verify & Activate Account</span>
                </button>
              </form>

              {/* Resend and Back controls */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || otpLoading}
                  className="text-cyan-700 hover:text-cyan-900 font-semibold disabled:text-slate-400 flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>
                    {resendCooldown > 0
                      ? `Resend OTP in ${resendCooldown}s`
                      : 'Resend New OTP'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpStep(false);
                    setOtpError(null);
                  }}
                  className="text-slate-500 hover:text-slate-800"
                >
                  Back to Registration
                </button>
              </div>
            </div>
          ) : (
            /* LOGIN / SIGN UP TABS & FORMS */
            <div className="space-y-6">
              {/* Mode Toggle: Login vs Sign Up */}
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setSignUpError(null);
                    setLoginError(null);
                    setEmailDuplicateError(null);
                  }}
                  className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors ${
                    mode === 'login'
                      ? 'border-cyan-700 text-cyan-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setSignUpError(null);
                    setLoginError(null);
                    setEmailDuplicateError(null);
                  }}
                  className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors ${
                    mode === 'signup'
                      ? 'border-cyan-700 text-cyan-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Create Account (Sign Up)
                </button>
              </div>

              {/* ======================================================== */}
              {/* LOGIN FORM */}
              {/* ======================================================== */}
              {mode === 'login' ? (
                <div className="space-y-5">
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="doctor@medikiosk.health or patient@medikiosk.health"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-600"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-600"
                          required
                        />
                      </div>
                    </div>

                    {loginError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full py-2.5 bg-cyan-700 hover:bg-cyan-800 disabled:opacity-50 text-white font-semibold rounded-lg text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {loginLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                      <span>Sign In to Account</span>
                    </button>
                  </form>

                  {/* Fast Demo Accounts Quick Fill */}
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Quick Evaluation Test Accounts
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickFill('patient')}
                        className="p-2 text-left bg-slate-50 hover:bg-cyan-50/70 border border-slate-200 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 group-hover:text-cyan-800">
                          <UserCheck className="w-3.5 h-3.5 text-cyan-600" />
                          <span>Patient</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">patient@medikiosk.health</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickFill('doctor_verified')}
                        className="p-2 text-left bg-slate-50 hover:bg-teal-50/70 border border-slate-200 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 group-hover:text-teal-800">
                          <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                          <span>Verified Doctor</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">Dr. Vance · MD</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickFill('doctor_unverified')}
                        className="p-2 text-left bg-slate-50 hover:bg-amber-50/70 border border-slate-200 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 group-hover:text-amber-800">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pending Doctor</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">Dr. Hayes (Pending)</div>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ======================================================== */
                /* SIGN UP FORM (PATIENT OR DOCTOR) */
                /* ======================================================== */
                <div className="space-y-5">
                  {/* Account Type Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Select Account Type:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setRole('PATIENT');
                          setEmailDuplicateError(null);
                        }}
                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                          role === 'PATIENT'
                            ? 'bg-cyan-50/80 border-cyan-600 ring-2 ring-cyan-600/20 text-cyan-950'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            role === 'PATIENT'
                              ? 'bg-cyan-700 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">1. Patient</div>
                          <div className="text-[11px] text-slate-500">
                            Intake, Kiosk, Rx check
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRole('DOCTOR');
                          setEmailDuplicateError(null);
                        }}
                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                          role === 'DOCTOR'
                            ? 'bg-teal-50/80 border-teal-600 ring-2 ring-teal-600/20 text-teal-950'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            role === 'DOCTOR'
                              ? 'bg-teal-700 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">2. Doctor</div>
                          <div className="text-[11px] text-slate-500">
                            Workspace & Verification
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Duplicate Email Warning (Exact required string) */}
                  {emailDuplicateError && (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="font-semibold">{emailDuplicateError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginEmail(email);
                          setMode('login');
                          setEmailDuplicateError(null);
                        }}
                        className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded text-xs transition-colors shrink-0"
                      >
                        Go to Log In
                      </button>
                    </div>
                  )}

                  {/* Sign Up Fields Form */}
                  <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={role === 'DOCTOR' ? 'Dr. John Doe, MD' : 'Jane Doe'}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-600"
                          required
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (emailDuplicateError) setEmailDuplicateError(null);
                          }}
                          onBlur={handleEmailBlur}
                          placeholder="user@example.com"
                          className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-600 ${
                            emailDuplicateError ? 'border-amber-400 bg-amber-50/40' : 'border-slate-300'
                          }`}
                          required
                        />
                      </div>
                      {checkingEmail && (
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Checking account availability...
                        </span>
                      )}
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 555-0199"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-600"
                          required
                        />
                      </div>
                    </div>

                    {/* PATIENT-SPECIFIC FIELDS */}
                    {role === 'PATIENT' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Age *
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={125}
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-600"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Gender *
                          </label>
                          <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value as any)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-600"
                            required
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* DOCTOR-SPECIFIC FIELDS */}
                    {role === 'DOCTOR' && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Medical Registration Number *
                          </label>
                          <div className="relative">
                            <FileBadge className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <input
                              type="text"
                              value={doctorLicense}
                              onChange={(e) => setDoctorLicense(e.target.value)}
                              placeholder="e.g. GMC-984210 / MCI-48123"
                              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                              required
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 mt-0.5 block">
                            Mandatory for doctor verification by hospital administration.
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Medical Specialization *
                          </label>
                          <input
                            type="text"
                            value={doctorSpecialty}
                            onChange={(e) => setDoctorSpecialty(e.target.value)}
                            placeholder="e.g. Internal Medicine, Cardiology, Pediatrics"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                            required
                          />
                        </div>
                      </>
                    )}

                    {/* Passwords */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Password *
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 6 chars"
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-600"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-600"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {signUpError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{signUpError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={signUpLoading || !!emailDuplicateError}
                      className="w-full py-2.5 bg-cyan-700 hover:bg-cyan-800 disabled:opacity-50 text-white font-semibold rounded-lg text-sm shadow-sm transition-colors flex items-center justify-center gap-2 pt-3"
                    >
                      {signUpLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                      <span>Continue to OTP Verification</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Safety Note */}
        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Role-based access enforced. Doctor accounts require verified registration.</span>
        </div>
      </div>
    </div>
  );
};
