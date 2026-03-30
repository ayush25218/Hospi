'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearSession, getRoleMeta, type UserRole } from '@/lib/auth';
import { useSession } from '@/hooks/use-session';

type ProtectedRouteProps = {
  role: UserRole;
  children: React.ReactNode;
};

export function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (!session || !session.token) {
      if (session && !session.token) {
        clearSession();
      }

      router.replace(getRoleMeta(role).loginPath);
      return;
    }

    if (session.role !== role) {
      router.replace(getRoleMeta(session.role).redirectPath);
    }
  }, [role, router, session]);

  if (!session || !session.token || session.role !== role) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 px-6 text-center text-white">
        <div className="space-y-3">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-white/10" />
          <p className="text-lg font-semibold">Checking access...</p>
          <p className="text-sm text-white/65">Redirecting you to the right workspace.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
