import { LuHeartPulse, LuNotebookPen, LuPhoneCall, LuTriangleAlert } from 'react-icons/lu';

const patientCards = [
  {
    name: 'Aarav Sharma',
    department: 'Cardiology',
    nextStep: 'ECG review at 11:30 AM',
    alert: 'High priority',
  },
  {
    name: 'Riya Singh',
    department: 'Neurology',
    nextStep: 'Approve MRI summary',
    alert: 'Report ready',
  },
  {
    name: 'Vikram Mehra',
    department: 'Surgery',
    nextStep: 'Discharge follow-up tomorrow',
    alert: 'Stable',
  },
];

export default function DoctorPatientsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">My patients</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Patient queue</h1>
        <p className="mt-2 text-sm text-slate-500">
          Focused doctor cards for patient follow-up, without admin management clutter.
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {patientCards.map((patient) => (
          <article
            key={patient.name}
            className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                <LuHeartPulse className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {patient.department}
              </span>
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-950">{patient.name}</h2>
            <p className="mt-2 text-sm text-slate-500">{patient.nextStep}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                <LuTriangleAlert className="h-4 w-4" />
                {patient.alert}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                <LuNotebookPen className="h-4 w-4" />
                Clinical note
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                <LuPhoneCall className="h-4 w-4" />
                Contact
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
