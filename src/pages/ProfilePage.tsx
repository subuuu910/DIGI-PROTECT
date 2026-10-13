import React from 'react';
import {
  UserCheck,
  Stethoscope,
  ShieldCheck,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  Heart,
  FileCheck,
  Lock,
  Building,
  KeyRound,
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import { User, Patient, UserRole } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

interface ProfilePageProps {
  user: User | null;
  patient?: Patient | null;
  activeRole: UserRole;
  onLogout?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  patient,
  activeRole,
  onLogout,
}) => {
  const isDoctor = activeRole === 'DOCTOR';
  const isApproved = user?.isDoctorApproved ?? false;

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Page Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold">
          {isDoctor ? <Stethoscope className="w-3.5 h-3.5 text-teal-700" /> : <UserCheck className="w-3.5 h-3.5 text-cyan-700" />}
          <span>{isDoctor ? 'Doctor Accreditation & Identity' : 'Patient Health Profile & Records'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {isDoctor ? 'Physician Profile & Credentials' : 'My Health Profile'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          {isDoctor
            ? 'Authorized clinical practitioner profile, state licensing verification status, and digital electronic signing credentials.'
            : 'Personal demographic details, verified contact information, informed triage consent, and baseline medical conditions.'}
        </p>
      </div>

      {isDoctor ? (
        /* DOCTOR PROFILE */
        <div className="space-y-6">
          {/* Main Doctor Identity Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
                <Stethoscope className="w-8 h-8 text-teal-700" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{user?.name || 'Attending Physician'}</h2>
                  {isApproved ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified & Approved</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Verification Pending</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 font-medium">{user?.doctorSpecialty || 'Internal Medicine & Clinical Informatics'}</p>
                <p className="text-xs text-slate-500 font-mono">GMC License: {user?.doctorLicense || 'GMC-734567'}</p>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap self-start sm:self-center"
              >
                Sign Out
              </button>
            )}
          </div>

          {/* Clinical Credentials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                <Building className="w-4 h-4 text-cyan-700" />
                <span>Hospital & Network Affiliation</span>
              </h3>
              <div className="space-y-2 text-slate-600">
                <p className="font-medium text-slate-900">{user?.hospitalAffiliation || 'St. Marks Medical Clinic & Metro Health Network'}</p>
                <p className="text-slate-500">Department of General Medicine & Outpatient Triage Center</p>
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{user?.email || 'e.vance@medikiosk.health'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-teal-700" />
                <span>Electronic Signature Authority</span>
              </h3>
              <div className="space-y-2 text-slate-600">
                <p className="font-medium text-slate-900">
                  {isApproved ? 'Active Digital Signing Certificate' : 'Pending Regulatory Validation'}
                </p>
                <p className="text-slate-500">
                  {isApproved
                    ? 'Authorized to digitally sign electronic prescriptions with cryptographic QR verification hash.'
                    : 'Awaiting medical council clearance before prescription signing privileges are activated.'}
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2 font-mono text-[11px] text-slate-500">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Key ID: MK-SIG-{user?.doctorLicense?.replace(/[^A-Za-z0-9]/g, '') || '734567'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* PATIENT PROFILE */
        <div className="space-y-6">
          {/* Main Patient Identity Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-700 text-white flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
                {patient?.fullName ? patient.fullName[0] : 'P'}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{patient?.fullName || user?.name || 'Registered Patient'}</h2>
                  <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                    ID: {patient?.patientId || 'MK-PT-01'}
                  </span>
                  {patient && <StatusBadge priority={patient.priority} />}
                  {patient && <StatusBadge status={patient.status} />}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-0.5">
                  <span>{patient?.age || 38} Years</span>
                  <span aria-hidden="true">·</span>
                  <span>{patient?.gender || 'Patient'}</span>
                  <span aria-hidden="true">·</span>
                  <span>DOB: <span className="font-mono">{patient?.dob || '1988-01-01'}</span></span>
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap self-start sm:self-center"
              >
                Sign Out
              </button>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Contact & Emergency */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-700" />
                <span>Contact & Emergency Information</span>
              </h3>
              <div className="space-y-2 text-slate-700">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Phone Number:</span>
                  <span className="font-mono font-medium">{patient?.phone || '+91 98000 00000'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-medium">{patient?.email || user?.email || 'patient@medikiosk.health'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Emergency Contact:</span>
                  <span className="font-medium">{patient?.emergencyContact?.name || 'Emergency Contact'}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Emergency Relationship:</span>
                  <span className="font-medium">{patient?.emergencyContact?.relationship || 'Family'} ({patient?.emergencyContact?.phone || '+91 98000 00001'})</span>
                </div>
              </div>
            </div>

            {/* Informed Consent & Baseline Health */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-600" />
                <span>Medical Baseline & Intake Consent</span>
              </h3>
              <div className="space-y-2.5 text-slate-700">
                <div>
                  <span className="text-slate-500 block text-[11px] font-medium mb-1">Existing Conditions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {patient?.existingConditions && patient.existingConditions.length > 0 ? (
                      patient.existingConditions.map((cond, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-medium">
                          {cond}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">None reported</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px] font-medium mb-1">Known Allergies:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {patient?.knownAllergies && patient.knownAllergies.length > 0 ? (
                      patient.knownAllergies.map((allergy, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-medium">
                          {allergy}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">None declared</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200 text-[11px]">
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Informed Intake Consent:</strong> Granted and recorded in audit log.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Logout Action */}
      {onLogout && (
        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-2xs"
          >
            <LogOut className="w-4 h-4" />
            <span>End Session & Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
};
