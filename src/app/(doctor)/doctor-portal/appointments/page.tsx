'use client';

import { useMemo } from 'react';
import {
  LuCalendarCheck2,
  LuClock3,
  LuFileText,
  LuMapPin,
  LuStethoscope,
  LuUserRound,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import {
  formatDateTime,
  formatRecordId,
  type AppointmentStatus,
} from '@/lib/api-client';
import { useDoctorWorkspace } from '@/hooks/use-doctor-workspace';

export default function DoctorAppointmentsPage() {
  const { session, appointments, doctorProfile, isLoading, error } = useDoctorWorkspace();

  const todayAppointments = useMemo(() => {
    const today = new Date().toDateString();
    return appointments.filter((appointment) => new Date(appointment.scheduledAt).toDateString() === today);
  }, [appointments]);

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed doctor session required"
        description="Doctor appointments now come from the backend. Sign in with a real doctor account created by admin to see your schedule."
        actionHref="/login/doctorlogin"
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">Doctor view</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Appointments</h1>
            <p className="mt-2 text-sm text-slate-500">
              {doctorProfile
                ? `${doctorProfile.user.name} · ${doctorProfile.specialization}`
                : 'Your schedule is now loaded from the backend, filtered to your doctor profile.'}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <LuCalendarCheck2 className="h-4 w-4" />
            {isLoading ? 'Loading schedule...' : `${todayAppointments.length} appointments scheduled today`}
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4">
        {isLoading ? (
          <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
            Loading doctor appointments...
          </article>
        ) : appointments.length > 0 ? (
          appointments.map((appointment) => (
            <article
              key={appointment._id}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <LuClock3 className="h-4 w-4" />
                    {formatDateTime(appointment.scheduledAt)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">{appointment.patient.user.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{formatRecordId('APT', appointment._id)}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                      <LuFileText className="h-4 w-4" />
                      {appointment.reason}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                      <LuMapPin className="h-4 w-4" />
                      {appointment.doctor.department}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                      <LuUserRound className="h-4 w-4" />
                      {appointment.patient.user.phone || 'No phone added'}
                    </span>
                  </div>
                  {appointment.notes ? (
                    <p className="text-sm text-slate-500">Notes: {appointment.notes}</p>
                  ) : null}
                </div>
                <span
                  className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusClasses(
                    appointment.status
                  )}`}
                >
                  {formatStatus(appointment.status)}
                </span>
              </div>
            </article>
          ))
        ) : (
          <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                <LuStethoscope className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">No appointments assigned yet</h2>
                <p className="mt-2 text-sm text-slate-500">
                  As soon as admin schedules appointments for your doctor profile, they will appear here automatically.
                </p>
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  );
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
      return 'bg-cyan-50 text-cyan-700';
    case 'completed':
      return 'bg-emerald-50 text-emerald-700';
    case 'cancelled':
      return 'bg-rose-50 text-rose-700';
    case 'scheduled':
    default:
      return 'bg-amber-50 text-amber-700';
  }
}
