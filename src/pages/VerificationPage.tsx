import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, CheckCircle2, AlertTriangle, FileText, QrCode } from 'lucide-react';
import { api } from '../services/api';

interface VerificationPageProps {
  initialId?: string;
}

export const VerificationPage: React.FC<VerificationPageProps> = ({ initialId }) => {
  const [prescriptionId, setPrescriptionId] = useState(initialId || 'MK-RX-2026-1024-EV');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (idToVerify?: string) => {
    const id = idToVerify || prescriptionId;
    if (!id.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await api.verifyPrescription(id.trim());
      setResult(data);
    } catch (err: any) {
      setResult(null);
      setError(err.message || 'Prescription could not be verified in the national registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      setPrescriptionId(initialId);
      handleVerify(initialId);
    }
  }, [initialId]);

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Pharmacy & Patient Prescription Authentication</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Verify MediKiosk Electronic Prescription
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          Verify physician authorization, authenticity status, and digital signature records using the Prescription ID or QR payload.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={prescriptionId}
              onChange={(e) => setPrescriptionId(e.target.value)}
              placeholder="e.g. MK-RX-2026-1024-EV"
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono uppercase tracking-wide focus:outline-none focus:border-cyan-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !prescriptionId.trim()}
            className="px-6 py-2 bg-cyan-700 hover:bg-cyan-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-2xs"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <QrCode className="w-4 h-4" />
                <span>Verify Status</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Pre-fills */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
          <span>Demo Prescriptions:</span>
          <button
            type="button"
            onClick={() => {
              setPrescriptionId('MK-RX-2026-1024-EV');
              handleVerify('MK-RX-2026-1024-EV');
            }}
            className="text-cyan-700 hover:text-cyan-800 underline font-mono font-medium"
          >
            MK-RX-2026-1024-EV (Rahul Verma)
          </button>
        </div>
      </div>

      {/* Verification Result Card */}
      {result && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Official Verification Status
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                {result.valid ? (
                  <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>VALID · AUTHORIZED ELECTRONIC PRESCRIPTION</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-sm font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-md">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>STATUS: {result.status}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs text-slate-500">
              <span className="block text-[10px] uppercase text-slate-400">Prescription ID</span>
              <span className="font-bold text-slate-900 text-sm">{result.prescriptionId}</span>
            </div>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2.5">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Attending Physician
                </span>
                <span className="font-bold text-slate-900">{result.doctorName}</span>
                <span className="text-slate-500 block text-[11px]">{result.doctorSpecialty}</span>
                <span className="font-mono text-slate-500 text-[11px]">License: {result.doctorLicense}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Clinical Center
                </span>
                <span className="text-slate-800 font-medium">{result.clinicName}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Patient Summary (Privacy Redacted)
                </span>
                <span className="font-semibold text-slate-900">
                  {result.patientNameInitials} ({result.patientAge} Years)
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Date of Authorization
                </span>
                <span className="font-mono text-slate-800">
                  {result.authorizedAt ? new Date(result.authorizedAt).toLocaleString() : result.issuedDate}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Formulary Items
                </span>
                <span className="text-slate-800 font-semibold">{result.itemCount} Medications Authorized</span>
              </div>
            </div>
          </div>

          {/* Security & Cryptographic Stamp */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
            <div>
              <span className="font-mono text-slate-400">Cryptographic Hash:</span>{' '}
              <span className="font-mono text-slate-700 font-semibold">{result.verificationHash}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Digital Physician Signature Present</span>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 text-xs text-rose-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Prescription Verification Unsuccessful</p>
            <p className="leading-relaxed">{error}</p>
            <p className="text-[11px] text-rose-700 mt-2">
              Please re-check the Prescription ID or verify that the doctor has authorized and signed the electronic record.
            </p>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-[11px] text-slate-500 leading-relaxed">
        <strong className="text-slate-700">Privacy & Confidentiality Standard:</strong> In compliance with medical privacy boundaries, this public verification interface verifies prescription authorization status, physician credentials, and item counts without displaying sensitive diagnosis transcripts or patient medical notes.
      </div>
    </div>
  );
};
