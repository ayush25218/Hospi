'use client';

import type { ElementType } from 'react';
import { LuBadgeCheck, LuClock3, LuHospital, LuIndianRupee, LuMail, LuPhone } from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { useDoctorWorkspace } from '@/hooks/use-doctor-workspace';

export default function DoctorProfilePage() {
  const { session, doctorProfile, isLoading, error } = useDoctorWorkspace();

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed doctor session required"
        description="Doctor profile now loads from the backend. Sign in with a doctor account created by admin to view it."
        actionHref="/login/doctorlogin"
      />
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
            <div className="grid h-20 w-20 place-items-center rounded-3xl bg-white/10 text-2xl font-semibold">
              {getInitials(doctorProfile?.user.name ?? session.name)}
            </div>
            <h1 className="mt-5 text-3xl font-semibold">
              {doctorProfile?.user.name ?? session.name}
            </h1>
            <p className="mt-2 text-sm text-white/70">
              {doctorProfile?.specialization ?? 'Doctor profile is loading...'}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1.5 text-sm font-semibold text-emerald-200">
              <LuBadgeCheck className="h-4 w-4" />
              Verified doctor profile
            </div>
            {doctorProfile?.bio ? (
              <p className="mt-5 text-sm leading-6 text-white/75">{doctorProfile.bio}</p>
            ) : null}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Professional details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <InfoItem icon={LuHospital} label="Department" value={doctorProfile?.department ?? 'Loading...'} />
              <InfoItem
                icon={LuClock3}
                label="Experience"
                value={doctorProfile ? `${doctorProfile.yearsOfExperience} years` : 'Loading...'}
              />
              <InfoItem icon={LuMail} label="Email" value={doctorProfile?.user.email ?? session.email} />
              <InfoItem icon={LuPhone} label="Phone" value={doctorProfile?.user.phone || 'Not added yet'} />
              <InfoItem
                icon={LuIndianRupee}
                label="Consultation Fee"
                value={doctorProfile ? `Rs ${doctorProfile.consultationFee}` : 'Loading...'}
              />
              <InfoItem
                icon={LuBadgeCheck}
                label="Status"
                value={doctorProfile?.user.isActive ? 'Active' : 'Inactive'}
              />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Availability</h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              {isLoading ? (
                <li className="rounded-2xl bg-slate-50 px-4 py-3">Loading availability...</li>
              ) : doctorProfile?.availability.length ? (
                doctorProfile.availability.map((slot) => (
                  <li key={slot} className="rounded-2xl bg-slate-50 px-4 py-3">
                    {slot}
                  </li>
                ))
              ) : (
                <li className="rounded-2xl bg-slate-50 px-4 py-3">
                  No availability has been added to your profile yet.
                </li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-slate-700 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}
