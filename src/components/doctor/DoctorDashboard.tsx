import React, { useState } from 'react';
import { Users, Clock, AlertTriangle, CheckCircle2, Search, ArrowRight, Stethoscope } from 'lucide-react';
import { Patient } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface DoctorDashboardProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
  doctorName: string;
  doctorLicense: string;
  doctorSpecialty: string;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  doctorName,
  doctorLicense,
  doctorSpecialty,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PRIORITY' | 'WAITING'>('ALL');
  const [search, setSearch] = useState('');

  const waitingCount = patients.filter((p) => p.status === 'Waiting').length;
  const priorityCount = patients.filter((p) => p.priority === 'AMBER' || p.priority === 'RED').length;
  const inConsultCount = patients.filter((p) => p.status === 'In Consultation').length;

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.patientId.toLowerCase().includes(search.toLowerCase());

    if (filter === 'PRIORITY') {
      return matchesSearch && (p.priority === 'AMBER' || p.priority === 'RED');
    }
    if (filter === 'WAITING') {
      return matchesSearch && p.status === 'Waiting';
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Doctor Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 flex items-center justify-center shrink-0">
            <Stethoscope className="w-7 h-7 text-cyan-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{doctorName}</h2>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                {doctorLicense}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{doctorSpecialty}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-left sm:text-right">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
              Consultation Station
            </span>
            <span className="text-xs font-semibold text-slate-800">
              Station #02 · Active Outpatient Triage
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total In Queue</span>
            <Users className="w-4 h-4 text-cyan-700" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono tabular-nums">
            {patients.length}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Active registrations today</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Priority Reviews</span>
            <AlertTriangle className="w-4 h-4 text-amber-700" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2 font-mono tabular-nums">
            {priorityCount}
          </p>
          <span className="text-[11px] text-amber-800/80 mt-1 block">Amber / Red safety flags</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Waiting Patients</span>
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono tabular-nums">
            {waitingCount}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Avg wait: 14 minutes</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">In Consultation</span>
            <CheckCircle2 className="w-4 h-4 text-teal-700" />
          </div>
          <p className="text-2xl font-bold text-teal-700 mt-2 font-mono tabular-nums">
            {inConsultCount}
          </p>
          <span className="text-[11px] text-teal-800/80 mt-1 block">Reviewing AI briefs</span>
        </div>
      </div>

      {/* Patient Queue Management Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Live Clinical Queue & Triage Dashboard
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Patients categorized by deterministic safety rules and AI triage synthesis.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-cyan-600"
              />
            </div>

            <div className="flex items-center p-0.5 bg-slate-100 rounded text-xs">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  filter === 'ALL' ? 'bg-white font-semibold text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('PRIORITY')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  filter === 'PRIORITY' ? 'bg-white font-semibold text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Priority
              </button>
              <button
                onClick={() => setFilter('WAITING')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  filter === 'WAITING' ? 'bg-white font-semibold text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Waiting
              </button>
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Patient Name & ID</th>
                <th className="py-2.5 px-3">Age / Gender</th>
                <th className="py-2.5 px-3">Triage Priority</th>
                <th className="py-2.5 px-3">Chief Complaint</th>
                <th className="py-2.5 px-3">Wait Time</th>
                <th className="py-2.5 px-3">Consultation Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((patient) => {
                const isSelected = patient.id === selectedPatientId;
                return (
                  <tr
                    key={patient.id}
                    className={`transition-colors hover:bg-slate-50/70 ${
                      isSelected ? 'bg-cyan-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{patient.fullName}</span>
                      <span className="text-[11px] font-mono text-slate-500">{patient.patientId}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {patient.age}y · {patient.gender}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge priority={patient.priority} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-slate-700 max-w-xs truncate">
                      {patient.existingConditions?.length > 0 ? (
                        <span>
                          {patient.id === 'pat-1024'
                            ? 'Fever (102.2°F) & productive cough (3d)'
                            : patient.id === 'pat-1025'
                            ? 'Chest tightness & acute dyspnea (4h)'
                            : 'Seasonal rhinitis & medication refill'}
                        </span>
                      ) : (
                        <span>Intake check-up</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-slate-600 text-[11px]">
                      {patient.waitingTimeMinutes || 5} min
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={patient.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectPatient(patient.id)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors inline-flex items-center gap-1 ${
                          isSelected
                            ? 'bg-cyan-700 text-white'
                            : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span>{isSelected ? 'In Workspace' : 'Open Workspace'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
