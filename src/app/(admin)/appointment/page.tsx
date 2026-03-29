'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  LuCalendarCheck,
  LuCalendarDays,
  LuCalendarPlus,
  LuFilter,
  LuHourglass,
  LuPrinter,
  LuSearch,
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
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row non-printable">
        <div className="flex items-center gap-3">
          <LuCalendarCheck className="h-8 w-8 text-indigo-700" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Appointments</h1>
            <p className="mt-1 text-sm text-gray-500">Live appointments synced from the backend.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
          >
            <LuPrinter className="h-5 w-5" />
            Print List
          </button>
          <Link
            href="/appointment/add"
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
          >
            <LuCalendarPlus className="h-5 w-5" />
            New Appointment
          </Link>
        </div>
      </div>

      <div className="space-y-4 rounded-xl bg-white p-4 shadow-md non-printable">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="relative">
            <span className="absolute left-3 top-3.5 text-gray-400">
              <LuSearch className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="Search patient, doctor, or appointment ID..."
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-3.5 text-gray-400">
              <LuFilter className="h-5 w-5" />
            </span>
            <select
              className="w-full appearance-none rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center text-sm font-medium text-gray-600">
            <LuCalendarDays className="mr-2 h-4 w-4" />
            Filter by Date:
          </span>
          {filterButtons.map((button) => (
            <button
              key={button.range}
              onClick={() => setTimeRange(button.range)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                timeRange === button.range
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div id="printable-appointment-list" className="overflow-hidden rounded-xl bg-white shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Appointment</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Patient</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Doctor</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Date & Time</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                    Loading appointments...
                  </td>
                </tr>
              ) : filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => {
                  const statusProps = getStatusProps(appointment.status);

                  return (
                    <tr key={appointment._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{formatRecordId('APT', appointment._id)}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{appointment.patient.user.name}</p>
                        <p className="text-xs text-gray-500">{formatRecordId('PAT', appointment.patient._id)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{appointment.doctor.user.name}</p>
                        <p className="text-xs text-gray-500">{appointment.doctor.specialization}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(appointment.scheduledAt)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusProps.color}`}
                        >
                          {statusProps.icon}
                          {statusProps.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                    No appointments found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
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
