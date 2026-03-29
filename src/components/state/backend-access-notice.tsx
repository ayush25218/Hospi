import Link from 'next/link';
import { LuShieldAlert } from 'react-icons/lu';

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
    <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-700">
            <LuShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-amber-950">{title}</h2>
            <p className="mt-1 max-w-2xl text-sm text-amber-800">{description}</p>
          </div>
        </div>

        <Link
          href={actionHref}
          className="inline-flex h-fit items-center justify-center rounded-2xl bg-amber-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-800"
        >
          {actionLabel}
        </Link>
      </div>
    </section>
  );
}
