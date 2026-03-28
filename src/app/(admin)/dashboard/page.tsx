import Link from 'next/link';
import type { ElementType } from 'react';
import {
  LuActivity,
  LuArrowRight,
  LuBedDouble,
  LuCalendarCheck2,
  LuPlus,
  LuStethoscope,
  LuUsers,
  LuWallet,
} from 'react-icons/lu';

const metrics = [
  {
    label: 'Patients registered',
    value: '1,204',
    change: '+8.2%',
    icon: LuUsers,
    tone: 'bg-sky-50 text-sky-600',
  },
  {
    label: 'Doctors on duty',
    value: '78',
    change: '+3 today',
    icon: LuStethoscope,
    tone: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: 'Appointments today',
    value: '32',
    change: '5 pending',
    icon: LuCalendarCheck2,
    tone: 'bg-amber-50 text-amber-600',
  },
  {
    label: 'Revenue this week',
    value: '$64.8k',
    change: '+12.4%',
    icon: LuWallet,
    tone: 'bg-violet-50 text-violet-600',
  },
];

const quickActions = [
  { label: 'Add patient', href: '/patient/add' },
  { label: 'Add doctor', href: '/doctor/add' },
  { label: 'Create appointment', href: '/appointment/add' },
  { label: 'Create invoice', href: '/billing/create' },
];

const recentUpdates = [
  {
    title: 'Ward occupancy',
    value: '85%',
    description: 'General and ICU beds are nearing today’s target threshold.',
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
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-8 text-white shadow-[0_24px_70px_rgba(15,23,42,0.14)] sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">Admin control room</p>
            <div>
              <h1 className="text-3xl font-semibold sm:text-4xl">Hospital operations, streamlined.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                A cleaner admin dashboard with faster actions, clearer metrics, and better separation
                from the doctor and patient experiences.
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
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Create invoice
              </Link>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-semibold text-white/75">Today’s focus</p>
            <div className="mt-4 space-y-4">
              {recentUpdates.map((update) => (
                <div key={update.title} className="rounded-2xl bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-200">
                      <update.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-semibold">{update.value}</span>
                  </div>
                  <p className="mt-4 text-base font-semibold">{update.title}</p>
                  <p className="mt-1 text-sm text-white/65">{update.description}</p>
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

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Quick actions</h2>
              <p className="mt-1 text-sm text-slate-500">The most common admin tasks, one click away.</p>
            </div>
            <LuPlus className="h-5 w-5 text-slate-300" />
          </div>

          <div className="mt-6 grid gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="rounded-2xl border border-slate-200 px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Recent appointments</h2>
              <p className="mt-1 text-sm text-slate-500">Live view of the latest patient bookings.</p>
            </div>
            <Link
              href="/appointment"
              className="text-sm font-semibold text-cyan-700 transition hover:text-cyan-600"
            >
              Open list
            </Link>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
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
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{change}</span>
      </div>
      <p className="mt-5 text-3xl font-semibold text-slate-950">{value}</p>
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
