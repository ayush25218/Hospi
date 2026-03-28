'use client';

import { useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { RoleSidebar } from '@/components/navigation/role-sidebar';
import { getNavigationForRole } from '@/config/navigation';
import { getRoleMeta, readSession, subscribeToSession, type UserRole } from '@/lib/auth';

type AppShellProps = {
  role: UserRole;
  children: React.ReactNode;
};

export function AppShell({ role, children }: AppShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const session = useSyncExternalStore(subscribeToSession, readSession, () => null);
  const userName = session?.name ?? getRoleMeta(role).label;
  const navigation = getNavigationForRole(role);

  const pageTitle = resolvePageTitle(pathname, navigation) ?? `${getRoleMeta(role).shortLabel} Workspace`;
  const dateLabel = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(new Date());

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.15),_transparent_30%),linear-gradient(180deg,_#f8fbff_0%,_#eef4fb_100%)]">
      <div className="flex min-h-screen">
        <RoleSidebar
          role={role}
          sections={navigation}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((current) => !current)}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/75 px-4 py-4 backdrop-blur-xl sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">{dateLabel}</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">{pageTitle}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Welcome back, {userName}. Everything important is one step away.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
              >
                Open Menu
              </button>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

function resolvePageTitle(pathname: string, navigation: ReturnType<typeof getNavigationForRole>) {
  for (const section of navigation) {
    for (const item of section.items) {
      if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
        if (item.children) {
          const childMatch = item.children.find(
            (child) => pathname === child.href || pathname.startsWith(`${child.href}/`)
          );

          return childMatch?.label ?? item.label;
        }

        return item.label;
      }
    }
  }

  return null;
}
