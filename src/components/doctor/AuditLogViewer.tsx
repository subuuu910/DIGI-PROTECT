import React, { useState } from 'react';
import { ShieldCheck, Search, Filter } from 'lucide-react';
import { AuditLogEntry } from '../../types';

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'PATIENT' | 'DOCTOR'>('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || log.actorRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Clinical & System Audit Trail</h3>
            <span className="text-[11px] font-mono text-slate-500 font-medium">
              {filteredLogs.length} Logged Events
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable regulatory audit log for patient consent, OCR processing, clinical edits, and e-prescription authorization.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-cyan-600"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-700"
          >
            <option value="ALL">All Roles</option>
            <option value="PATIENT">Patient Actions</option>
            <option value="DOCTOR">Doctor Actions</option>
          </select>
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Actor & Role</th>
              <th className="py-2.5 px-3">Action</th>
              <th className="py-2.5 px-3">Entity</th>
              <th className="py-2.5 px-3">Audit Details</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {filteredLogs.map((log) => {
              let statusClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
              if (log.status === 'WARNING') statusClass = 'text-amber-800 bg-amber-50 border-amber-200';
              if (log.status === 'CRITICAL') statusClass = 'text-rose-700 bg-rose-50 border-rose-200';

              return (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap text-[11px] tabular-nums">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-900 block">{log.actor}</span>
                    <span className="text-[10px] uppercase font-mono text-slate-500">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{log.action}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">{log.entityId}</td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-xs sm:max-w-md truncate text-[11px]">
                    {log.details}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`inline-block border text-[10px] font-bold px-1.5 py-0.5 rounded ${statusClass}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
