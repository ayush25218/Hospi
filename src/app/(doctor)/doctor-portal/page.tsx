'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  LuActivity,
  LuArrowRight,
  LuCalendarClock,
  LuClipboardCheck,
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
      (appointment) => new Date(appointment.scheduledAt).toDateString() === todayLabel
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
        note: 'Patients assigned to your queue',
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
        note: 'Visits closed in last 7 days',
        icon: LuActivity,
      },
    ];
  }, [appointments]);

  const nextAppointment = useMemo(() => {
    return (
      getRelevantAppointments(appointments).find(
        (appointment) => new Date(appointment.scheduledAt) >= new Date()
      ) ?? null
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
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-8 text-white shadow-[0_24px_70px_rgba(15,23,42,0.14)] sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-200">
              <LuStethoscope className="h-4 w-4" />
              Doctor dashboard
            </span>
            <div>
              <h1 className="text-3xl font-semibold sm:text-4xl">
                {doctorProfile ? doctorProfile.user.name : session.name}, here&apos;s your live schedule.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                {doctorProfile
                  ? `${doctorProfile.specialization} · ${doctorProfile.department}`
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
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/6"
              >
                Open patient list
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-semibold text-white/75">Focus for today</p>
            <div className="rounded-2xl bg-emerald-400/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-200">Next appointment</p>
              <p className="mt-3 text-2xl font-semibold">
                {nextAppointment ? nextAppointment.patient.user.name : 'No upcoming visits'}
              </p>
              <p className="mt-2 text-sm text-white/70">
                {nextAppointment
                  ? `${formatDateTime(nextAppointment.scheduledAt)} · ${nextAppointment.reason}`
                  : 'Your upcoming schedule is clear for now.'}
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/50">Availability</p>
              <p className="mt-3 text-lg font-semibold">
                {doctorProfile?.availability.length ? doctorProfile.availability[0] : 'No availability set yet'}
              </p>
              <p className="mt-2 text-sm text-white/65">
                Update your profile to keep your consultation slots current.
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
          <div key={metric.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                <metric.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Live</span>
            </div>
            <p className="mt-5 text-3xl font-semibold text-slate-950">{isLoading ? '...' : metric.value}</p>
            <p className="mt-2 text-sm font-medium text-slate-700">{metric.label}</p>
            <p className="mt-1 text-sm text-slate-500">{metric.note}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Today&apos;s schedule</h2>
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
              <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
                Loading today&apos;s schedule...
              </div>
            ) : schedule.length > 0 ? (
              schedule.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="min-w-24 rounded-2xl bg-slate-950 px-3 py-2 text-center text-sm font-semibold text-white">
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
              <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
                No appointments have been assigned to your doctor profile yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Doctor quick actions</h2>
            <div className="mt-5 grid gap-3">
              {[
                ['Review patient queue', '/doctor-portal/patients'],
                ['Open appointment board', '/doctor-portal/appointments'],
                ['Update profile and timing', '/doctor-portal/profile'],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Care reminders</h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              <li className="rounded-2xl bg-slate-50 px-4 py-3">
                {nextAppointment
                  ? `Next visit: ${nextAppointment.patient.user.name} at ${formatDateTime(nextAppointment.scheduledAt)}.`
                  : 'Your next visit will appear here once it is scheduled.'}
              </li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">
                {doctorProfile?.availability.length
                  ? `${doctorProfile.availability.length} availability slot(s) saved on your profile.`
                  : 'Add availability slots to help admin schedule you accurately.'}
              </li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">
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
