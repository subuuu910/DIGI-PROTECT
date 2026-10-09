import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Printer, Download, CheckCircle2, Clock, ShieldCheck, AlertCircle, FileCheck, ExternalLink } from 'lucide-react';
import { EPrescription } from '../../types';

interface PatientPrescriptionViewProps {
  prescription: EPrescription;
  onNavigateToVerify: (prescriptionId: string) => void;
}

export const PatientPrescriptionView: React.FC<PatientPrescriptionViewProps> = ({
  prescription,
  onNavigateToVerify,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const generateQr = async () => {
      try {
        const payload = JSON.stringify({
          system: 'MEDIKIOSK_HEALTH',
          rxId: prescription.prescriptionId,
          patientId: prescription.patientId,
          doctor: prescription.doctorName,
          status: prescription.status,
          hash: prescription.verificationHash,
          verifyUrl: `${window.location.origin}/verify?id=${prescription.prescriptionId}`,
        });
        const url = await QRCode.toDataURL(payload, {
          width: 160,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('QR generation failed:', err);
      }
    };

    generateQr();
  }, [prescription]);

  const handlePrint = () => {
    window.print();
  };

  const isAuthorized = prescription.status === 'AUTHORIZED' || prescription.status === 'VERIFIED';

  return (
    <div className="space-y-4">
      {/* Action Bar (Hidden during print) */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          {isAuthorized ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Doctor-Authorized Electronic Prescription</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-md">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Draft Prescription · Awaiting Attending Physician Authorization</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToVerify(prescription.prescriptionId)}
            className="px-3.5 py-1.5 text-xs font-semibold text-cyan-800 bg-cyan-50 border border-cyan-200 hover:bg-cyan-100 rounded-md transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Verify in Portal</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Prescription</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-md shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>

      {/* Official Prescription Document Container */}
      <div className="bg-white border border-slate-300 rounded-xl p-8 sm:p-12 shadow-sm text-slate-900 max-w-4xl mx-auto relative overflow-hidden print:border-none print:shadow-none print:p-0">
        {/* Draft Watermark if not authorized */}
        {!isAuthorized && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center rotate-[-30deg] opacity-10">
            <span className="text-8xl font-black text-rose-900 uppercase tracking-widest">
              DRAFT PENDING DOCTOR SIGNATURE
            </span>
          </div>
        )}

        {/* Prescription Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded bg-cyan-700 text-white font-black text-base flex items-center justify-center">
                MK
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                MEDIKIOSK CLINICAL HEALTH
              </h2>
            </div>
            <p className="text-xs font-semibold text-cyan-800">{prescription.clinicName}</p>
            <p className="text-[11px] text-slate-500">Outpatient Consultation & Telemedicine Services</p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-0.5">
            <p className="font-bold text-slate-900">{prescription.doctorName}</p>
            <p className="text-slate-600">{prescription.doctorSpecialty}</p>
            <p className="font-mono text-slate-500">License: {prescription.doctorLicense}</p>
            <p className="font-mono text-slate-700 font-semibold pt-1">
              Date: <span className="tabular-nums">{prescription.issuedDate}</span>
            </p>
          </div>
        </div>

        {/* Patient Demographics Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 my-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Patient Name</span>
            <span className="font-semibold text-slate-900">{prescription.patientName}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Patient ID</span>
            <span className="font-mono font-bold text-slate-900">{prescription.patientId}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Age / Gender</span>
            <span className="text-slate-900">{prescription.patientAge} Years · {prescription.patientGender}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Prescription ID</span>
            <span className="font-mono font-bold text-cyan-800">{prescription.prescriptionId}</span>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="mb-6">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
            Primary Diagnosis
          </span>
          <p className="text-sm font-semibold text-slate-900 mt-0.5 bg-cyan-50/50 p-2.5 rounded border border-cyan-100">
            {prescription.diagnosis}
          </p>
        </div>

        {/* Rx Symbol & Medication Table */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-black text-cyan-900 font-serif">℞</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Prescribed Medications & Administration Schedule
            </span>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Medicine & Strength</th>
                  <th className="py-2 px-3">Frequency & Route</th>
                  <th className="py-2 px-3">Duration</th>
                  <th className="py-2 px-3">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prescription.medicines.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono text-slate-400 tabular-nums">{index + 1}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{item.medicineName}</span>
                      <span className="text-slate-500 text-[11px]">Dosage: {item.dosage}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      <span>{item.frequency}</span>
                      <span className="text-slate-400 block text-[11px]">Route: {item.route}</span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">{item.duration}</td>
                    <td className="py-3 px-3 text-slate-600 text-[11px] leading-relaxed">
                      {item.instructions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* General Instructions & Follow-up */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-xs">
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
            <span className="font-bold text-slate-800 block mb-1">General Care & Hydration:</span>
            <p className="text-slate-600 whitespace-pre-line leading-relaxed text-[11px]">
              {prescription.generalInstructions}
            </p>
          </div>

          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-2">
            {prescription.dietAdvice && (
              <div>
                <span className="font-bold text-slate-800 block text-[11px]">Diet & Precautions:</span>
                <p className="text-slate-600 text-[11px]">{prescription.dietAdvice}</p>
              </div>
            )}
            {prescription.followUpDate && (
              <div>
                <span className="font-bold text-slate-800 block text-[11px]">Follow-Up Visit:</span>
                <p className="text-slate-600 text-[11px] font-mono">{prescription.followUpDate}</p>
              </div>
            )}
            {prescription.doctorNotes && (
              <div className="pt-1 border-t border-slate-200">
                <span className="font-bold text-slate-800 block text-[11px]">Physician Note:</span>
                <p className="text-cyan-900 font-medium text-[11px] italic">
                  {prescription.doctorNotes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Signature & QR Verification Bar */}
        <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* QR Code Container */}
          <div className="flex items-center gap-3">
            <div className="w-24 h-24 border border-slate-300 rounded-md p-1 bg-white shrink-0 flex items-center justify-center">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Prescription Verification QR Code" className="w-full h-full" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                  Generating QR...
                </div>
              )}
            </div>
            <div className="text-xs text-slate-600 space-y-0.5">
              <span className="font-bold text-slate-900 block flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Digital Pharmacy Verification
              </span>
              <p className="text-[11px] text-slate-500">Scan QR to authenticate e-prescription validity.</p>
              <p className="font-mono text-[10px] text-slate-400">
                Hash: {prescription.verificationHash}
              </p>
            </div>
          </div>

          {/* Doctor Signature Stamp */}
          <div className="text-center sm:text-right text-xs">
            {isAuthorized ? (
              <div className="space-y-1">
                <div className="inline-block border-2 border-emerald-600 text-emerald-800 font-mono font-bold text-[11px] px-3 py-1 rounded tracking-wider uppercase bg-emerald-50 mb-1">
                  DOCTOR AUTHORIZED & SIGNED
                </div>
                <p className="font-bold text-slate-900">{prescription.doctorName}</p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Signed: {prescription.authorizedAt ? new Date(prescription.authorizedAt).toLocaleString() : 'Authorized'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">{prescription.digitalSignature}</p>
              </div>
            ) : (
              <div className="border border-dashed border-amber-300 bg-amber-50 p-3 rounded text-center">
                <p className="font-bold text-amber-900 text-xs">Pending Physician Signature</p>
                <p className="text-[11px] text-amber-700">Not valid for dispensing until authorized.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Fineprint */}
        <div className="mt-8 pt-4 border-t border-slate-100 text-[10px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-1">
          <p>MediKiosk Authorized Healthcare System · Compliant with Electronic Health Record Guidelines</p>
          <p>Valid for 30 days from issuance unless specified otherwise</p>
        </div>
      </div>
    </div>
  );
};
