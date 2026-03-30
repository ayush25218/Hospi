import Link from 'next/link';
import type { ElementType } from 'react';
import {
  LuActivity,
  LuArrowRight,
  LuCalendarCheck2,
  LuShieldCheck,
  LuSparkles,
  LuStethoscope,
  LuUserRound,
} from 'react-icons/lu';

const portals = [
  {
    title: 'Admin Portal',
    description: 'Finance, staffing, rooms, and oversight tools arranged inside one sharp control surface.',
    href: '/login/adminlogin',
    icon: LuShieldCheck,
    tone: 'from-cyan-400/30 via-sky-400/12 to-transparent',
    accent: 'text-cyan-100',
    label: 'Control room',
  },
  {
    title: 'Doctor Portal',
    description: 'A calmer, doctor-only workspace for appointments, patient visibility, and focused care delivery.',
    href: '/login/doctorlogin',
    icon: LuStethoscope,
    tone: 'from-emerald-400/28 via-teal-400/12 to-transparent',
    accent: 'text-emerald-100',
    label: 'Care desk',
  },
  {
    title: 'Patient Portal',
    description: 'Appointments, pharmacy context, and health touchpoints presented in a cleaner personal flow.',
    href: '/login/patientlogin',
    icon: LuUserRound,
    tone: 'from-violet-400/24 via-fuchsia-400/12 to-transparent',
    accent: 'text-violet-100',
    label: 'Care companion',
  },
];

const systemSignals = [
  { label: 'Role-aware portals', value: '03', icon: LuShieldCheck },
  { label: 'Live operations flow', value: '24/7', icon: LuActivity },
  { label: 'Patient movement', value: 'Tracked', icon: LuCalendarCheck2 },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10rem] top-[-8rem] h-[28rem] w-[28rem] rounded-full bg-cyan-400/18 blur-[130px]" />
        <div className="absolute right-[-8rem] top-24 h-[24rem] w-[24rem] rounded-full bg-emerald-400/12 blur-[130px]" />
        <div className="absolute bottom-[-9rem] left-1/2 h-[22rem] w-[22rem] -translate-x-1/2 rounded-full bg-sky-500/12 blur-[150px]" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
        <section className="hospi-panel overflow-hidden rounded-[2.4rem] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100">
                <LuSparkles className="h-4 w-4" />
                Future-ready hospital UX
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl text-4xl font-semibold leading-[0.95] text-white sm:text-5xl lg:text-7xl">
                  A sharper hospital command experience for admins, doctors, and patients.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
                  Hospi now opens with a more cinematic, role-aware flow so every user lands in a cleaner
                  workspace with less confusion and stronger visual focus.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/login/adminlogin"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Enter Admin Portal
                  <LuArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login/doctorlogin"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.09]"
                >
                  Open Doctor Portal
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/40">System pulse</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                  {systemSignals.map((signal) => (
                    <SignalCard key={signal.label} {...signal} />
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-cyan-300/14 bg-gradient-to-br from-cyan-300/10 via-white/[0.03] to-transparent p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/40">What changed</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Role-specific login', 'Glass shell', 'Cleaner navigation', 'Backend-first access'].map(
                    (item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-medium text-white/78"
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {portals.map((portal) => (
            <Link
              key={portal.title}
              href={portal.href}
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,22,39,0.92),rgba(6,14,26,0.96))] p-6 text-white shadow-[0_22px_70px_rgba(4,10,20,0.42)] transition duration-300 hover:-translate-y-1.5 hover:border-cyan-300/22"
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${portal.tone} opacity-90`} />
              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-[1.4rem] border border-white/12 bg-white/[0.08] shadow-[0_0_30px_rgba(98,232,255,0.08)]">
                    <portal.icon className={`h-6 w-6 ${portal.accent}`} />
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
                    {portal.label}
                  </span>
                </div>

                <div className="mt-10 space-y-4">
                  <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white">{portal.title}</h2>
                  <p className="text-sm leading-7 text-white/66">{portal.description}</p>
                </div>

                <div className="mt-8 flex items-center justify-between text-sm font-semibold text-white">
                  <span>Launch workspace</span>
                  <LuArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}

function SignalCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ElementType;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.08] text-cyan-100">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-2xl font-semibold tracking-[-0.04em] text-white">{value}</span>
      </div>
      <p className="mt-4 text-sm text-white/62">{label}</p>
    </div>
  );
}
