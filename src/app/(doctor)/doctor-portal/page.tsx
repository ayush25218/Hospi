import Link from 'next/link';
import {
  LuActivity,
  LuArrowRight,
  LuCalendarClock,
  LuClipboardCheck,
  LuStethoscope,
  LuUsers,
} from 'react-icons/lu';

const metrics = [
  { label: 'Appointments Today', value: '18', note: '+4 from yesterday', icon: LuCalendarClock },
  { label: 'Patients in Review', value: '26', note: '6 urgent follow ups', icon: LuUsers },
  { label: 'Reports Pending', value: '7', note: '2 lab reports ready', icon: LuClipboardCheck },
  { label: 'Care Score', value: '96%', note: 'Patient satisfaction this week', icon: LuActivity },
];

const todaySchedule = [
  { time: '09:00 AM', patient: 'Aarav Sharma', reason: 'Routine cardiac review', status: 'Checked in' },
  { time: '10:30 AM', patient: 'Riya Singh', reason: 'Neurology consult', status: 'Preparing' },
  { time: '12:15 PM', patient: 'Vikram Mehra', reason: 'Post-op follow up', status: 'Upcoming' },
  { time: '03:30 PM', patient: 'Anjali Rao', reason: 'Pediatric review', status: 'Upcoming' },
];

export default function DoctorPortalPage() {
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
              <h1 className="text-3xl font-semibold sm:text-4xl">Your practice at a glance.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                This workspace is dedicated to doctors only, with your schedule, patient priorities,
                and daily action items front and center.
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
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-200">Priority window</p>
              <p className="mt-3 text-2xl font-semibold">3 urgent consultations</p>
              <p className="mt-2 text-sm text-white/70">Cardiology ward rounds start at 11:00 AM.</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/50">Next action</p>
              <p className="mt-3 text-lg font-semibold">Approve lab summary for Riya Singh</p>
              <p className="mt-2 text-sm text-white/65">Shared by pathology 18 minutes ago.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                <metric.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Live</span>
            </div>
            <p className="mt-5 text-3xl font-semibold text-slate-950">{metric.value}</p>
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
              <p className="mt-1 text-sm text-slate-500">Doctor-facing schedule only, without admin controls.</p>
            </div>
            <Link
              href="/doctor-portal/appointments"
              className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-600"
            >
              View full list
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {todaySchedule.map((item) => (
              <div
                key={`${item.time}-${item.patient}`}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="min-w-24 rounded-2xl bg-slate-950 px-3 py-2 text-center text-sm font-semibold text-white">
                    {item.time}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-950">{item.patient}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.reason}</p>
                  </div>
                </div>
                <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                  {item.status}
                </span>
              </div>
            ))}
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
              <li className="rounded-2xl bg-slate-50 px-4 py-3">2 discharge summaries need your signature.</li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">4 patient reports were shared since morning round.</li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">Evening slot still has one open follow-up appointment.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
