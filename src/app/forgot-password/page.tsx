'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LuArrowLeft, LuKeyRound, LuMail, LuShieldCheck } from 'react-icons/lu';
import { apiRequest, describeError } from '@/lib/api-client';

type ForgotPasswordResponse = {
  requested: boolean;
  expiresAt?: string;
  resetUrl?: string;
  resetToken?: string;
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ForgotPasswordResponse | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiRequest<ForgotPasswordResponse>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      setResult(response);
    } catch (submissionError) {
      setError(describeError(submissionError, 'Unable to prepare password reset right now.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center justify-center">
        <div className="grid w-full gap-6 rounded-[2rem] bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.24)] md:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[1.75rem] bg-slate-950 p-8 text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-200">
              <LuKeyRound className="h-4 w-4" />
              Password recovery
            </span>
            <h1 className="mt-6 text-3xl font-semibold">Reset access without leaving the portal.</h1>
            <p className="mt-4 text-sm leading-6 text-white/70">
              Enter the email linked to your hospital account. For local development, the reset link is shown
              directly on screen instead of being emailed.
            </p>
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
              Admin-created doctor, patient, and admin accounts can all use this flow.
            </div>
          </section>

          <section className="flex items-center">
            <div className="w-full">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
              >
                <LuArrowLeft className="h-4 w-4" />
                Back to login
              </Link>

              <h2 className="mt-6 text-3xl font-semibold text-slate-950">Forgot password</h2>
              <p className="mt-2 text-sm text-slate-500">
                We&apos;ll prepare a secure reset token for your account.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Account email</span>
                  <div className="relative">
                    <LuMail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@hospital.com"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3.5 text-slate-950 outline-none transition focus:border-slate-400"
                      required
                    />
                  </div>
                </label>

                {error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}

                {result ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                    <div className="flex items-start gap-3">
                      <LuShieldCheck className="mt-0.5 h-5 w-5 flex-none" />
                      <div className="space-y-2">
                        <p className="font-semibold text-emerald-950">
                          If the account exists, reset instructions are ready.
                        </p>
                        {result.expiresAt ? (
                          <p>Token expiry: {new Date(result.expiresAt).toLocaleString('en-IN')}</p>
                        ) : null}
                        {result.resetUrl ? (
                          <Link
                            href={result.resetUrl.replace(/^https?:\/\/[^/]+/, '')}
                            className="inline-flex rounded-full border border-emerald-300 px-4 py-2 font-semibold text-emerald-900 transition hover:bg-emerald-100"
                          >
                            Open reset form
                          </Link>
                        ) : (
                          <p>Check your configured delivery channel for the reset link.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Preparing reset...' : 'Generate reset link'}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
