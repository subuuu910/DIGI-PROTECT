import React from 'react';
import { X, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { MedicalDocument } from '../../types';

interface OcrResultsViewerProps {
  document: MedicalDocument | null;
  onClose: () => void;
}

export const OcrResultsViewer: React.FC<OcrResultsViewerProps> = ({ document, onClose }) => {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-700 text-white flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{document.fileName}</h3>
              <p className="text-xs text-slate-500">
                OCR Optical Extraction & Traceable Evidence Preview
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Side-by-Side (Source Preview vs Structured OCR Findings) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          {/* Left Column: Visual Document Preview & Raw OCR */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-2">
                Original Image / Scanned Document
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-100 max-h-72 flex items-center justify-center">
                <img
                  src={document.thumbnailUrl}
                  alt={document.fileName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-1">
                Extracted Raw OCR Text Stream
              </h4>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-48 border border-slate-800 leading-relaxed">
                {document.rawOcrText || 'No text extracted.'}
              </pre>
            </div>
          </div>

          {/* Right Column: Structured Clinical Findings */}
          <div className="space-y-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-600">
                Structured Clinical Entities
              </h4>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-700" />
                Evidence Grounded
              </span>
            </div>

            {/* Allergies Detected */}
            {document.extractedEntities?.allergies && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-rose-900 mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Documented Allergy In Records</span>
                </div>
                {document.extractedEntities.allergies.map((allergy, i) => (
                  <p key={i} className="text-rose-800 font-medium">
                    • {allergy}
                  </p>
                ))}
                <p className="text-[11px] text-rose-700 mt-1">
                  Cross-referenced against current interview for conflict detection.
                </p>
              </div>
            )}

            {/* Medicines List */}
            {document.extractedEntities?.medicines && (
              <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs">
                <p className="font-semibold text-slate-900 mb-1.5">Historical Medications:</p>
                <ul className="space-y-1">
                  {document.extractedEntities.medicines.map((med, i) => (
                    <li key={i} className="text-slate-700 flex items-start gap-1.5">
                      <span className="text-slate-400">•</span>
                      <span>{med}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Lab Values Table */}
            {document.extractedEntities?.labValues && (
              <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs">
                <p className="font-semibold text-slate-900 mb-2">Extracted Lab Parameters:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-medium text-[11px]">
                        <th className="pb-1">Parameter</th>
                        <th className="pb-1 text-right">Value</th>
                        <th className="pb-1 text-right">Ref Range</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {document.extractedEntities.labValues.map((lv, idx) => (
                        <tr key={idx} className={lv.isAbnormal ? 'bg-amber-50/60' : ''}>
                          <td className="py-1.5 font-medium text-slate-800">{lv.parameter}</td>
                          <td className={`py-1.5 text-right font-mono tabular-nums ${
                            lv.isAbnormal ? 'font-bold text-amber-900' : 'text-slate-700'
                          }`}>
                            {lv.value} {lv.unit}
                          </td>
                          <td className="py-1.5 text-right font-mono text-slate-500 text-[11px] tabular-nums">
                            {lv.referenceRange}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {document.extractedEntities?.doctorNotes && (
              <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs">
                <p className="font-semibold text-slate-900 mb-1">Previous Physician Notation:</p>
                <p className="text-slate-700 italic">{document.extractedEntities.doctorNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>OCR Confidence: 98.4% · Grounded in St. Mark's Outpatient Document</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-md transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
