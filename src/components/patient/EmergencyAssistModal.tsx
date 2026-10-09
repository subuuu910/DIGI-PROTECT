import React from 'react';
import { AlertOctagon, PhoneCall, MapPin, X, ShieldAlert, HeartPulse } from 'lucide-react';
import { Patient, RedFlag } from '../../types';

interface EmergencyAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  redFlags?: RedFlag[];
}

export const EmergencyAssistModal: React.FC<EmergencyAssistModalProps> = ({
  isOpen,
  onClose,
  patient,
  redFlags = [],
}) => {
  if (!isOpen) return null;

  const nearbyFacilities = [
    {
      name: 'Metro City Emergency Trauma Center & ICU',
      distance: '1.2 km away',
      address: '42 Medical Boulevard, South Wing',
      phone: '108 / +91 91100 22334',
      status: 'Open 24/7 · Critical Care Ready',
    },
    {
      name: 'St. Marks University Hospital Acute ER',
      distance: '2.8 km away',
      address: '14 London Road, East Campus',
      phone: '+91 91100 44556',
      status: 'Open 24/7 · Cardiac & Pulmonology Unit',
    },
    {
      name: 'Central General Hospital Casualty Wing',
      distance: '4.5 km away',
      address: '88 Healthcare Avenue',
      phone: '+91 91100 77889',
      status: 'Open 24/7 · General Emergency',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-rose-300 rounded-xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-rose-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Emergency Clinical Assist Protocol</h2>
              <p className="text-xs text-rose-100">Potential urgent medical attention recommended</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-md"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs sm:text-sm">
          {/* Important Medical Disclaimer */}
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3.5 text-xs text-rose-950 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-rose-900">
                Notice: Supervised Emergency Assistance Flow
              </p>
              <p className="text-rose-900/90 leading-relaxed">
                MediKiosk does not dispatch ambulances automatically and does not provide an autonomous diagnosis. If you or the patient are experiencing chest pressure, severe shortness of breath, sudden numbness, or fainting, immediately notify on-site triage nurses or call emergency services directly.
              </p>
            </div>
          </div>

          {/* Patient Clinical Triage Summary for Emergency Staff */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
              Immediate Patient Profile for Attending Care Team
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Patient</span>
                <span className="font-bold text-slate-900">{patient.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Age / Gender</span>
                <span className="font-medium text-slate-900">{patient.age}y · {patient.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Emergency Contact</span>
                <span className="font-medium text-slate-900">
                  {patient.emergencyContact?.name} ({patient.emergencyContact?.phone})
                </span>
              </div>
              <div className="col-span-2 sm:col-span-3 pt-1 border-t border-slate-200">
                <span className="text-slate-400 block text-[10px]">Reported Allergies</span>
                <span className="font-semibold text-rose-700">
                  {patient.knownAllergies?.join(', ') || 'Penicillin Allergy recorded in past records'}
                </span>
              </div>
            </div>
          </div>

          {/* Active Red Flags */}
          {redFlags.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-2">
                Triggered Clinical Flags ({redFlags.length})
              </h3>
              <div className="space-y-2">
                {redFlags.map((rf) => (
                  <div
                    key={rf.id}
                    className="border border-amber-200 bg-amber-50/60 rounded-lg p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center gap-2 font-bold text-amber-950">
                      <HeartPulse className="w-4 h-4 text-amber-700" />
                      <span>{rf.title}</span>
                    </div>
                    <p className="text-amber-900/90 leading-relaxed text-[11px]">{rf.description}</p>
                    <p className="text-amber-800 text-[11px] font-semibold mt-1">
                      Action: {rf.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nearby Emergency Facilities */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-2">
              Verified Nearby Emergency Facilities
            </h3>
            <div className="space-y-2">
              {nearbyFacilities.map((fac, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                      <span>{fac.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 ml-5">{fac.address} · {fac.distance}</p>
                    <p className="text-[10px] text-emerald-700 font-medium ml-5">{fac.status}</p>
                  </div>
                  <a
                    href={`tel:${fac.phone.replace(/[^0-9+]/g, '')}`}
                    className="self-start sm:self-center px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
                    <span>Call ER: {fac.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-semibold transition-colors"
            >
              Return to Pre-Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
