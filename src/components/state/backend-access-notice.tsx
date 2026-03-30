import Link from 'next/link';
import { LuArrowRight, LuShieldAlert } from 'react-icons/lu';

type BackendAccessNoticeProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function BackendAccessNotice({
  title,
  description,
  actionHref = '/login/adminlogin',
  actionLabel = 'Go to login',
}: BackendAccessNoticeProps) {
  return (
    <section className="hospi-panel overflow-hidden rounded-[2rem] p-6 text-white shadow-[0_24px_80px_rgba(5,12,24,0.42)]">
      <div className="pointer-events-none absolute hidden" />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-[1.4rem] border border-amber-300/20 bg-amber-300/10 text-amber-100 shadow-[0_0_28px_rgba(251,191,36,0.14)]">
            <LuShieldAlert className="h-6 w-6" />
          </div>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-100/70">Access check</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{title}</h2>
            <p className="mt-2 text-sm leading-7 text-white/66">{description}</p>
          </div>
        </div>

        <Link
          href={actionHref}
          className="inline-flex h-fit items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
        >
          {actionLabel}
          <LuArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
