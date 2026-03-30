'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { LuChevronDown, LuLogOut, LuMenu, LuPanelLeftClose, LuShieldPlus } from 'react-icons/lu';
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
      {isOpen && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm lg:hidden"
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-white/10 bg-slate-950 text-white shadow-2xl transition-transform duration-300 lg:sticky lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-300">
                <LuShieldPlus className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">Hospi</p>
                <h1 className="text-xl font-semibold">{roleMeta.shortLabel} Workspace</h1>
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

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold">{session?.name ?? roleMeta.label}</p>
            <p className="mt-1 text-sm text-white/60">{session?.email ?? `${roleMeta.shortLabel} account`}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          {sections.map((section) => (
            <div key={section.title} className="space-y-2">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/35">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <SidebarItem key={item.href} item={item} onNavigate={onClose} />
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <LuLogOut className="h-4 w-4" />
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
    (child) => pathname === child.href || pathname.startsWith(`${child.href}/`)
  );
  const [isOpen, setIsOpen] = useState(Boolean(matchesItem || hasActiveChild));
  const shouldShowChildren = hasActiveChild || isOpen;

  if (item.children) {
    return (
      <li className="rounded-2xl bg-white/[0.03]">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition ${
            matchesItem || hasActiveChild
              ? 'bg-cyan-400/10 text-white'
              : 'text-white/72 hover:bg-white/5 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-3">
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </span>
          <LuChevronDown
            className={`h-4 w-4 transition-transform ${shouldShowChildren ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence initial={false}>
          {shouldShowChildren && (
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1 overflow-hidden px-3 pb-3"
            >
              {item.children.map((child) => {
                const isActive = pathname === child.href || pathname.startsWith(`${child.href}/`);

                return (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      onClick={onNavigate}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                        isActive
                          ? 'bg-white text-slate-950'
                          : 'text-white/65 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <child.icon className="h-4 w-4" />
                      {child.label}
                    </Link>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
          matchesItem ? 'bg-white text-slate-950 shadow-lg' : 'text-white/72 hover:bg-white/5 hover:text-white'
        }`}
      >
        <item.icon className="h-5 w-5" />
        <span className="font-medium">{item.label}</span>
      </Link>
    </li>
  );
}
