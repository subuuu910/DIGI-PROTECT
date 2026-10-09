import React, { useState } from 'react';
import { ShieldCheck, UserPlus, X, AlertCircle } from 'lucide-react';
import { Patient } from '../../types';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Patient>) => Promise<void>;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    dob: '',
    phone: '',
    email: '',
    emergencyName: '',
    emergencyRel: 'Spouse',
    emergencyPhone: '',
    existingConditions: '',
    knownAllergies: '',
    currentMedicines: '',
    consentGiven: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) < 1 || Number(formData.age) > 120) {
      newErrors.age = 'Valid age (1-120) is required';
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      newErrors.phone = 'Valid phone number is required';
    }
    if (!formData.emergencyPhone.trim()) {
      newErrors.emergencyPhone = 'Emergency contact phone is required';
    }
    if (!formData.consentGiven) {
      newErrors.consent = 'You must grant informed consent for clinical information processing';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit({
        fullName: formData.fullName.trim(),
        age: parseInt(formData.age, 10),
        gender: formData.gender,
        dob: formData.dob || '1990-01-01',
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        emergencyContact: {
          name: formData.emergencyName || 'Primary Contact',
          relationship: formData.emergencyRel || 'Family',
          phone: formData.emergencyPhone.trim(),
        },
        existingConditions: formData.existingConditions
          ? formData.existingConditions.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        knownAllergies: formData.knownAllergies
          ? formData.knownAllergies.split(',').map((s) => s.trim()).filter(Boolean)
          : ['None declared in form'],
        currentMedicines: formData.currentMedicines
          ? formData.currentMedicines.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        consentGiven: formData.consentGiven,
      });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to submit registration' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-cyan-50 text-cyan-700 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Patient Intake Registration</h2>
              <p className="text-xs text-slate-500">Provide basic demographic and medical details before clinical triage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs sm:text-sm">
          {errors.form && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-md flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Demographics */}
          <div>
            <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-3">
              1. Personal Demographics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Verma"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-xs sm:text-sm ${
                    errors.fullName ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-300'
                  }`}
                />
                {errors.fullName && <p className="text-rose-600 text-[11px] mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Age *</label>
                <input
                  type="number"
                  placeholder="e.g. 42"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-xs sm:text-sm ${
                    errors.age ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-300'
                  }`}
                />
                {errors.age && <p className="text-rose-600 text-[11px] mt-1">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs sm:text-sm bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-xs sm:text-sm ${
                    errors.phone ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-300'
                  }`}
                />
                {errors.phone && <p className="text-rose-600 text-[11px] mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-3">
              2. Emergency Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Pooja Verma"
                  value={formData.emergencyName}
                  onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Relationship</label>
                <input
                  type="text"
                  placeholder="e.g. Spouse / Parent"
                  value={formData.emergencyRel}
                  onChange={(e) => setFormData({ ...formData, emergencyRel: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Emergency Phone *</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43211"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-xs sm:text-sm ${
                    errors.emergencyPhone ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-300'
                  }`}
                />
                {errors.emergencyPhone && (
                  <p className="text-rose-600 text-[11px] mt-1">{errors.emergencyPhone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Known Medical Profile */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-3">
              3. Baseline Medical Baseline (Self-Reported)
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Existing Medical Conditions (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mild Asthma, Hypertension, Diabetes"
                  value={formData.existingConditions}
                  onChange={(e) => setFormData({ ...formData, existingConditions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Known Drug / Food Allergies (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa drugs, Peanuts, or 'None'"
                  value={formData.knownAllergies}
                  onChange={(e) => setFormData({ ...formData, knownAllergies: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Current Daily Medications (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Salbutamol Inhaler, Metformin 500mg"
                  value={formData.currentMedicines}
                  onChange={(e) => setFormData({ ...formData, currentMedicines: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Explicit Consent Section */}
          <div className="pt-2 border-t border-slate-100 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-start gap-3">
              <input
                id="consentCheckbox"
                type="checkbox"
                checked={formData.consentGiven}
                onChange={(e) => setFormData({ ...formData, consentGiven: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-cyan-700 focus:ring-cyan-600"
              />
              <label htmlFor="consentCheckbox" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                <span className="font-semibold text-slate-900 block mb-0.5">
                  Explicit Patient Informed Consent for AI Clinical Triage Preparation
                </span>
                I hereby grant consent for MediKiosk to process my medical symptoms, optical character recognition (OCR) of uploaded documents, and historical medical records to generate a synthesized pre-consultation brief. I understand that{' '}
                <strong>AI does not diagnose or prescribe independently</strong>, and all clinical assessments will be reviewed and verified by a licensed physician before any treatment is authorized.
              </label>
            </div>
            {errors.consent && <p className="text-rose-600 text-xs mt-2 ml-7">{errors.consent}</p>}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-md text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Registering Intake...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Accept Terms & Proceed to Triage</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
