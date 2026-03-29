'use client';

import { useMemo } from 'react';
import {
  LuCalendarClock,
  LuHeartPulse,
  LuNotebookPen,
  LuPhoneCall,
  LuTriangleAlert,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { compareAppointmentsByRelevance } from '@/lib/appointment-utils';
import { formatDateTime, formatRecordId } from '@/lib/api-client';
import { useDoctorWorkspace } from '@/hooks/use-doctor-workspace';

export default function DoctorPatientsPage() {
  const { session, appointments, isLoading, error } = useDoctorWorkspace();

  const patientCards = useMemo(() => {
    const patientMap = new Map<string, typeof appointments>();

    for (const appointment of appointments) {
      const current = patientMap.get(appointment.patient._id) ?? [];
      patientMap.set(appointment.patient._id, [...current, appointment]);
    }

    return Array.from(patientMap.values()).map((records) => {
      return [...records].sort(compareAppointmentsByRelevance)[0];
    });
  }, [appointments]);

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed doctor session required"
        description="Patient queue now comes from your real appointment data. Sign in with a doctor account created by admin to open it."
        actionHref="/login/doctorlogin"
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">My patients</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Patient queue</h1>
        <p className="mt-2 text-sm text-slate-500">
          Patients are grouped from your actual appointments, so you only see the queue linked to your doctor profile.
        </p>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-3">
        {isLoading ? (
          <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
            Loading patient queue...
          </article>
        ) : patientCards.length > 0 ? (
          patientCards.map((appointment) => (
            <article
              key={appointment.patient._id}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <LuHeartPulse className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {formatRecordId('PAT', appointment.patient._id)}
                </span>
              </div>
              <h2 className="mt-5 text-xl font-semibold text-slate-950">{appointment.patient.user.name}</h2>
              <p className="mt-2 text-sm text-slate-500">
                {appointment.reason} · {formatDateTime(appointment.scheduledAt)}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                  <LuTriangleAlert className="h-4 w-4" />
                  {formatStatus(appointment.status)}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                  <LuNotebookPen className="h-4 w-4" />
                  {appointment.notes ? 'Has notes' : 'Clinical note pending'}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                  <LuPhoneCall className="h-4 w-4" />
                  {appointment.patient.user.phone || 'No contact saved'}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                  <LuCalendarClock className="h-4 w-4" />
                  {appointment.doctor.department}
                </span>
              </div>
            </article>
          ))
        ) : (
          <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">No patient queue yet</h2>
            <p className="mt-2 text-sm text-slate-500">
              Once appointments are booked under your doctor profile, patients will appear here automatically.
            </p>
          </article>
        )}
      </div>
    </div>
  );
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
