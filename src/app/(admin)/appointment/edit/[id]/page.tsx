import Link from 'next/link';
import { LuArrowLeft, LuFilePenLine } from 'react-icons/lu';

export default async function EditAppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">Edit appointment</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Appointment #{id}</h1>
            <p className="mt-2 text-sm text-slate-500">
              This demo page keeps the route working and gives you a clear edit destination.
            </p>
          </div>
          <Link
            href="/appointment"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <LuArrowLeft className="h-4 w-4" />
            Back to appointments
          </Link>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-slate-700">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
            <LuFilePenLine className="h-5 w-5" />
          </div>
          <p className="text-sm leading-6">
            Replace this demo card with live edit controls once the backend is connected. For now, the
            route is no longer broken and the appointment flow feels complete.
          </p>
        </div>
      </section>
    </div>
  );
}
