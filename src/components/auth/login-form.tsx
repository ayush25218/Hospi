'use client';

import { startTransition, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LuArrowLeft,
  LuCircleCheck,
  LuLock,
  LuMail,
  LuShieldEllipsis,
  LuSparkles,
} from 'react-icons/lu';
import { getRoleMeta, writeSession, type UserRole } from '@/lib/auth';
import { apiRequest, describeError, type AuthResponse } from '@/lib/api-client';

const roleStyles: Record<
  UserRole,
  {
    halo: string;
    badge: string;
    button: string;
    card: string;
    accentText: string;
    highlights: string[];
  }
> = {
  admin: {
    halo: 'from-cyan-400/26 via-sky-400/16 to-transparent',
    badge: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100',
    button: 'bg-white text-slate-950 hover:bg-slate-100',
    card: 'from-cyan-300/14 via-white/[0.05] to-transparent',
    accentText: 'text-cyan-100',
    highlights: ['Live oversight panels', 'Finance and staffing control', 'Audit-ready navigation'],
  },
  doctor: {
    halo: 'from-emerald-400/24 via-teal-400/16 to-transparent',
    badge: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100',
    button: 'bg-emerald-300 text-slate-950 hover:bg-emerald-200',
    card: 'from-emerald-300/14 via-white/[0.05] to-transparent',
    accentText: 'text-emerald-100',
    highlights: ['Doctor-only workspace', 'Appointments and patient focus', 'Cleaner daily flow'],
  },
  patient: {
    halo: 'from-violet-400/24 via-fuchsia-400/14 to-transparent',
    badge: 'border-violet-300/20 bg-violet-300/10 text-violet-100',
    button: 'bg-violet-300 text-slate-950 hover:bg-violet-200',
    card: 'from-violet-300/14 via-white/[0.05] to-transparent',
    accentText: 'text-violet-100',
    highlights: ['Personalized care access', 'Appointments in one place', 'Faster pharmacy context'],
  },
};

export function LoginForm({ role }: { role: UserRole }) {
  const router = useRouter();
  const roleMeta = getRoleMeta(role);
  const styles = roleStyles[role];
  const isAdminRole = role === 'admin';

  const [email, setEmail] = useState(isAdminRole ? roleMeta.credentials.email : '');
  const [password, setPassword] = useState(isAdminRole ? roleMeta.credentials.password : '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const helperCards = useMemo(
    () =>
      styles.highlights.map((item, index) => ({
        label: item,
        value: index === 0 ? 'Online' : index === 1 ? 'Optimized' : 'Secured',
      })),
    [styles.highlights],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (result.user.role !== role) {
        setError(
          `This account belongs to the ${getRoleMeta(result.user.role).shortLabel} portal. Please use the correct login.`,
        );
        return;
      }

      writeSession({
        id: result.user._id,
        role: result.user.role,
        email: result.user.email,
        name: result.user.name,
        token: result.token,
        source: 'backend',
      });

      startTransition(() => {
        router.replace(getRoleMeta(result.user.role).redirectPath);
      });
    } catch (submissionError) {
      setError(describeError(submissionError, 'Unable to sign you in right now.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute inset-x-0 top-0 h-[34rem] bg-gradient-to-b ${styles.halo}`} />
        <div className="absolute left-[-6rem] top-16 h-[24rem] w-[24rem] rounded-full bg-cyan-400/10 blur-[130px]" />
        <div className="absolute bottom-[-10rem] right-[-8rem] h-[26rem] w-[26rem] rounded-full bg-sky-500/10 blur-[150px]" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <section className="hospi-panel flex flex-col justify-between rounded-[2.4rem] p-8 sm:p-10">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/68 transition hover:text-white"
              >
                <LuArrowLeft className="h-4 w-4" />
                Back to portal selection
              </Link>

              <span
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${styles.badge}`}
              >
                <LuShieldEllipsis className="h-4 w-4" />
                {roleMeta.shortLabel} access
              </span>
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-semibold leading-[0.95] text-white sm:text-5xl lg:text-6xl">
                {roleMeta.label} login reimagined as a cleaner, brighter command surface.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/66 sm:text-lg">
                {roleMeta.summary} This portal now routes every signed-in account straight into the correct
                workspace, with a more focused visual flow from first input to final destination.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {helperCards.map((card) => (
                <div
                  key={card.label}
                  className={`rounded-[1.6rem] border border-white/10 bg-gradient-to-br ${styles.card} p-4`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.08]">
                      <LuCircleCheck className={`h-4 w-4 ${styles.accentText}`} />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
                      {card.value}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-medium text-white/84">{card.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-[1.8rem] border border-white/10 bg-white/[0.05] p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/40">
              <LuSparkles className={`h-4 w-4 ${styles.accentText}`} />
              Workspace signal
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {[
                'Role-aware workspace routing',
                'Backend-authenticated sessions',
                'Cleaner shell and recovery flow',
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-white/[0.05] px-4 py-4 text-sm text-white/72">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center">
          <div className="hospi-light-panel w-full rounded-[2.3rem] p-8 text-slate-950 sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Hospi sign in</p>
              <h2 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
                {roleMeta.shortLabel} Portal
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">
                Real accounts only. Every login now goes through the Express backend before opening the workspace.
              </p>
            </div>

            <div className="mb-6 rounded-[1.6rem] border border-slate-200 bg-slate-950/[0.03] p-4 text-sm text-slate-600">
              {isAdminRole ? (
                <>
                  <p className="font-semibold text-slate-950">Starter admin account</p>
                  <p className="mt-2">
                    Email: <span className="font-medium text-slate-950">{roleMeta.credentials.email}</span>
                  </p>
                  <p className="mt-1">
                    Password: <span className="font-medium text-slate-950">{roleMeta.credentials.password}</span>
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-slate-950">Account required</p>
                  <p className="mt-2">Use the email and password created by admin from the live hospital system.</p>
                </>
              )}
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
                    className="w-full rounded-[1.35rem] border border-slate-200 bg-white px-12 py-3.5 text-slate-950 outline-none transition focus:border-slate-400 focus:shadow-[0_0_0_4px_rgba(148,163,184,0.12)]"
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
                    className="w-full rounded-[1.35rem] border border-slate-200 bg-white px-12 py-3.5 text-slate-950 outline-none transition focus:border-slate-400 focus:shadow-[0_0_0_4px_rgba(148,163,184,0.12)]"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </label>

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                >
                  Forgot password?
                </Link>
              </div>

              {error ? (
                <div className="rounded-[1.35rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full rounded-[1.45rem] px-4 py-3.5 text-sm font-semibold transition ${styles.button}`}
              >
                {isSubmitting ? 'Signing in...' : `Enter ${roleMeta.shortLabel} Workspace`}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
