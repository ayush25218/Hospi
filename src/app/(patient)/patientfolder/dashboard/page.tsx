'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { ComponentType } from 'react';
import {
  LuCalendarClock,
  LuHeartPulse,
  LuPill,
  LuShieldPlus,
  LuSparkles,
  LuUserRound,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { getRelevantAppointments } from '@/lib/appointment-utils';
import { calculateAge, formatDateTime, formatRecordId } from '@/lib/api-client';
import { usePatientWorkspace } from '@/hooks/use-patient-workspace';

export default function PatientDashboardPage() {
  const { session, appointments, patientProfile, isLoading, error } = usePatientWorkspace();

  const nextAppointment = useMemo(() => {
    return (
      getRelevantAppointments(appointments).find((appointment) => new Date(appointment.scheduledAt) >= new Date()) ??
      null
    );
  }, [appointments]);

  const completedCount = useMemo(
    () => appointments.filter((appointment) => appointment.status === 'completed').length,
    [appointments],
  );

  const metrics = useMemo(
    () => [
      {
        label: 'Upcoming Appointments',
        value: String(
          appointments.filter((appointment) => ['scheduled', 'confirmed'].includes(appointment.status)).length,
        ),
        icon: LuCalendarClock,
      },
      {
        label: 'Completed Visits',
        value: String(completedCount),
        icon: LuHeartPulse,
      },
      {
        label: 'Medical History Tags',
        value: String(patientProfile?.medicalHistory.length ?? 0),
        icon: LuPill,
      },
      {
        label: 'Emergency Contact',
        value: patientProfile?.emergencyContact ? 'Saved' : 'Missing',
        icon: LuShieldPlus,
      },
    ],
    [appointments, completedCount, patientProfile],
  );

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed patient session required"
        description="Patient dashboard now uses your real backend profile and appointments. Sign in with a patient account created by admin to access it."
        actionHref="/login/patientlogin"
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="hospi-panel overflow-hidden rounded-[2.2rem] px-6 py-8 text-white shadow-[0_28px_90px_rgba(5,12,24,0.42)] sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.14fr_0.86fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">
              <LuUserRound className="h-4 w-4" />
              Patient care hub
            </div>

            <div>
              <h1 className="text-4xl font-semibold leading-[0.95] text-white sm:text-5xl">
                {patientProfile?.user.name ?? session.name}, your care summary is ready.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/66 sm:text-base">
                {patientProfile
                  ? `${calculateAge(patientProfile.dateOfBirth)} years - ${patientProfile.gender}`
                  : 'This space keeps your appointments, care status, and pharmacy handoff in one place.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/patientfolder/appointments"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                View appointments
              </Link>
              <Link
                href="/patientfolder/pharmacy"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.09]"
              >
                Open pharmacy hub
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.8rem] border border-white/10 bg-white/[0.05] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white/74">Next important update</p>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
                <LuSparkles className="h-3.5 w-3.5" />
                Synced
              </span>
            </div>

            <div className="rounded-[1.5rem] border border-cyan-300/12 bg-cyan-300/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/78">Next appointment</p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {nextAppointment ? nextAppointment.doctor.user.name : 'No upcoming appointment'}
              </p>
              <p className="mt-2 text-sm text-white/70">
                {nextAppointment
                  ? `${formatDateTime(nextAppointment.scheduledAt)} - ${nextAppointment.reason}`
                  : 'When the hospital books your next visit, it will appear here.'}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">Profile status</p>
              <p className="mt-3 text-lg font-semibold text-white">
                {patientProfile?.emergencyContact ? 'Emergency contact saved' : 'Emergency contact missing'}
              </p>
              <p className="mt-2 text-sm text-white/64">
                Share missing contact details with the hospital to keep your record complete.
              </p>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <PatientMetric key={metric.label} {...metric} isLoading={isLoading} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="hospi-light-panel rounded-[1.9rem] p-6 text-slate-950">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Recent appointment activity</h2>
              <p className="mt-1 text-sm text-slate-500">The latest visits tied to your patient account.</p>
            </div>
            <Link
              href="/patientfolder/appointments"
              className="text-sm font-semibold text-cyan-700 transition hover:text-cyan-600"
            >
              View full history
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {isLoading ? (
              <div className="rounded-[1.5rem] border border-slate-200 p-4 text-sm text-slate-500">
                Loading activity...
              </div>
            ) : appointments.length > 0 ? (
              getRelevantAppointments(appointments)
                .slice(0, 4)
                .map((appointment) => (
                  <div
                    key={appointment._id}
                    className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-base font-semibold text-slate-950">{appointment.doctor.user.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{appointment.reason}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {formatRecordId('APT', appointment._id)}
                      </p>
                    </div>
                    <div className="text-sm text-slate-500">{formatDateTime(appointment.scheduledAt)}</div>
                  </div>
                ))
            ) : (
              <div className="rounded-[1.5rem] border border-slate-200 p-4 text-sm text-slate-500">
                Your appointment history is empty right now.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="hospi-light-panel rounded-[1.9rem] p-6 text-slate-950">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Patient quick actions</h2>
            <div className="mt-5 grid gap-3">
              {[
                ['Open appointment history', '/patientfolder/appointments'],
                ['Visit pharmacy hub', '/patientfolder/pharmacy'],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hospi-light-panel rounded-[1.9rem] p-6 text-slate-950">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Profile checklist</h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              <li className="rounded-[1.35rem] bg-slate-50 px-4 py-4">
                Blood group: {patientProfile?.bloodGroup || 'Not shared yet'}
              </li>
              <li className="rounded-[1.35rem] bg-slate-50 px-4 py-4">
                Emergency contact: {patientProfile?.emergencyContact || 'Missing'}
              </li>
              <li className="rounded-[1.35rem] bg-slate-50 px-4 py-4">
                Medical history tags: {patientProfile?.medicalHistory.join(', ') || 'No history tags added'}
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function PatientMetric({
  label,
  value,
  icon: Icon,
  isLoading,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  isLoading: boolean;
}) {
  return (
    <div className="hospi-light-panel rounded-[1.75rem] p-5 text-slate-950">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400/16 to-cyan-400/5 text-cyan-700">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-slate-950">{isLoading ? '...' : value}</p>
      <p className="mt-2 text-sm font-medium text-slate-700">{label}</p>
    </div>
  );
}
