'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { ComponentType } from 'react';
import {
  LuActivity,
  LuArrowRight,
  LuCalendarClock,
  LuClipboardCheck,
  LuSparkles,
  LuStethoscope,
  LuUsers,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { getRelevantAppointments } from '@/lib/appointment-utils';
import { formatDateTime } from '@/lib/api-client';
import { useDoctorWorkspace } from '@/hooks/use-doctor-workspace';

export default function DoctorPortalPage() {
  const { session, appointments, doctorProfile, isLoading, error } = useDoctorWorkspace();

  const metrics = useMemo(() => {
    const now = new Date();
    const todayLabel = now.toDateString();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const appointmentsToday = appointments.filter(
      (appointment) => new Date(appointment.scheduledAt).toDateString() === todayLabel,
    ).length;
    const upcomingAppointments = appointments.filter((appointment) => {
      const date = new Date(appointment.scheduledAt);
      return date >= now && ['scheduled', 'confirmed'].includes(appointment.status);
    }).length;
    const completedThisWeek = appointments.filter((appointment) => {
      const date = new Date(appointment.scheduledAt);
      return appointment.status === 'completed' && date >= weekAgo;
    }).length;
    const uniquePatients = new Set(appointments.map((appointment) => appointment.patient._id)).size;

    return [
      {
        label: 'Appointments Today',
        value: String(appointmentsToday),
        note: "Today's doctor schedule",
        icon: LuCalendarClock,
      },
      {
        label: 'My Patients',
        value: String(uniquePatients),
        note: 'Patients connected to your queue',
        icon: LuUsers,
      },
      {
        label: 'Upcoming Visits',
        value: String(upcomingAppointments),
        note: 'Scheduled or confirmed ahead',
        icon: LuClipboardCheck,
      },
      {
        label: 'Completed This Week',
        value: String(completedThisWeek),
        note: 'Visits closed in the last seven days',
        icon: LuActivity,
      },
    ];
  }, [appointments]);

  const nextAppointment = useMemo(() => {
    return (
      getRelevantAppointments(appointments).find((appointment) => new Date(appointment.scheduledAt) >= new Date()) ??
      null
    );
  }, [appointments]);

  const schedule = useMemo(() => getRelevantAppointments(appointments).slice(0, 4), [appointments]);

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed doctor session required"
        description="Doctor dashboard now uses real backend data. Sign in with a doctor account created by admin to see your profile and schedule."
        actionHref="/login/doctorlogin"
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="hospi-panel overflow-hidden rounded-[2.2rem] px-6 py-8 text-white shadow-[0_28px_90px_rgba(5,12,24,0.42)] sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.14fr_0.86fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100">
              <LuStethoscope className="h-4 w-4" />
              Doctor command deck
            </div>

            <div>
              <h1 className="text-4xl font-semibold leading-[0.95] text-white sm:text-5xl">
                {doctorProfile ? doctorProfile.user.name : session.name}, your live care board is ready.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/66 sm:text-base">
                {doctorProfile
                  ? `${doctorProfile.specialization} - ${doctorProfile.department}`
                  : 'This workspace is dedicated to doctors only, with your profile, patient queue, and appointments front and center.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/doctor-portal/appointments"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Review appointments
                <LuArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/doctor-portal/patients"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.09]"
              >
                Open patient list
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.8rem] border border-white/10 bg-white/[0.05] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white/74">Doctor focus</p>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-100">
                <LuSparkles className="h-3.5 w-3.5" />
                Live
              </span>
            </div>

            <div className="rounded-[1.5rem] border border-emerald-300/12 bg-emerald-300/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-100/78">Next appointment</p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {nextAppointment ? nextAppointment.patient.user.name : 'No upcoming visits'}
              </p>
              <p className="mt-2 text-sm text-white/70">
                {nextAppointment
                  ? `${formatDateTime(nextAppointment.scheduledAt)} - ${nextAppointment.reason}`
                  : 'Your upcoming schedule is clear for now.'}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">Availability</p>
              <p className="mt-3 text-lg font-semibold text-white">
                {doctorProfile?.availability.length ? doctorProfile.availability[0] : 'No availability set yet'}
              </p>
              <p className="mt-2 text-sm text-white/64">
                Keep your consultation slots current so admin can schedule you accurately.
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
          <InfoMetric key={metric.label} accent="emerald" {...metric} isLoading={isLoading} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="hospi-light-panel rounded-[1.9rem] p-6 text-slate-950">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Today&apos;s schedule</h2>
              <p className="mt-1 text-sm text-slate-500">Only your own visits and follow-ups are shown here.</p>
            </div>
            <Link
              href="/doctor-portal/appointments"
              className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-600"
            >
              View full list
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {isLoading ? (
              <div className="rounded-[1.5rem] border border-slate-200 p-4 text-sm text-slate-500">
                Loading today&apos;s schedule...
              </div>
            ) : schedule.length > 0 ? (
              schedule.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="rounded-[1.2rem] bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                      {formatDateTime(item.scheduledAt)}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-950">{item.patient.user.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.reason}</p>
                    </div>
                  </div>
                  <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                    {item.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-slate-200 p-4 text-sm text-slate-500">
                No appointments have been assigned to your doctor profile yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="hospi-light-panel rounded-[1.9rem] p-6 text-slate-950">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Doctor quick actions</h2>
            <div className="mt-5 grid gap-3">
              {[
                ['Review patient queue', '/doctor-portal/patients'],
                ['Open appointment board', '/doctor-portal/appointments'],
                ['Update profile and timing', '/doctor-portal/profile'],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hospi-light-panel rounded-[1.9rem] p-6 text-slate-950">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Care reminders</h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              <li className="rounded-[1.35rem] bg-slate-50 px-4 py-4">
                {nextAppointment
                  ? `Next visit: ${nextAppointment.patient.user.name} at ${formatDateTime(nextAppointment.scheduledAt)}.`
                  : 'Your next visit will appear here once it is scheduled.'}
              </li>
              <li className="rounded-[1.35rem] bg-slate-50 px-4 py-4">
                {doctorProfile?.availability.length
                  ? `${doctorProfile.availability.length} availability slot(s) saved on your profile.`
                  : 'Add availability slots to help admin schedule you accurately.'}
              </li>
              <li className="rounded-[1.35rem] bg-slate-50 px-4 py-4">
                {appointments.length
                  ? `${appointments.length} total appointments loaded for your doctor profile.`
                  : 'No appointments have been scheduled under your profile yet.'}
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoMetric({
  label,
  value,
  note,
  icon: Icon,
  accent,
  isLoading,
}: {
  label: string;
  value: string;
  note: string;
  icon: ComponentType<{ className?: string }>;
  accent: 'emerald' | 'cyan';
  isLoading: boolean;
}) {
  const accentClass =
    accent === 'emerald'
      ? 'from-emerald-400/16 to-emerald-400/5 text-emerald-700'
      : 'from-cyan-400/16 to-cyan-400/5 text-cyan-700';

  return (
    <div className="hospi-light-panel rounded-[1.75rem] p-5 text-slate-950">
      <div className="flex items-center justify-between gap-3">
        <div className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${accentClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Live</span>
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-slate-950">{isLoading ? '...' : value}</p>
      <p className="mt-2 text-sm font-medium text-slate-700">{label}</p>
      <p className="mt-1 text-sm text-slate-500">{note}</p>
    </div>
  );
}
