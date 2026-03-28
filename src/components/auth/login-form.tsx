'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LuArrowLeft, LuCircleCheck, LuLock, LuMail, LuShieldEllipsis } from 'react-icons/lu';
import { buildSessionName, getRoleMeta, writeSession, type UserRole } from '@/lib/auth';

const roleStyles: Record<UserRole, { glow: string; badge: string; button: string }> = {
  admin: {
    glow: 'from-cyan-500/25 via-sky-400/15 to-transparent',
    badge: 'bg-cyan-500/12 text-cyan-700 ring-cyan-500/20',
    button: 'bg-slate-950 hover:bg-slate-800',
  },
  doctor: {
    glow: 'from-emerald-500/25 via-teal-400/15 to-transparent',
    badge: 'bg-emerald-500/12 text-emerald-700 ring-emerald-500/20',
    button: 'bg-emerald-600 hover:bg-emerald-500',
  },
  patient: {
    glow: 'from-violet-500/25 via-fuchsia-400/15 to-transparent',
    badge: 'bg-violet-500/12 text-violet-700 ring-violet-500/20',
    button: 'bg-violet-600 hover:bg-violet-500',
  },
};

export function LoginForm({ role }: { role: UserRole }) {
  const router = useRouter();
  const roleMeta = getRoleMeta(role);
  const styles = roleStyles[role];

  const [email, setEmail] = useState(roleMeta.credentials.email);
  const [password, setPassword] = useState(roleMeta.credentials.password);
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (
      email.trim().toLowerCase() !== roleMeta.credentials.email ||
      password !== roleMeta.credentials.password
    ) {
      setError('Use the demo credentials shown on the screen to enter this workspace.');
      return;
    }

    writeSession({
      role,
      email: roleMeta.credentials.email,
      name: buildSessionName(email, role),
    });

    router.replace(roleMeta.redirectPath);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 text-slate-950">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-gradient-to-b ${styles.glow}`}
      />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/5 p-8 text-white shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="space-y-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white"
            >
              <LuArrowLeft className="h-4 w-4" />
              Back to portal selection
            </Link>

            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ${styles.badge}`}
            >
              <LuShieldEllipsis className="h-4 w-4" />
              {roleMeta.shortLabel} access
            </span>

            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
                {roleMeta.label} login built for quick, focused hospital workflows.
              </h1>
              <p className="max-w-2xl text-base text-white/70 sm:text-lg">
                {roleMeta.summary} The new flow sends each role directly into the correct workspace, so
                doctors no longer land on the admin dashboard by mistake.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              'Role-based workspace routing',
              'Cleaner shell and navigation',
              'Demo credentials for instant preview',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 inline-flex rounded-full bg-white/10 p-2">
                  <LuCircleCheck className="h-4 w-4 text-cyan-300" />
                </div>
                <p className="text-sm font-medium text-white/85">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-[2rem] bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.25)] sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Hospi sign in</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">{roleMeta.shortLabel} Login</h2>
              <p className="mt-2 text-sm text-slate-500">
                Demo mode is enabled for this portfolio project. You can use the credentials below directly.
              </p>
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Demo credentials</p>
              <p className="mt-2">
                Email: <span className="font-medium text-slate-900">{roleMeta.credentials.email}</span>
              </p>
              <p className="mt-1">
                Password: <span className="font-medium text-slate-900">{roleMeta.credentials.password}</span>
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Email address</span>
                <div className="relative">
                  <LuMail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3.5 text-slate-950 outline-none transition placeholder:text-slate-350 focus:border-slate-400"
                    placeholder="you@hospital.com"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
                <div className="relative">
                  <LuLock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3.5 text-slate-950 outline-none transition focus:border-slate-400"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </label>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                className={`w-full rounded-2xl px-4 py-3.5 text-sm font-semibold text-white transition ${styles.button}`}
              >
                Enter {roleMeta.shortLabel} Workspace
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
