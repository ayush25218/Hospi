'use client';

import { useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import {
  LuCalendarClock,
  LuClock3,
  LuMail,
  LuMapPin,
  LuPhone,
  LuSearch,
  LuShieldAlert,
  LuUser,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import {
  calculateAge,
  formatDateTime,
  formatRecordId,
  type AppointmentStatus,
} from '@/lib/api-client';
import { usePatientWorkspace } from '@/hooks/use-patient-workspace';

export default function PatientAppointmentsPage() {
  const { session, appointments, patientProfile, isLoading, error } = usePatientWorkspace();
  const [search, setSearch] = useState('');

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = search.toLowerCase();

    return appointments.filter((appointment) => {
      return (
        appointment.doctor.user.name.toLowerCase().includes(normalizedSearch) ||
        appointment.reason.toLowerCase().includes(normalizedSearch) ||
        formatRecordId('APT', appointment._id).toLowerCase().includes(normalizedSearch)
      );
    });
  }, [appointments, search]);

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed patient session required"
        description="Patient appointments now come from the backend. Sign in with a real patient account created by admin to see your history."
        actionHref="/login/patientlogin"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-start">
          <div className="grid h-28 w-28 place-items-center rounded-full border-4 border-indigo-100 bg-indigo-50 text-2xl font-semibold text-indigo-700">
            {getAvatarText(patientProfile?.user.name ?? session.name)}
          </div>

          <div className="flex-1 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">{patientProfile?.user.name ?? session.name}</h2>
              <p className="mt-1 text-gray-600">
                <strong>Patient Id:</strong>{' '}
                {patientProfile ? formatRecordId('PAT', patientProfile._id) : 'Loading...'}
              </p>
            </div>

            <Info label="Email" value={patientProfile?.user.email ?? session.email} icon={LuMail} />
            <Info label="Phone" value={patientProfile?.user.phone || 'Not added yet'} icon={LuPhone} />
            <Info
              label="Age"
              value={patientProfile ? `${calculateAge(patientProfile.dateOfBirth)} years` : 'Loading...'}
              icon={LuUser}
            />
            <Info
              label="Gender"
              value={patientProfile ? capitalize(patientProfile.gender) : 'Loading...'}
              icon={LuUser}
            />
            <Info
              label="Address"
              value={patientProfile?.address || 'Address not added yet'}
              icon={LuMapPin}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">My Appointments</h3>
            <p className="mt-1 text-sm text-gray-500">
              Hospital staff schedules appointments for you. Contact the admin desk if you need a new booking.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
            <LuCalendarClock className="h-4 w-4" />
            {isLoading ? 'Loading history...' : `${appointments.length} appointment(s) found`}
          </div>
        </div>

        <div className="border-b border-gray-100 p-4">
          <div className="relative w-full md:w-1/3">
            <span className="absolute left-3 top-3 text-gray-400">
              <LuSearch className="h-5 w-5" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by doctor, reason, or appointment ID..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 pl-10 text-sm outline-none focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        {error ? (
          <div className="border-b border-gray-100 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">Appointment No</th>
                <th className="px-4 py-3">Appointment Date</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Loading appointments...
                  </td>
                </tr>
              ) : filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{formatRecordId('APT', appointment._id)}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="inline-flex items-center gap-2">
                        <LuClock3 className="h-4 w-4 text-gray-400" />
                        {formatDateTime(appointment.scheduledAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{appointment.doctor.user.name}</td>
                    <td className="px-4 py-3 text-gray-700">{appointment.doctor.department}</td>
                    <td className="px-4 py-3 text-gray-700">{appointment.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-1 text-xs font-medium ${getStatusClasses(appointment.status)}`}>
                        {formatStatus(appointment.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <div className="mx-auto flex max-w-md items-start gap-3 text-left">
                      <LuShieldAlert className="mt-0.5 h-5 w-5 text-indigo-500" />
                      <div>
                        <p className="font-medium text-gray-800">No appointments found</p>
                        <p className="mt-1 text-sm text-gray-500">
                          Once the hospital schedules appointments for your patient profile, they will show here automatically.
                        </p>
                      </div>
                    </div>
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

function Info({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <p className="flex items-center gap-2 text-gray-500">
        <Icon className="h-4 w-4" />
        <strong>{label}:</strong>
      </p>
      <p className="mt-1 text-gray-700">{value}</p>
    </div>
  );
}

function getAvatarText(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatStatus(status: AppointmentStatus) {
  switch (status) {
    case 'confirmed':
      return 'Confirmed';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'scheduled':
    default:
      return 'Scheduled';
  }
}

function getStatusClasses(status: AppointmentStatus) {
  switch (status) {
    case 'confirmed':
      return 'bg-cyan-100 text-cyan-700';
    case 'completed':
      return 'bg-green-100 text-green-700';
    case 'cancelled':
      return 'bg-rose-100 text-rose-700';
    case 'scheduled':
    default:
      return 'bg-amber-100 text-amber-700';
  }
}
