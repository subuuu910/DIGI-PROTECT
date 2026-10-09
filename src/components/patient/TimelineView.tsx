import React from 'react';
import { Calendar, FileText, Activity, Stethoscope } from 'lucide-react';
import { TimelineEvent } from '../../types';

interface TimelineViewProps {
  timeline: TimelineEvent[];
  onSelectDoc?: (docId: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ timeline, onSelectDoc }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Chronological Medical Timeline</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sequential synthesis of previous clinical consultations, lab tests, and today's AI pre-consultation.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500 font-medium">
          {timeline.length} Medical Milestones
        </span>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {timeline.map((event) => {
          let Icon = FileText;
          let iconColor = 'bg-cyan-700 text-white';

          if (event.category === 'Lab Test') {
            Icon = Activity;
            iconColor = 'bg-teal-700 text-white';
          } else if (event.category === 'Clinical Interview') {
            Icon = Stethoscope;
            iconColor = 'bg-blue-700 text-white';
          } else if (event.category === 'Treatment') {
            Icon = Calendar;
            iconColor = 'bg-emerald-700 text-white';
          }

          return (
            <div key={event.id} className="relative group">
              {/* Dot Icon on timeline */}
              <div
                className={`absolute -left-[27px] sm:-left-[31px] top-1 w-6 h-6 rounded-full flex items-center justify-center shadow-xs text-xs ${iconColor}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              {/* Event Card */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{event.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-cyan-800">{event.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{event.date}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>

                {event.medicines && event.medicines.length > 0 && (
                  <div className="mt-2 text-xs text-slate-700 flex flex-wrap items-center gap-1.5">
                    <span className="font-medium text-slate-500">Documented Meds:</span>
                    {event.medicines.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-white border border-slate-200 text-slate-800 rounded text-[11px]"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                )}

                {event.relevantFinding && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-xs font-medium text-slate-800 flex items-center gap-1.5">
                    <span className="text-cyan-700">Clinical Finding:</span>
                    <span>{event.relevantFinding}</span>
                  </div>
                )}

                {event.sourceDocId && onSelectDoc && (
                  <button
                    onClick={() => onSelectDoc(event.sourceDocId!)}
                    className="mt-2 text-[11px] text-cyan-700 hover:text-cyan-800 font-semibold underline"
                  >
                    View Original Source Document →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
