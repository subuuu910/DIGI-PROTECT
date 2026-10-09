import React from 'react';
import { TriagePriority } from '../../types';

interface StatusBadgeProps {
  priority?: TriagePriority;
  status?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ priority, status, size = 'md' }) => {
  if (priority) {
    if (priority === 'RED') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium text-rose-700 bg-rose-50 border border-rose-200/80 rounded px-2.5 py-0.5 ${
            size === 'sm' ? 'text-xs' : 'text-xs'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
          Urgent Review (Red)
        </span>
      );
    }
    if (priority === 'AMBER') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium text-amber-800 bg-amber-50 border border-amber-200/80 rounded px-2.5 py-0.5 ${
            size === 'sm' ? 'text-xs' : 'text-xs'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          Priority Review (Amber)
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded px-2.5 py-0.5 ${
          size === 'sm' ? 'text-xs' : 'text-xs'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
        Routine (Green)
      </span>
    );
  }

  if (status) {
    let colorClass = 'text-slate-700 bg-slate-100 border-slate-200';
    if (status === 'AUTHORIZED' || status === 'VERIFIED' || status === 'Completed') {
      colorClass = 'text-emerald-800 bg-emerald-50 border-emerald-200';
    } else if (status === 'DRAFT' || status === 'Waiting') {
      colorClass = 'text-amber-800 bg-amber-50 border-amber-200';
    } else if (status === 'In Consultation' || status === 'Prescription Ready') {
      colorClass = 'text-cyan-800 bg-cyan-50 border-cyan-200';
    }

    return (
      <span className={`inline-flex items-center font-medium border rounded px-2 py-0.5 text-xs ${colorClass}`}>
        {status}
      </span>
    );
  }

  return null;
};
