'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  LuCalendarCheck,
  LuCalendarDays,
  LuCalendarPlus,
  LuFilePenLine,
  LuFilter,
  LuHourglass,
  LuPrinter,
  LuSearch,
  LuSparkles,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import {
  apiRequest,
  describeError,
  formatDateTime,
  formatRecordId,
  type AppointmentRecord,
  type AppointmentStatus,
} from '@/lib/api-client';
import { useSession } from '@/hooks/use-session';

type StatusFilter = 'all' | AppointmentStatus;
type TimeRange = 'all' | 'daily' | 'monthly' | 'quarterly' | 'yearly';

const statuses: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const filterButtons: { label: string; range: TimeRange }[] = [
  { label: 'All Time', range: 'all' },
  { label: 'Daily', range: 'daily' },
  { label: 'Monthly', range: 'monthly' },
  { label: 'Quarterly', range: 'quarterly' },
  { label: 'Yearly', range: 'yearly' },
];

export default function AppointmentsPage() {
  const session = useSession();
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
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
          setError(describeError(loadError, 'Unable to load appointments right now.'));
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
    return appointments.filter((appointment) => {
      const today = new Date();
      const appointmentDate = new Date(appointment.scheduledAt);
      const normalizedSearch = searchTerm.toLowerCase();

      const matchesSearch =
        appointment.patient.user.name.toLowerCase().includes(normalizedSearch) ||
        appointment.doctor.user.name.toLowerCase().includes(normalizedSearch) ||
        formatRecordId('APT', appointment._id).toLowerCase().includes(normalizedSearch);

      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;

      let matchesTime = false;
      switch (timeRange) {
        case 'daily':
          matchesTime = appointmentDate.toDateString() === today.toDateString();
          break;
        case 'monthly':
          matchesTime =
            appointmentDate.getMonth() === today.getMonth() &&
            appointmentDate.getFullYear() === today.getFullYear();
          break;
        case 'quarterly':
          matchesTime =
            Math.floor(appointmentDate.getMonth() / 3) === Math.floor(today.getMonth() / 3) &&
            appointmentDate.getFullYear() === today.getFullYear();
          break;
        case 'yearly':
          matchesTime = appointmentDate.getFullYear() === today.getFullYear();
          break;
        case 'all':
        default:
          matchesTime = true;
      }

      return matchesSearch && matchesStatus && matchesTime;
    });
  }, [appointments, searchTerm, statusFilter, timeRange]);

  const summary = useMemo(() => {
    return {
      total: filteredAppointments.length,
      confirmed: filteredAppointments.filter((appointment) => appointment.status === 'confirmed').length,
      pending: filteredAppointments.filter((appointment) => appointment.status === 'scheduled').length,
      completed: filteredAppointments.filter((appointment) => appointment.status === 'completed').length,
    };
  }, [filteredAppointments]);

  const handlePrint = () => {
    window.print();
  };

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Appointments now load from MongoDB. Sign in again through the admin portal to view the synced list."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="hospi-panel overflow-hidden rounded-[2.2rem] px-6 py-8 text-white shadow-[0_28px_90px_rgba(5,12,24,0.42)] sm:px-8 non-printable">
        <div className="grid gap-8 lg:grid-cols-[1.14fr_0.86fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">
              <LuCalendarCheck className="h-4 w-4" />
              Appointment command board
            </div>

            <div>
              <h1 className="text-4xl font-semibold leading-[0.95] text-white sm:text-5xl">
                Manage live bookings in a cleaner, more responsive workflow.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/66 sm:text-base">
                Search, filter, review, and edit appointments from one brighter control surface built for daily admin work.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/appointment/add"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                <LuCalendarPlus className="h-4 w-4" />
                New Appointment
              </Link>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.09]"
              >
                <LuPrinter className="h-4 w-4" />
                Print View
              </button>
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.8rem] border border-white/10 bg-white/[0.05] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white/74">Filter state</p>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
                <LuSparkles className="h-3.5 w-3.5" />
                Synced
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryTile label="Visible now" value={String(summary.total)} />
              <SummaryTile label="Confirmed" value={String(summary.confirmed)} />
              <SummaryTile label="Pending" value={String(summary.pending)} />
              <SummaryTile label="Completed" value={String(summary.completed)} />
            </div>
          </div>
        </div>
      </section>

      <section className="hospi-light-panel rounded-[1.9rem] p-5 text-slate-950 non-printable">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <LuSearch className="h-4 w-4 text-slate-400" />
              Search appointments
            </span>
            <input
              type="text"
              placeholder="Search patient, doctor, or appointment ID..."
              className="w-full rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-400"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <LuFilter className="h-4 w-4 text-slate-400" />
              Status
            </span>
            <select
              className="w-full appearance-none rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-cyan-400"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="flex items-center text-sm font-medium text-slate-600">
            <LuCalendarDays className="mr-2 h-4 w-4" />
            Filter by date:
          </span>
          {filterButtons.map((button) => (
            <button
              key={button.range}
              onClick={() => setTimeRange(button.range)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                timeRange === button.range
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="printable-area">
        <div className="grid gap-4 lg:hidden">
          {isLoading ? (
            <div className="hospi-light-panel rounded-[1.8rem] px-4 py-10 text-center text-sm text-slate-500">
              Loading appointments...
            </div>
          ) : filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => {
              const statusProps = getStatusProps(appointment.status);

              return (
                <article key={appointment._id} className="hospi-light-panel rounded-[1.8rem] p-5 text-slate-950">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        {formatRecordId('APT', appointment._id)}
                      </p>
                      <h2 className="mt-2 text-lg font-semibold text-slate-950">{appointment.patient.user.name}</h2>
                      <p className="mt-1 text-sm text-slate-500">{appointment.doctor.user.name}</p>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusProps.color}`}>
                      {statusProps.label}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p>{appointment.doctor.specialization}</p>
                    <p>{formatDateTime(appointment.scheduledAt)}</p>
                  </div>

                  <div className="mt-5">
                    <Link
                      href={`/appointment/edit/${appointment._id}`}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <LuFilePenLine className="h-4 w-4" />
                      Edit appointment
                    </Link>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="hospi-light-panel rounded-[1.8rem] px-4 py-10 text-center text-sm text-slate-500">
              No appointments found matching your criteria.
            </div>
          )}
        </div>

        <div className="hospi-light-panel hidden overflow-hidden rounded-[1.9rem] text-slate-950 shadow-sm lg:block">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-4 text-sm font-semibold text-slate-600">Appointment</th>
                  <th className="px-4 py-4 text-sm font-semibold text-slate-600">Patient</th>
                  <th className="px-4 py-4 text-sm font-semibold text-slate-600">Doctor</th>
                  <th className="px-4 py-4 text-sm font-semibold text-slate-600">Date & Time</th>
                  <th className="px-4 py-4 text-sm font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-4 text-sm font-semibold text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                      Loading appointments...
                    </td>
                  </tr>
                ) : filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => {
                    const statusProps = getStatusProps(appointment.status);

                    return (
                      <tr key={appointment._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                        <td className="px-4 py-4 text-sm text-slate-700">{formatRecordId('APT', appointment._id)}</td>
                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-950">{appointment.patient.user.name}</p>
                          <p className="text-xs text-slate-500">{formatRecordId('PAT', appointment.patient._id)}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-950">{appointment.doctor.user.name}</p>
                          <p className="text-xs text-slate-500">{appointment.doctor.specialization}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">{formatDateTime(appointment.scheduledAt)}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusProps.color}`}
                          >
                            {statusProps.icon}
                            {statusProps.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            href={`/appointment/edit/${appointment._id}`}
                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <LuFilePenLine className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                      No appointments found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.05] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/42">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function getStatusProps(status: AppointmentStatus) {
  switch (status) {
    case 'completed':
      return {
        color: 'bg-emerald-100 text-emerald-700',
        icon: <div className="h-4 w-4" />,
        label: 'Completed',
      };
    case 'confirmed':
      return {
        color: 'bg-cyan-100 text-cyan-700',
        icon: <div className="h-4 w-4" />,
        label: 'Confirmed',
      };
    case 'cancelled':
      return {
        color: 'bg-rose-100 text-rose-700',
        icon: <div className="h-4 w-4" />,
        label: 'Cancelled',
      };
    case 'scheduled':
    default:
      return {
        color: 'bg-amber-100 text-amber-700',
        icon: <LuHourglass className="h-4 w-4" />,
        label: 'Scheduled',
      };
  }
}
