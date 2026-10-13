import React from 'react';
import { ShieldAlert, AlertTriangle, LogOut, CheckCircle2, ArrowRight } from 'lucide-react';
import { User } from '../../types';

interface DoctorPendingApprovalNoticeProps {
  doctor: User | null;
  onLogout: () => void;
  onApproveDoctor?: () => void;
  onSwitchToVerifiedDoctor?: () => void;
  onNavigateToOverview?: () => void;
}

export const DoctorPendingApprovalNotice: React.FC<DoctorPendingApprovalNoticeProps> = ({
  doctor,
  onLogout,
  onApproveDoctor,
  onSwitchToVerifiedDoctor,
  onNavigateToOverview,
}) => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="bg-white border border-amber-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Status Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Doctor Verification Pending</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Doctor Account Pending Approval
            </h1>
            <div className="p-3 bg-amber-100/70 border border-amber-300 rounded-lg text-amber-950 font-semibold text-sm">
              Your doctor account is awaiting verification. Doctor Dashboard access will be available after approval.
            </div>
          </div>
        </div>

        {/* Doctor Information Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2.5">
          <div className="flex justify-between items-center py-1 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Physician Name:</span>
            <span className="font-bold text-slate-900">{doctor?.name || 'Dr. Julian Hayes, MD'}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Medical License:</span>
            <span className="font-mono text-slate-800">{doctor?.doctorLicense || 'GMC-PENDING-8821'}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Affiliation:</span>
            <span className="text-slate-800">{doctor?.hospitalAffiliation || 'General Hospital (Credentials Under Review)'}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500 font-medium">Approval Status:</span>
            <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              PENDING REGULATORY APPROVAL
            </span>
          </div>
        </div>

        {/* Clinical Governance Notice */}
        <div className="text-xs text-slate-600 space-y-1 bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
          <h2 className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            <span>Healthcare Compliance & Safety Protocol</span>
          </h2>
          <p className="leading-relaxed">
            In accordance with digital healthcare security and outpatient safety governance, doctors cannot access patient medical records, triage queues, or digital prescription signing until their license is verified by hospital administration.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onNavigateToOverview && (
              <button
                onClick={onNavigateToOverview}
                className="w-full sm:w-auto px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Return to Overview
              </button>
            )}
            {onApproveDoctor && (
              <button
                onClick={onApproveDoctor}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                title="Simulate administrative verification & credential approval"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Admin Approve Doctor Account</span>
              </button>
            )}
            {onSwitchToVerifiedDoctor && (
              <button
                onClick={onSwitchToVerifiedDoctor}
                className="w-full sm:w-auto px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                title="Authenticate with approved physician credentials"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Authenticate as Verified Doctor</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
