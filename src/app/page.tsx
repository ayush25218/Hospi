import Link from 'next/link';
import {
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
    description: 'Run hospital operations, staff, finance, and dashboards from one clean control room.',
    href: '/login/adminlogin',
    icon: LuShieldCheck,
    tone: 'from-cyan-500/20 via-sky-400/10 to-white',
  },
  {
    title: 'Doctor Portal',
    description: 'Doctors now land in a doctor-only workspace with appointments, patient updates, and profile tools.',
    href: '/login/doctorlogin',
    icon: LuStethoscope,
    tone: 'from-emerald-500/20 via-teal-400/10 to-white',
  },
  {
    title: 'Patient Portal',
    description: 'Keep appointments, pharmacy details, and care history easy to understand and easy to reach.',
    href: '/login/patientlogin',
    icon: LuUserRound,
    tone: 'from-violet-500/20 via-fuchsia-400/10 to-white',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f7fbff_0%,_#eef4fb_55%,_#e7eef8_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-12">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                <LuSparkles className="h-4 w-4" />
                Better UI, better role flow
              </span>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  Hospi gives every user the right workspace from the first click.
                </h1>
                <p className="max-w-2xl text-base text-slate-600 sm:text-lg">
                  The landing, login, and dashboard shell have been refreshed so admins, doctors, and
                  patients each get a clearer path and a more focused experience.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/login/adminlogin"
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Enter Admin Portal
                  <LuArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login/doctorlogin"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Open Doctor Portal
                </Link>
              </div>
            </div>

            <div className="grid gap-4 rounded-[1.75rem] bg-slate-950 p-5 text-white sm:grid-cols-3 lg:grid-cols-1">
              {[
                { label: 'Role aware login', value: '3 portals' },
                { label: 'Focused navigation', value: 'Cleaner UX' },
                { label: 'Appointments tracked', value: '24/7 view' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <LuCalendarCheck2 className="mb-4 h-6 w-6 text-cyan-300" />
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="mt-1 text-sm text-white/65">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {portals.map((portal) => (
            <Link
              key={portal.title}
              href={portal.href}
              className="group rounded-[1.75rem] border border-slate-200/70 bg-gradient-to-br p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-slate-300"
            >
              <div className={`rounded-[1.5rem] bg-gradient-to-br ${portal.tone} p-5`}>
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-900 shadow-sm">
                    <portal.icon className="h-6 w-6" />
                  </div>
                  <LuArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-900" />
                </div>
                <h2 className="mt-8 text-2xl font-semibold text-slate-950">{portal.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{portal.description}</p>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
