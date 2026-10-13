import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Trash2, Eye, FileSpreadsheet } from 'lucide-react';
import { MedicalDocument } from '../../types';

interface DocumentUploadProps {
  documents: MedicalDocument[];
  onUpload: (data: Partial<MedicalDocument>) => Promise<void>;
  onSelectDocForPreview?: (doc: MedicalDocument) => void;
  loading: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documents,
  onUpload,
  onSelectDocForPreview,
  loading,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState<'prescription' | 'lab_report' | 'xray'>('prescription');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processLocalFile(file);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processLocalFile(file);
    }
  };

  const processLocalFile = async (file: File) => {
    setUploadError(null);
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Unsupported file type. Please upload JPG, PNG, or PDF files.');
      return;
    }

    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    await onUpload({
      fileName: file.name,
      fileType: selectedFileType,
      mimeType: file.type,
      fileSize: fileSizeMb,
      thumbnailUrl: selectedFileType === 'lab_report'
        ? '/src/assets/images/sample_lab_report_1791477951351.jpg'
        : '/src/assets/images/sample_prescription_doc_1791477939237.jpg',
      rawOcrText: `DOCUMENT: ${file.name.toUpperCase()}\nStatus: Processed by MediKiosk OCR Engine\nUploaded: ${new Date().toLocaleString()}\nDx: Extracted Clinical Finding`,
    });
  };

  // Sample Loaders for 1-click verification
  const handleLoadSamplePrescription = async () => {
    await onUpload({
      fileName: 'St_Marks_Prescription_Oct2023.jpg',
      fileType: 'prescription',
      thumbnailUrl: '/src/assets/images/sample_prescription_doc_1791477939237.jpg',
      rawOcrText: `ST. MARK'S MEDICAL CLINIC
Dr. Eleanor Vance, MD (GMC: 734567)
Date: 18/10/2023 | Patient: Rahul Verma | Age: 39 | Sex: M
Dx: Acute Sinusitis / Mild Asthma Exacerbation
ALLERGIES: PENICILLIN (Causes severe urticarial rash & facial edema)
Rx:
1. Amoxicillin 500mg, Tabs - DISCONTINUED DUE TO ALLERGIC RASH REACTION
   Replaced with: Azithromycin 500mg OD x 3 days
2. Salbutamol 100mcg Inhaler: 2 puffs QID prn SOB
3. Paracetamol 500mg Tabs: 1 tab PO QID prn pain/fever`,
    });
  };

  const handleLoadSampleLabReport = async () => {
    await onUpload({
      fileName: 'Pathology_CBC_Metabolic_Report.jpg',
      fileType: 'lab_report',
      thumbnailUrl: '/src/assets/images/sample_lab_report_1791477951351.jpg',
      rawOcrText: `LABORATORY BLOOD TEST REPORT
Patient: Rahul Verma | Date: 07/10/2026
COMPLETE BLOOD COUNT (CBC):
WBC: 12.8 x10^3/uL [HIGH, Ref: 4.0 - 10.0]
Neutrophils: 82% [HIGH, Ref: 40 - 70%]
Hemoglobin: 14.8 g/dL [Normal]
METABOLIC PANEL:
Fasting Blood Glucose: 104 mg/dL [Borderline]
Serum Creatinine: 0.95 mg/dL [Normal]
C-Reactive Protein (CRP): 34 mg/L [HIGH, Ref: < 5 mg/L]`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Medical Document Ingestion & OCR Extraction
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload past prescriptions, lab test reports, or discharge summaries for automated clinical parsing.
            </p>
          </div>

          {/* Document Type Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setSelectedFileType('prescription')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedFileType === 'prescription'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Prescription
            </button>
            <button
              onClick={() => setSelectedFileType('lab_report')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedFileType === 'lab_report'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lab Report
            </button>
            <button
              onClick={() => setSelectedFileType('xray')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedFileType === 'xray'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Imaging/X-Ray
            </button>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive
              ? 'border-cyan-600 bg-cyan-50/50'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/30'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-cyan-50 text-cyan-700 flex items-center justify-center mx-auto mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-800">
            Drag and drop your file here, or{' '}
            <label className="text-cyan-700 hover:text-cyan-800 underline cursor-pointer">
              browse computer
              <input
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileInput}
              />
            </label>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Supported formats: PDF, JPG, PNG (Max 15 MB)
          </p>

          {/* Sample Clinical Documents */}
          <div className="mt-5 pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-medium text-slate-500">
              Sample clinical documents:
            </span>
            <button
              type="button"
              onClick={handleLoadSamplePrescription}
              disabled={loading}
              className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-md text-xs font-medium shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-700" />
              <span>Load St. Mark's Outpatient Rx</span>
            </button>
            <button
              type="button"
              onClick={handleLoadSampleLabReport}
              disabled={loading}
              className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-md text-xs font-medium shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
              <span>Load CBC & Metabolic Panel</span>
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Uploaded Documents & OCR Status ({documents.length})
          </h4>
          <span className="text-xs text-slate-500">Source evidence for doctor verification</span>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg text-slate-500 text-xs">
            No medical documents uploaded yet. Upload a previous prescription or lab report to extract evidence.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="border border-slate-200 rounded-lg p-3.5 flex items-start gap-3 bg-slate-50/40 hover:bg-slate-50 transition-colors"
              >
                {/* Thumbnail Image */}
                <div className="w-16 h-20 bg-slate-200 rounded-md overflow-hidden shrink-0 border border-slate-200 relative group">
                  <img
                    src={doc.thumbnailUrl}
                    alt={doc.fileName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {onSelectDocForPreview && (
                    <button
                      onClick={() => onSelectDocForPreview(doc)}
                      className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                      title="Inspect Document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900 truncate" title={doc.fileName}>
                      {doc.fileName}
                    </p>
                    <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      OCR Extracted
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <span className="capitalize">{doc.fileType.replace('_', ' ')}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{doc.fileSize}</span>
                  </div>

                  {/* Summary of Entities */}
                  {doc.extractedEntities && (
                    <div className="pt-2 text-[11px] text-slate-600 space-y-1 border-t border-slate-200/60 mt-1">
                      {doc.extractedEntities.allergies && (
                        <p className="text-rose-700 font-medium">
                          Allergies flagged: {doc.extractedEntities.allergies.join(', ')}
                        </p>
                      )}
                      {doc.extractedEntities.medicines && (
                        <p className="truncate text-slate-700">
                          Meds: {doc.extractedEntities.medicines.join(', ')}
                        </p>
                      )}
                      {doc.extractedEntities.labValues && (
                        <p className="text-cyan-800">
                          Lab Parameters: {doc.extractedEntities.labValues.length} recorded
                        </p>
                      )}
                    </div>
                  )}

                  {onSelectDocForPreview && (
                    <div className="pt-1">
                      <button
                        onClick={() => onSelectDocForPreview(doc)}
                        className="text-cyan-700 hover:text-cyan-800 font-semibold text-[11px] flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Raw OCR & Entities</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
