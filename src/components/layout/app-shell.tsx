'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { LuCalendarDays, LuCommand, LuSparkles } from 'react-icons/lu';
import { RoleSidebar } from '@/components/navigation/role-sidebar';
import { getNavigationForRole } from '@/config/navigation';
import { getRoleMeta, type UserRole } from '@/lib/auth';
import { useSession } from '@/hooks/use-session';

type AppShellProps = {
  role: UserRole;
  children: React.ReactNode;
};

export function AppShell({ role, children }: AppShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const session = useSession();
  const userName = session?.name ?? getRoleMeta(role).label;
  const roleMeta = getRoleMeta(role);
  const navigation = getNavigationForRole(role);

  const pageTitle = resolvePageTitle(pathname, navigation) ?? `${roleMeta.shortLabel} Workspace`;
  const dateLabel = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(new Date());

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-0 h-[28rem] w-[28rem] rounded-full bg-cyan-400/18 blur-[120px]" />
        <div className="absolute right-[-8rem] top-28 h-[24rem] w-[24rem] rounded-full bg-emerald-400/12 blur-[120px]" />
        <div className="absolute bottom-[-8rem] left-1/3 h-[22rem] w-[22rem] rounded-full bg-sky-500/12 blur-[140px]" />
      </div>

      <div className="relative flex min-h-screen">
        <RoleSidebar
          role={role}
          sections={navigation}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((current) => !current)}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:px-8">
            <div className="rounded-[1.9rem] border border-cyan-200/12 bg-[linear-gradient(180deg,rgba(9,20,37,0.97),rgba(6,16,30,0.99))] px-5 py-5 text-white shadow-[0_28px_90px_rgba(3,10,21,0.5)] backdrop-blur-[28px] sm:px-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100">
                      <span className="hospi-signal-dot relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
                      Live workspace
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/75">
                      <LuCalendarDays className="h-3.5 w-3.5 text-cyan-200" />
                      {dateLabel}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                      {roleMeta.shortLabel} command deck
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">{pageTitle}</h2>
                    <p className="mt-2 max-w-2xl text-sm text-white/62 sm:text-base">
                      Welcome back, {userName}. The refreshed workspace keeps your highest-value actions, data,
                      and alerts closer to the surface.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row xl:items-center">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
                      Active profile
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">{session?.email ?? roleMeta.label}</p>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/12 via-white/5 to-transparent px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
                      Workspace mode
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
                      <LuSparkles className="h-4 w-4 text-cyan-200" />
                      Premium flow active
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(true)}
                    className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/30 hover:bg-white/10 lg:hidden"
                  >
                    <LuCommand className="h-4 w-4 text-cyan-200" />
                    Open Menu
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 pb-8 pt-7 sm:px-6 sm:pt-8 lg:px-8">
            <div className="mx-auto max-w-[96rem]">{children}</div>
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
            (child) => pathname === child.href || pathname.startsWith(`${child.href}/`),
          );

          return childMatch?.label ?? item.label;
        }

        return item.label;
      }
    }
  }

  return null;
}
