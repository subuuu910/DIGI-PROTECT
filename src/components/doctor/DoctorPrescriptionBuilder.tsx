import React, { useState } from 'react';
import { Plus, Trash2, ShieldCheck, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';
import { EPrescription, PrescriptionItem } from '../../types';

interface DoctorPrescriptionBuilderProps {
  prescription: EPrescription;
  onUpdateDraft: (data: Partial<EPrescription>) => Promise<void>;
  onAuthorize: (doctorNotes?: string) => Promise<void>;
  loading: boolean;
  hasUnresolvedContradictions: boolean;
}

const COMMON_MEDICATIONS = [
  { name: 'Azithromycin Tablet', defaultDose: '500 mg', route: 'Oral', freq: 'Once daily (OD) for 5 days', instructions: 'Take 1 hour before food. Non-penicillin macrolide.' },
  { name: 'Paracetamol Tablet', defaultDose: '650 mg', route: 'Oral', freq: 'Every 6 to 8 hours PRN', instructions: 'For fever >100°F or body aches. Max 3g in 24h.' },
  { name: 'Salbutamol 100mcg Inhaler', defaultDose: '2 puffs', route: 'Inhalation', freq: 'Every 4 to 6 hours PRN', instructions: 'Use with spacer for acute wheeze or cough.' },
  { name: 'Levocetirizine + Montelukast', defaultDose: '5mg / 10mg', route: 'Oral', freq: 'Once daily at bedtime', instructions: 'For allergic airway inflammation.' },
  { name: 'Amoxicillin + Clavulanate (Augmentin)', defaultDose: '625 mg', route: 'Oral', freq: 'Twice daily', instructions: 'WARNING: BETA-LACTAM PENICILLIN CLASS.' },
  { name: 'Cefixime Tablet', defaultDose: '200 mg', route: 'Oral', freq: 'Twice daily', instructions: 'Cephalosporin antibiotic.' },
];

export const DoctorPrescriptionBuilder: React.FC<DoctorPrescriptionBuilderProps> = ({
  prescription,
  onUpdateDraft,
  onAuthorize,
  loading,
  hasUnresolvedContradictions,
}) => {
  const [diagnosis, setDiagnosis] = useState(prescription.diagnosis || '');
  const [medicines, setMedicines] = useState<PrescriptionItem[]>(prescription.medicines || []);
  const [generalInstructions, setGeneralInstructions] = useState(prescription.generalInstructions || '');
  const [doctorNotes, setDoctorNotes] = useState(prescription.doctorNotes || '');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New item form
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '500 mg',
    route: 'Oral',
    frequency: 'Twice daily after meals',
    duration: '5 days',
    instructions: 'Take with warm water.',
  });

  const handleAddMedicine = () => {
    if (!newMed.name.trim()) return;

    // Safety check for penicillin allergy
    const lowerName = newMed.name.toLowerCase();
    if (lowerName.includes('amoxicillin') || lowerName.includes('augmentin') || lowerName.includes('penicillin')) {
      const confirmAdd = window.confirm(
        'SAFETY ALERT: Patient has a documented Penicillin allergy in medical records! Are you sure you wish to prescribe a beta-lactam antibiotic?'
      );
      if (!confirmAdd) return;
    }

    const newItem: PrescriptionItem = {
      id: `med-${Date.now()}`,
      medicineName: newMed.name.trim(),
      dosage: newMed.dosage.trim(),
      route: newMed.route.trim(),
      frequency: newMed.frequency.trim(),
      duration: newMed.duration.trim(),
      instructions: newMed.instructions.trim(),
    };

    const updated = [...medicines, newItem];
    setMedicines(updated);
    setNewMed({
      name: '',
      dosage: '500 mg',
      route: 'Oral',
      frequency: 'Twice daily after meals',
      duration: '5 days',
      instructions: 'Take with warm water.',
    });
    onUpdateDraft({ medicines: updated });
  };

  const handleRemoveMedicine = (id: string) => {
    const updated = medicines.filter((m) => m.id !== id);
    setMedicines(updated);
    onUpdateDraft({ medicines: updated });
  };

  const handleSaveDraft = async () => {
    await onUpdateDraft({
      diagnosis,
      medicines,
      generalInstructions,
      doctorNotes,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAuthorizeConfirm = async () => {
    await onAuthorize(doctorNotes);
    setShowAuthModal(false);
  };

  const isAlreadyAuthorized = prescription.status === 'AUTHORIZED' || prescription.status === 'VERIFIED';

  return (
    <div className="space-y-6">
      {/* Contradiction Warning */}
      {hasUnresolvedContradictions && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3.5 flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Unresolved Clinical Contradiction Flagged!</p>
            <p className="mt-0.5 leading-relaxed">
              Patient interview reported no allergies, but previous clinic records document a severe Penicillin / Amoxicillin reaction. Please resolve this contradiction in the Contradictions tab before authorizing beta-lactams.
            </p>
          </div>
        </div>
      )}

      {/* Main Prescription Builder Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Doctor-Authorized E-Prescription Builder
              </h3>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                  isAlreadyAuthorized
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {prescription.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Attending Physician: {prescription.doctorName} (License: {prescription.doctorLicense})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={loading}
              className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold transition-colors"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              disabled={loading || medicines.length === 0 || isAlreadyAuthorized}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-md text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAlreadyAuthorized ? 'Prescription Authorized' : 'Authorize & Digitally Sign'}</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Prescription draft updated successfully.</span>
          </div>
        )}

        {/* Diagnosis Field */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Confirmed Clinical Diagnosis *
          </label>
          <input
            type="text"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            disabled={isAlreadyAuthorized}
            placeholder="e.g. Acute Bacterial Bronchitis with Mild Asthma Exacerbation"
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-cyan-600"
          />
        </div>

        {/* Current Medicines List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Prescribed Medications ({medicines.length})
            </label>
            <span className="text-[11px] text-slate-500">
              Only licensed physician can prescribe
            </span>
          </div>

          {medicines.length === 0 ? (
            <div className="p-6 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-500">
              No medications added to this prescription yet. Add items below or select from clinical presets.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Medicine</th>
                    <th className="py-2 px-3">Dosage & Route</th>
                    <th className="py-2 px-3">Frequency & Duration</th>
                    <th className="py-2 px-3">Instructions</th>
                    {!isAlreadyAuthorized && <th className="py-2 px-3 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medicines.map((med) => (
                    <tr key={med.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{med.medicineName}</td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {med.dosage} · <span className="text-slate-500">{med.route}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {med.frequency} · <span className="font-semibold">{med.duration}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">{med.instructions}</td>
                      {!isAlreadyAuthorized && (
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleRemoveMedicine(med.id)}
                            className="text-rose-600 hover:text-rose-800 p-1"
                            title="Remove medication"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Medication Row */}
        {!isAlreadyAuthorized && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                + Add New Prescription Line
              </span>

              {/* Quick Preset Selector */}
              <select
                onChange={(e) => {
                  const found = COMMON_MEDICATIONS.find((m) => m.name === e.target.value);
                  if (found) {
                    setNewMed({
                      name: found.name,
                      dosage: found.defaultDose,
                      route: found.route,
                      frequency: found.freq,
                      duration: '5 days',
                      instructions: found.instructions,
                    });
                  }
                }}
                className="text-xs border border-slate-300 rounded px-2 py-1 bg-white"
                defaultValue=""
              >
                <option value="" disabled>
                  Select from Formulary Presets...
                </option>
                {COMMON_MEDICATIONS.map((m, idx) => (
                  <option key={idx} value={m.name}>
                    {m.name} ({m.defaultDose})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                  Medicine Name & Formulation *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Azithromycin 500mg"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Dosage</label>
                <input
                  type="text"
                  placeholder="e.g. 500 mg"
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Route</label>
                <select
                  value={newMed.route}
                  onChange={(e) => setNewMed({ ...newMed, route: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                >
                  <option value="Oral">Oral (PO)</option>
                  <option value="Inhalation">Inhalation</option>
                  <option value="Topical">Topical</option>
                  <option value="Sublingual">Sublingual</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Frequency</label>
                <input
                  type="text"
                  placeholder="e.g. Once daily / Twice daily"
                  value={newMed.frequency}
                  onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 5 days / PRN"
                  value={newMed.duration}
                  onChange={(e) => setNewMed({ ...newMed, duration: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                  Special Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Complete full course. Take after food."
                  value={newMed.instructions}
                  onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleAddMedicine}
                disabled={!newMed.name.trim()}
                className="px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-800 disabled:opacity-50 text-white rounded text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Prescription</span>
              </button>
            </div>
          </div>
        )}

        {/* Doctor Instructions & Clinical Notation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Patient Care Advice & Warnings
            </label>
            <textarea
              rows={3}
              value={generalInstructions}
              onChange={(e) => setGeneralInstructions(e.target.value)}
              disabled={isAlreadyAuthorized}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs leading-relaxed"
              placeholder="e.g. Drink warm fluids, steam inhalation twice daily, seek immediate care if SpO2 < 94%..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Confidential Physician Record Notes
            </label>
            <textarea
              rows={3}
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              disabled={isAlreadyAuthorized}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs leading-relaxed"
              placeholder="e.g. Penicillin allergy confirmed and verified in person. Macrolide chosen as safe therapeutic alternative..."
            />
          </div>
        </div>
      </div>

      {/* Doctor Authorization Confirmation Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Confirm Digital Prescription Authorization
                </h3>
                <p className="text-xs text-slate-500">
                  Electronic Medical Signature Verification
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5 text-slate-700">
              <p>
                <strong>Attending Doctor:</strong> {prescription.doctorName}
              </p>
              <p>
                <strong>License:</strong> {prescription.doctorLicense}
              </p>
              <p>
                <strong>Patient:</strong> {prescription.patientName} (ID: {prescription.patientId})
              </p>
              <p>
                <strong>Total Medications:</strong> {medicines.length} items
              </p>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              By authorizing, you certify that you have reviewed all AI-extracted symptoms, OCR document records, and red flags, and that you take full clinical legal responsibility for this prescription.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="px-3.5 py-1.5 border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAuthorizeConfirm}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Confirm & Sign Digitally</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
