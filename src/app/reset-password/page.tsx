'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { type ReactNode, Suspense, startTransition, useMemo, useState } from 'react';
import { LuArrowLeft, LuLock, LuShieldCheck } from 'react-icons/lu';
import { getRoleMeta, writeSession } from '@/lib/auth';
import { apiRequest, describeError, type AuthResponse } from '@/lib/api-client';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTokenPresent = useMemo(() => token.length > 0, [token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError('Reset token is missing from the link.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await apiRequest<AuthResponse>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token,
          password,
        }),
      });

      writeSession({
        id: result.user._id,
        role: result.user.role,
        email: result.user.email,
        name: result.user.name,
        organizationId: result.organization._id,
        organizationSlug: result.organization.slug,
        organizationName: result.organization.name,
        token: result.token,
        source: 'backend',
      });

      startTransition(() => {
        router.replace(getRoleMeta(result.user.role).redirectPath);
      });
    } catch (submissionError) {
      setError(describeError(submissionError, 'Unable to reset your password right now.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResetPasswordShell>
      <h1 className="mt-6 text-3xl font-semibold text-slate-950">Set a new password</h1>
      <p className="mt-2 text-sm text-slate-500">
        Choose a new password for your hospital account and we&apos;ll sign you in automatically.
      </p>

      {!isTokenPresent ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
          This reset link is missing its token. Go back and generate a fresh reset link.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">New password</span>
            <div className="relative">
              <LuLock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3.5 text-slate-950 outline-none transition focus:border-slate-400"
                placeholder="Minimum 8 characters"
                minLength={8}
                required
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Confirm password</span>
            <div className="relative">
              <LuShieldCheck className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3.5 text-slate-950 outline-none transition focus:border-slate-400"
                placeholder="Repeat the new password"
                minLength={8}
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
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Resetting password...' : 'Reset password'}
          </button>
        </form>
      )}
    </ResetPasswordShell>
  );
}

function ResetPasswordSkeleton() {
  return (
    <ResetPasswordShell>
      <h1 className="mt-6 text-3xl font-semibold text-slate-950">Set a new password</h1>
      <p className="mt-2 text-sm text-slate-500">Preparing your secure reset form...</p>
      <div className="mt-8 space-y-4">
        <div className="h-14 rounded-2xl bg-slate-100" />
        <div className="h-14 rounded-2xl bg-slate-100" />
        <div className="h-12 rounded-2xl bg-slate-200" />
      </div>
    </ResetPasswordShell>
  );
}

function ResetPasswordShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center">
        <div className="w-full rounded-[2rem] bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.24)]">
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            <LuArrowLeft className="h-4 w-4" />
            Back to reset request
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
