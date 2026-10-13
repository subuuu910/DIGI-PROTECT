import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
  Copy,
  Check,
  RefreshCw,
  User,
  Stethoscope,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { UserRole } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
  onNavigateHome: () => void;
  initialMode?: 'login' | 'forgot-password' | 'reset-password';
  initialToken?: string;
  addToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

type AuthFlowMode = 'login' | 'forgot-password' | 'token-sent' | 'reset-password' | 'reset-success';

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome,
  initialMode = 'login',
  initialToken = '',
  addToast,
}) => {
  const [mode, setMode] = useState<AuthFlowMode>(initialMode);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('e.vance@medikiosk.health');
  const [loginPassword, setLoginPassword] = useState('DoctorPass123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [dispatchedToken, setDispatchedToken] = useState<string>('');
  const [dispatchedCode, setDispatchedCode] = useState<string>('');
  const [dispatchedUserName, setDispatchedUserName] = useState<string>('');
  const [dispatchedExpiresAt, setDispatchedExpiresAt] = useState<string>('');

  // Reset form state
  const [resetToken, setResetToken] = useState<string>(initialToken);
  const [resetCodeInput, setResetCodeInput] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenVerificationData, setTokenVerificationData] = useState<{
    valid: boolean;
    email?: string;
    userName?: string;
    expiresInMinutes?: number;
  } | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState<any[]>([]);

  // Load demo accounts for reference
  useEffect(() => {
    api.getDemoAccounts()
      .then((data) => setDemoAccounts(data))
      .catch((err) => console.warn('Could not load demo accounts:', err));
  }, []);

  // Handle initial token if provided via URL
  useEffect(() => {
    if (initialToken) {
      setResetToken(initialToken);
      setMode('reset-password');
      verifyToken(initialToken);
    }
  }, [initialToken]);

  const verifyToken = async (tokenToVerify: string) => {
    if (!tokenToVerify) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.verifyResetToken({ token: tokenToVerify });
      if (res.valid) {
        setTokenVerificationData({
          valid: true,
          email: res.email,
          userName: res.userName,
          expiresInMinutes: res.expiresInMinutes,
        });
      } else {
        setErrorMsg(res.message || 'Verification token is invalid or has expired.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to verify token');
    } finally {
      setLoading(false);
    }
  };

  // 1. Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login(loginEmail.trim(), loginPassword);
      addToast(
        'success',
        `Signed In Successfully`,
        `Welcome ${res.user.name} (${res.user.role === 'DOCTOR' ? 'Attending Physician' : 'Patient Workspace'})`
      );
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials.');
      addToast('error', 'Sign In Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Forgot Password Request
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const targetEmail = forgotEmail.trim();

    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMsg('Please enter a valid registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.forgotPassword(targetEmail);
      setDispatchedToken(res.simulatedDispatch?.token || '');
      setDispatchedCode(res.simulatedDispatch?.verificationCode || '');
      setDispatchedUserName(res.userName || '');
      setDispatchedExpiresAt(res.simulatedDispatch?.expiresAt || '');
      setResetToken(res.simulatedDispatch?.token || '');
      setMode('token-sent');
      addToast(
        'success',
        'Verification Token Dispatched',
        `Secure reset token generated for ${targetEmail}. Valid for 15 minutes.`
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not dispatch reset token.');
      addToast('error', 'Reset Request Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Move from Token Sent to Reset Password Form
  const handleProceedToReset = (tokenStr: string) => {
    setErrorMsg(null);
    setResetToken(tokenStr);
    setMode('reset-password');
    verifyToken(tokenStr);
  };

  // 4. Verify Code manually if user enters 6-digit code
  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCodeInput.trim()) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.verifyResetToken({
        code: resetCodeInput.trim(),
        email: forgotEmail.trim(),
      });
      if (res.valid && res.token) {
        setResetToken(res.token);
        setTokenVerificationData({
          valid: true,
          email: res.email,
          userName: res.userName,
          expiresInMinutes: res.expiresInMinutes,
        });
        setMode('reset-password');
        addToast('success', 'Verification Code Confirmed', 'You can now set your new password.');
      } else {
        setErrorMsg(res.message || 'Invalid or expired verification code.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Code verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Submit New Password Reset
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setErrorMsg('Password must include at least one uppercase letter (A-Z).');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setErrorMsg('Password must include at least one lowercase letter (a-z).');
      return;
    }
    if (!/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      setErrorMsg('Password must include at least one number or special symbol.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword({
        token: resetToken,
        newPassword,
      });

      addToast(
        'success',
        'Password Successfully Reset',
        'Credentials updated! You can now log in with your new password.'
      );
      // Pre-fill login email with the updated account email
      if (res.email) {
        setLoginEmail(res.email);
      }
      setLoginPassword('');
      setMode('reset-success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password.');
      addToast('error', 'Reset Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick fill demo user
  const handleSelectDemoAccount = (acc: any) => {
    setLoginEmail(acc.email);
    setLoginPassword(acc.initialPassword);
    setForgotEmail(acc.email);
    setErrorMsg(null);
  };

  // Password Strength Calculations
  const hasMinLen = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasSpecialOrDigit = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const passedCriteriaCount = [hasMinLen, hasUpper, hasLower, hasSpecialOrDigit].filter(Boolean).length;

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex items-center justify-center">
      <div className="w-full max-w-xl space-y-6">
        {/* Brand Card Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200/80 text-cyan-900 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-cyan-700" />
            <span>MediKiosk Clinical Security & Identity Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {mode === 'login' && 'Sign In to MediKiosk'}
            {mode === 'forgot-password' && 'Reset Account Credentials'}
            {mode === 'token-sent' && 'Verification Token Dispatched'}
            {mode === 'reset-password' && 'Create New Password'}
            {mode === 'reset-success' && 'Password Reset Complete'}
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {mode === 'login' && 'Doctor workspace, clinical triage brief access, or patient intake portal.'}
            {mode === 'forgot-password' && 'Enter your registered email to receive a cryptographically verified single-use reset token.'}
            {mode === 'token-sent' && 'A 15-minute verification token has been generated. Use the simulated dispatch below to verify.'}
            {mode === 'reset-password' && 'Enter strong credentials complying with healthcare identity standards.'}
            {mode === 'reset-success' && 'Your credentials have been securely updated. You can now sign in.'}
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Authentication Notice</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Main Authentication Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {/* ============================================================= */}
          {/* 1. LOGIN MODE */}
          {/* ============================================================= */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="doctor@medikiosk.health or patient@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(loginEmail);
                      setErrorMsg(null);
                      setMode('forgot-password');
                    }}
                    className="text-xs font-semibold text-cyan-700 hover:text-cyan-900 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 font-mono text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-cyan-700 focus:ring-cyan-600"
                  />
                  <span>Keep session active on this kiosk terminal</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to MediKiosk</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Demo Accounts Quick-Select */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Quick Demo Accounts
                  </span>
                  <span className="text-xs text-slate-400">Click to auto-fill</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleSelectDemoAccount(acc)}
                      className="p-2.5 text-left rounded-lg border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/50 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-cyan-900">
                          {acc.name}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          acc.role === 'DOCTOR' ? 'bg-teal-50 text-teal-800' : 'bg-cyan-50 text-cyan-800'
                        }`}>
                          {acc.role}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block truncate">{acc.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* ============================================================= */}
          {/* 2. FORGOT PASSWORD MODE (Request Token) */}
          {/* ============================================================= */}
          {mode === 'forgot-password' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
              <div className="p-3.5 rounded-lg bg-cyan-50 border border-cyan-200/80 text-cyan-950 text-xs leading-relaxed space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-cyan-900">
                  <KeyRound className="w-4 h-4 text-cyan-700 shrink-0" />
                  <span>Secure Verification Token Process</span>
                </div>
                <p>
                  To protect medical data, MediKiosk issues a cryptographically secure, time-limited verification token with 15-minute single-use validity.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Your Registered Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.vance@medikiosk.health or rahul.verma@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Must match the email registered on your doctor or patient profile.
                </p>
              </div>

              {/* Registered email suggestions for testing */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-slate-500 block">Registered Email Addresses:</span>
                <div className="flex flex-wrap gap-1.5">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => setForgotEmail(acc.email)}
                      className="px-2.5 py-1 text-xs rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
                    >
                      {acc.email}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:flex-1 py-3 px-4 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating Token...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Send Verification Token</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setMode('login');
                  }}
                  className="w-full sm:w-auto px-4 py-3 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* ============================================================= */}
          {/* 3. TOKEN SENT MODE (Simulated Email Dispatch & Code Entry) */}
          {/* ============================================================= */}
          {mode === 'token-sent' && (
            <div className="space-y-6">
              {/* Dispatch Alert */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm space-y-2">
                <div className="flex items-center gap-2 font-semibold text-emerald-950">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Verification Token Dispatched Successfully</span>
                </div>
                <p className="text-emerald-800">
                  A verification token for <strong>{forgotEmail}</strong> has been generated with single-use protection. It will expire in <strong>15 minutes</strong>.
                </p>
              </div>

              {/* Simulated Clinical Email Outbox Card */}
              <div className="rounded-xl border border-cyan-200 bg-slate-900 text-slate-100 p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Simulated Security Dispatch
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Expires in 15 mins</span>
                  </div>
                </div>

                <div className="text-xs space-y-1 text-slate-300 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 w-16">To:</span>
                    <span className="text-cyan-200 font-semibold">{forgotEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 w-16">From:</span>
                    <span>security@medikiosk.health</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 w-16">Subject:</span>
                    <span>MediKiosk Password Reset Verification</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1 uppercase font-semibold">
                      Option A: 6-Digit Verification Code
                    </span>
                    <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-md border border-slate-700">
                      <span className="text-xl font-bold tracking-widest text-cyan-300 font-mono">
                        {dispatchedCode || '482915'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(dispatchedCode);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 p-1"
                        title="Copy code"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1 uppercase font-semibold">
                      Option B: Direct Verification Token Link
                    </span>
                    <button
                      type="button"
                      onClick={() => handleProceedToReset(dispatchedToken)}
                      className="w-full py-2.5 px-3 bg-cyan-700 hover:bg-cyan-600 text-white rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Proceed to Reset Password with Verified Token</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Token string preview */}
                <div className="pt-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>Cryptographic Token (SHA-256 / 256-bit entropy):</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(dispatchedToken);
                        setCopiedToken(true);
                        setTimeout(() => setCopiedToken(false), 2000);
                      }}
                      className="hover:text-white flex items-center gap-1"
                    >
                      {copiedToken ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedToken ? 'Copied' : 'Copy Token'}</span>
                    </button>
                  </div>
                  <div className="p-2 bg-slate-950 rounded text-[10px] font-mono text-slate-400 break-all border border-slate-800/80">
                    {dispatchedToken}
                  </div>
                </div>
              </div>

              {/* Enter 6-digit Code Form */}
              <form onSubmit={handleVerifyCodeSubmit} className="space-y-4 pt-2 border-t border-slate-200">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Or Enter 6-Digit Verification Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={resetCodeInput}
                      onChange={(e) => setResetCodeInput(e.target.value.replace(/\D/g, ''))}
                      placeholder={dispatchedCode || '123456'}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-center text-lg font-mono tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600"
                    />
                    <button
                      type="submit"
                      disabled={loading || resetCodeInput.length < 6}
                      className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                    >
                      Verify Code
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot-password');
                    }}
                    className="text-cyan-700 hover:text-cyan-900 font-semibold"
                  >
                    Resend token / Change email
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setMode('login');
                    }}
                    className="text-slate-600 hover:text-slate-900 font-medium"
                  >
                    Cancel and return to Sign In
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================= */}
          {/* 4. RESET PASSWORD MODE (Set New Password) */}
          {/* ============================================================= */}
          {mode === 'reset-password' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
              {/* Identity & Token Badge */}
              <div className="p-3.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-950 text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold block text-slate-900">
                    Resetting Credentials for:{' '}
                    <span className="text-cyan-800">
                      {tokenVerificationData?.userName || dispatchedUserName || forgotEmail || 'Registered User'}
                    </span>
                  </span>
                  <span className="text-slate-600 font-mono text-[11px]">
                    {tokenVerificationData?.email || forgotEmail}
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Token Valid</span>
                  </span>
                  {tokenVerificationData?.expiresInMinutes && (
                    <span className="text-[10px] text-slate-500 block">
                      Expires in ~{tokenVerificationData.expiresInMinutes}m
                    </span>
                  )}
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter strong new password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 font-mono text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 font-mono text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Policy & Complexity Indicator */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Healthcare Security Standards</span>
                  <span className={`text-[11px] font-semibold ${
                    passedCriteriaCount === 4 && passwordsMatch ? 'text-emerald-700' : 'text-slate-500'
                  }`}>
                    {passedCriteriaCount}/4 criteria met
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${hasMinLen ? 'text-emerald-700' : 'text-slate-400'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${hasMinLen ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-700' : 'text-slate-400'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${hasUpper ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>Uppercase letter (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-700' : 'text-slate-400'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${hasLower ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>Lowercase letter (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSpecialOrDigit ? 'text-emerald-700' : 'text-slate-400'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${hasSpecialOrDigit ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>Number or symbol</span>
                  </div>
                </div>
                {confirmPassword && (
                  <div className={`pt-1 border-t border-slate-200 flex items-center gap-1.5 text-[11px] ${
                    passwordsMatch ? 'text-emerald-700 font-semibold' : 'text-rose-600'
                  }`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${passwordsMatch ? 'text-emerald-600' : 'text-rose-400'}`} />
                    <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={loading || passedCriteriaCount < 4 || !passwordsMatch}
                  className="w-full sm:flex-1 py-3 px-4 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Updating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Confirm & Reset Password</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setMode('login');
                  }}
                  className="w-full sm:w-auto px-4 py-3 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* ============================================================= */}
          {/* 5. RESET SUCCESS MODE */}
          {/* ============================================================= */}
          {mode === 'reset-success' && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900">
                  Password Successfully Reset
                </h2>
                <p className="text-sm text-slate-600 max-w-sm mx-auto">
                  Your credentials have been securely updated in MediKiosk. The verification token was invalidated to prevent replay.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 max-w-md mx-auto text-left flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Audit log entry generated. All prior active sessions on other devices have been flagged for re-authentication.
                </span>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setMode('login');
                  }}
                  className="w-full py-3 px-4 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span>Sign In with New Password</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Back to Home Link */}
        <div className="text-center">
          <button
            type="button"
            onClick={onNavigateHome}
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to MediKiosk Overview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
