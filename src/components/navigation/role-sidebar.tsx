'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LuChevronDown,
  LuLogOut,
  LuMenu,
  LuPanelLeftClose,
  LuShieldPlus,
  LuSparkles,
} from 'react-icons/lu';
import type { NavigationItem, NavigationSection } from '@/config/navigation';
import { clearSession, getRoleMeta, type UserRole } from '@/lib/auth';
import { useSession } from '@/hooks/use-session';

type RoleSidebarProps = {
  role: UserRole;
  sections: NavigationSection[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
};

export function RoleSidebar({
  role,
  sections,
  isOpen,
  onToggle,
  onClose,
}: RoleSidebarProps) {
  const router = useRouter();
  const session = useSession();
  const roleMeta = getRoleMeta(role);

  const handleLogout = () => {
    clearSession();
    router.replace(roleMeta.loginPath);
  };

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          aria-label="Close navigation"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-white/10 bg-[linear-gradient(180deg,rgba(5,14,25,0.97)_0%,rgba(7,20,36,0.94)_52%,rgba(4,12,24,0.98)_100%)] text-white shadow-[0_30px_90px_rgba(2,8,18,0.62)] backdrop-blur-2xl transition-transform duration-300 lg:sticky lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top,rgba(98,232,255,0.2),transparent_70%)]" />

        <div className="relative border-b border-white/10 px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/15 bg-cyan-300/10 text-cyan-200 shadow-[0_0_40px_rgba(98,232,255,0.14)]">
                <LuShieldPlus className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">Hospi</p>
                <h1 className="mt-1 text-xl font-semibold tracking-[-0.03em]">{roleMeta.shortLabel} Nexus</h1>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggle}
              className="rounded-xl border border-white/10 p-2 text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Toggle navigation"
            >
              {isOpen ? <LuPanelLeftClose className="h-5 w-5" /> : <LuMenu className="h-5 w-5" />}
            </button>
          </div>

          <div className="mt-5 rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{session?.name ?? roleMeta.label}</p>
                <p className="mt-1 text-sm text-white/55">{session?.email ?? `${roleMeta.shortLabel} account`}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
                <LuSparkles className="h-3.5 w-3.5" />
                Live
              </span>
            </div>
          </div>
        </div>

        <nav className="relative flex-1 space-y-6 overflow-y-auto px-4 py-6">
          {sections.map((section) => (
            <div key={section.title} className="space-y-2">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/30">
                {section.title}
              </p>
              <ul className="space-y-1.5">
                {section.items.map((item) => (
                  <SidebarItem key={item.href} item={item} onNavigate={onClose} />
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="relative border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-[1.4rem] border border-white/10 bg-white/[0.07] px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/20 hover:bg-white/[0.11]"
          >
            <LuLogOut className="h-4 w-4 text-cyan-200" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({
  item,
  onNavigate,
}: {
  item: NavigationItem;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const matchesItem = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const hasActiveChild = item.children?.some(
    (child) => pathname === child.href || pathname.startsWith(`${child.href}/`),
  );
  const [isOpen, setIsOpen] = useState(Boolean(matchesItem || hasActiveChild));
  const shouldShowChildren = hasActiveChild || isOpen;

  if (item.children) {
    return (
      <li className="overflow-hidden rounded-[1.4rem] border border-white/[0.04] bg-white/[0.03]">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className={`flex w-full items-center justify-between rounded-[1.4rem] px-3 py-3 text-left transition ${
            matchesItem || hasActiveChild
              ? 'bg-gradient-to-r from-cyan-300/16 via-sky-300/10 to-transparent text-white'
              : 'text-white/72 hover:bg-white/[0.06] hover:text-white'
          }`}
        >
          <span className="flex items-center gap-3">
            <span
              className={`grid h-9 w-9 place-items-center rounded-2xl ${
                matchesItem || hasActiveChild ? 'bg-white text-slate-950' : 'bg-white/[0.06] text-cyan-100'
              }`}
            >
              <item.icon className="h-[18px] w-[18px]" />
            </span>
            <span className="font-medium">{item.label}</span>
          </span>
          <LuChevronDown
            className={`h-4 w-4 transition-transform ${shouldShowChildren ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence initial={false}>
          {shouldShowChildren ? (
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5 overflow-hidden px-3 pb-3"
            >
              {item.children.map((child) => {
                const isActive = pathname === child.href || pathname.startsWith(`${child.href}/`);

                return (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      onClick={onNavigate}
                      className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
                        isActive
                          ? 'bg-white text-slate-950 shadow-lg'
                          : 'text-white/62 hover:bg-white/[0.08] hover:text-white'
                      }`}
                    >
                      <child.icon className="h-4 w-4" />
                      {child.label}
                    </Link>
                  </li>
                );
              })}
            </motion.ul>
          ) : null}
        </AnimatePresence>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        className={`flex items-center gap-3 rounded-[1.4rem] px-3 py-3 transition ${
          matchesItem
            ? 'bg-gradient-to-r from-white to-sky-50 text-slate-950 shadow-[0_16px_32px_rgba(5,16,31,0.28)]'
            : 'text-white/72 hover:bg-white/[0.06] hover:text-white'
        }`}
      >
        <span
          className={`grid h-9 w-9 place-items-center rounded-2xl ${
            matchesItem ? 'bg-slate-950 text-cyan-200' : 'bg-white/[0.06] text-cyan-100'
          }`}
        >
          <item.icon className="h-[18px] w-[18px]" />
        </span>
        <span className="font-medium">{item.label}</span>
      </Link>
    </li>
  );
}
