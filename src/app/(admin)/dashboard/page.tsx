import Link from 'next/link';
import type { ElementType } from 'react';
import {
  LuActivity,
  LuArrowRight,
  LuBadgeIndianRupee,
  LuBedDouble,
  LuCalendarCheck2,
  LuCommand,
  LuPlus,
  LuShieldCheck,
  LuStethoscope,
  LuUsers,
} from 'react-icons/lu';

const metrics = [
  {
    label: 'Patients registered',
    value: '1,204',
    change: '+8.2%',
    icon: LuUsers,
    tone: 'from-cyan-400/16 to-cyan-400/5 text-cyan-700',
  },
  {
    label: 'Doctors on duty',
    value: '78',
    change: '+3 today',
    icon: LuStethoscope,
    tone: 'from-emerald-400/16 to-emerald-400/5 text-emerald-700',
  },
  {
    label: 'Appointments today',
    value: '32',
    change: '5 pending',
    icon: LuCalendarCheck2,
    tone: 'from-amber-300/20 to-amber-300/6 text-amber-700',
  },
  {
    label: 'Revenue this week',
    value: '$64.8k',
    change: '+12.4%',
    icon: LuBadgeIndianRupee,
    tone: 'from-violet-400/16 to-violet-400/5 text-violet-700',
  },
];

const quickActions = [
  { label: 'Add patient', href: '/patient/add' },
  { label: 'Add doctor', href: '/doctor/add' },
  { label: 'Create appointment', href: '/appointment/add' },
  { label: 'Create invoice', href: '/billing/create' },
];

const systemCards = [
  {
    title: 'Ward occupancy',
    value: '85%',
    description: "General and ICU beds are nearing today's target threshold.",
    icon: LuBedDouble,
  },
  {
    title: 'Operations pulse',
    value: 'Stable',
    description: 'Morning queues are moving smoothly across OPD desks.',
    icon: LuActivity,
  },
];

const recentAppointments = [
  {
    patient: 'Aarav Sharma',
    doctor: 'Dr. Priya Gupta',
    time: '10:30 AM',
    status: 'Completed',
  },
  {
    patient: 'Riya Singh',
    doctor: 'Dr. Rohan Joshi',
    time: '11:00 AM',
    status: 'Pending',
  },
  {
    patient: 'Vikram Mehra',
    doctor: 'Dr. Anjali Rao',
    time: '11:30 AM',
    status: 'Cancelled',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="hospi-panel overflow-hidden rounded-[2.2rem] px-6 py-8 text-white shadow-[0_28px_90px_rgba(5,12,24,0.42)] sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">
              <LuShieldCheck className="h-4 w-4" />
              Admin control room
            </div>

            <div>
              <h1 className="text-4xl font-semibold leading-[0.95] text-white sm:text-5xl">
                Hospital operations, elevated into one futuristic command deck.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/66 sm:text-base">
                The workspace now feels more intentional, with stronger visual hierarchy for quick actions,
                metrics, and the operational pulse your team checks all day.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/appointment/add"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Create appointment
                <LuArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/billing/create"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.09]"
              >
                Create invoice
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.8rem] border border-white/10 bg-white/[0.05] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white/74">Today&apos;s focus</p>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
                Live
              </span>
            </div>
            <div className="space-y-4">
              {systemCards.map((card) => (
                <div key={card.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-100">
                      <card.icon className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-semibold tracking-[-0.04em] text-white">{card.value}</span>
                  </div>
                  <p className="mt-4 text-base font-semibold text-white">{card.title}</p>
                  <p className="mt-1 text-sm text-white/62">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="hospi-light-panel rounded-[1.9rem] p-6 text-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Quick actions</h2>
              <p className="mt-1 text-sm text-slate-500">The highest-frequency admin tasks are surfaced first.</p>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-cyan-100">
              <LuCommand className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
              >
                {action.label}
              </Link>
            ))}
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-950/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              <LuPlus className="h-4 w-4 text-cyan-600" />
              Operator note
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Use this area as your launch rail for urgent admin work instead of bouncing through multiple menus.
            </p>
          </div>
        </div>

        <div className="hospi-light-panel rounded-[1.9rem] p-6 text-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Recent appointments</h2>
              <p className="mt-1 text-sm text-slate-500">Live-feel snapshot of the latest patient bookings.</p>
            </div>
            <Link
              href="/appointment"
              className="text-sm font-semibold text-cyan-700 transition hover:text-cyan-600"
            >
              Open list
            </Link>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Patient</th>
                  <th className="px-4 py-3 font-semibold">Doctor</th>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((appointment) => (
                  <tr key={`${appointment.patient}-${appointment.time}`} className="border-t border-slate-100">
                    <td className="px-4 py-4 font-medium text-slate-950">{appointment.patient}</td>
                    <td className="px-4 py-4 text-slate-600">{appointment.doctor}</td>
                    <td className="px-4 py-4 text-slate-600">{appointment.time}</td>
                    <td className="px-4 py-4">
                      <span className={statusClassName(appointment.status)}>{appointment.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  change,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  change: string;
  icon: ElementType;
  tone: string;
}) {
  return (
    <div className="hospi-light-panel rounded-[1.75rem] p-5 text-slate-950">
      <div className="flex items-center justify-between gap-3">
        <div className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{change}</span>
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-slate-950">{value}</p>
      <p className="mt-2 text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}

function statusClassName(status: string) {
  if (status === 'Completed') {
    return 'inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700';
  }

  if (status === 'Pending') {
    return 'inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700';
  }

  return 'inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700';
}
