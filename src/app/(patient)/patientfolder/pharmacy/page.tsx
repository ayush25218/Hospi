'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { ComponentType } from 'react';
import {
  LuBadgeInfo,
  LuCalendarClock,
  LuPill,
  LuShieldPlus,
  LuSyringe,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { getLatestAppointment } from '@/lib/appointment-utils';
import { formatDateTime } from '@/lib/api-client';
import { usePatientWorkspace } from '@/hooks/use-patient-workspace';

export default function PatientPharmacyPage() {
  const { session, appointments, patientProfile, isLoading, error } = usePatientWorkspace();

  const latestVisit = useMemo(() => getLatestAppointment(appointments), [appointments]);

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed patient session required"
        description="The pharmacy hub now uses your real patient profile instead of static demo bills. Sign in with a patient account created by admin to access it."
        actionHref="/login/patientlogin"
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
              <LuPill className="h-4 w-4" />
              Pharmacy hub
            </span>
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">Medication and pharmacy desk</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                This page now uses your live patient profile. Prescription and pharmacy billing modules are not linked
                yet, so we show the details the pharmacy desk typically needs from you.
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-slate-950 px-5 py-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">Last visit</p>
            <p className="mt-3 text-lg font-semibold">
              {latestVisit ? latestVisit.doctor.user.name : 'No visits yet'}
            </p>
            <p className="mt-1 text-sm text-white/70">
              {latestVisit ? formatDateTime(latestVisit.scheduledAt) : 'No appointment history found'}
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Patient handoff details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <InfoCard icon={LuShieldPlus} label="Blood Group" value={patientProfile?.bloodGroup || 'Not provided'} />
              <InfoCard
                icon={LuCalendarClock}
                label="Upcoming Visit"
                value={
                  appointments.find((appointment) => ['scheduled', 'confirmed'].includes(appointment.status))
                    ? 'Scheduled'
                    : 'No upcoming appointment'
                }
              />
              <InfoCard
                icon={LuBadgeInfo}
                label="Emergency Contact"
                value={patientProfile?.emergencyContact || 'Missing'}
              />
              <InfoCard
                icon={LuSyringe}
                label="Medical History"
                value={
                  patientProfile?.medicalHistory.length
                    ? `${patientProfile.medicalHistory.length} tag(s) saved`
                    : 'No tags saved'
                }
              />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Care notes to share at the desk</h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              <li className="rounded-2xl bg-slate-50 px-4 py-3">
                Patient name: {patientProfile?.user.name ?? session.name}
              </li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">
                Medical history: {patientProfile?.medicalHistory.join(', ') || 'No history notes shared yet'}
              </li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">
                Emergency contact: {patientProfile?.emergencyContact || 'Please add this at reception'}
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Prescription status</h2>
            <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-700">
                {isLoading ? 'Loading pharmacy context...' : 'No prescription records linked yet'}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Once the hospital uploads prescriptions or pharmacy bills to the backend, they will show here automatically.
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Helpful next steps</h2>
            <div className="mt-5 grid gap-3">
              <Link
                href="/patientfolder/appointments"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
              >
                Review appointment history
              </Link>
              <div className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600">
                Keep your emergency contact and blood group updated for faster pharmacy desk verification.
              </div>
              <div className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600">
                Mention your last consultation time: {latestVisit ? formatDateTime(latestVisit.scheduledAt) : 'Not available yet'}.
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Latest doctor note</h2>
            <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
              {latestVisit?.notes || latestVisit?.reason || 'No appointment notes are available yet.'}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-slate-700 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}
