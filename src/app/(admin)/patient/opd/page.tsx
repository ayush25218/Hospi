'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { LuCalendarDays, LuClock3, LuFilter, LuSearch, LuStethoscope, LuUserRound } from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { useSession } from '@/hooks/use-session';
import {
  apiRequest,
  describeError,
  formatDateTime,
  formatRecordId,
  type AppointmentRecord,
  type AppointmentStatus,
} from '@/lib/api-client';

type TimeRange = 'daily' | 'monthly' | 'yearly' | 'all';

export default function OPDPage() {
  const session = useSession();
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.token) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadAppointments = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await apiRequest<AppointmentRecord[]>('/appointments', {}, session);

        if (isActive) {
          setAppointments(response);
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load OPD visits right now.'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadAppointments();

    return () => {
      isActive = false;
    };
  }, [session]);

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const today = new Date();

    return appointments.filter((appointment) => {
      const visitDate = new Date(appointment.scheduledAt);

      const matchesSearch =
        normalizedSearch.length === 0 ||
        appointment.patient.user.name.toLowerCase().includes(normalizedSearch) ||
        appointment.doctor.user.name.toLowerCase().includes(normalizedSearch) ||
        appointment.reason.toLowerCase().includes(normalizedSearch) ||
        formatRecordId('VIS', appointment._id).toLowerCase().includes(normalizedSearch);

      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;

      let matchesTime = true;

      if (timeRange === 'daily') {
        matchesTime = visitDate.toDateString() === today.toDateString();
      } else if (timeRange === 'monthly') {
        matchesTime =
          visitDate.getMonth() === today.getMonth() && visitDate.getFullYear() === today.getFullYear();
      } else if (timeRange === 'yearly') {
        matchesTime = visitDate.getFullYear() === today.getFullYear();
      }

      return matchesSearch && matchesStatus && matchesTime;
    });
  }, [appointments, searchTerm, statusFilter, timeRange]);

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="OPD visits now load from MongoDB appointments. Sign in again through the admin portal to monitor the live visit queue."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
              <LuCalendarDays className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">Out-Patient Visits</h1>
              <p className="mt-1 text-sm text-slate-500">
                Live visit queue sourced directly from the appointment schedule.
              </p>
            </div>
          </div>

          <Link
            href="/appointment/add"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Create appointment
          </Link>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <LuSearch className="h-4 w-4 text-slate-400" />
              Search visits
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Patient, doctor, reason, or visit ref"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-950 placeholder:text-slate-950 outline-none transition focus:border-cyan-400"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <LuFilter className="h-4 w-4 text-slate-400" />
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | AppointmentStatus)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-400"
            >
              <option value="all">All statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(['daily', 'monthly', 'yearly', 'all'] as TimeRange[]).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                timeRange === range ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600">Visit</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600">Patient</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600">Doctor</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600">Schedule</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                    Loading OPD visits...
                  </td>
                </tr>
              ) : filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{formatRecordId('VIS', appointment._id)}</p>
                      <p className="text-xs text-slate-500">{appointment.reason}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="flex items-center gap-2 font-medium text-slate-900">
                        <LuUserRound className="h-4 w-4 text-slate-400" />
                        {appointment.patient.user.name}
                      </p>
                      <p className="text-xs text-slate-500">{formatRecordId('PAT', appointment.patient._id)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="flex items-center gap-2 font-medium text-slate-900">
                        <LuStethoscope className="h-4 w-4 text-slate-400" />
                        {appointment.doctor.user.name}
                      </p>
                      <p className="text-xs text-slate-500">{appointment.doctor.department}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <LuClock3 className="h-4 w-4 text-slate-400" />
                        {formatDateTime(appointment.scheduledAt)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                    No OPD visits found for the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function getStatusClasses(status: AppointmentStatus) {
  switch (status) {
    case 'confirmed':
      return 'bg-sky-100 text-sky-700';
    case 'completed':
      return 'bg-emerald-100 text-emerald-700';
    case 'cancelled':
      return 'bg-rose-100 text-rose-700';
    case 'scheduled':
    default:
      return 'bg-amber-100 text-amber-700';
  }
}
