import { LuCalendarCheck2, LuClock3, LuFileText, LuMapPin } from 'react-icons/lu';

const doctorAppointments = [
  {
    patient: 'Aarav Sharma',
    time: '09:00 AM',
    room: 'Cardiac OPD 2',
    type: 'Routine review',
    status: 'Checked in',
  },
  {
    patient: 'Riya Singh',
    time: '10:30 AM',
    room: 'Neuro Lab 1',
    type: 'Consultation',
    status: 'Preparing',
  },
  {
    patient: 'Vikram Mehra',
    time: '12:15 PM',
    room: 'Room 307',
    type: 'Post-op follow up',
    status: 'Upcoming',
  },
  {
    patient: 'Nisha Verma',
    time: '04:45 PM',
    room: 'Telehealth',
    type: 'Medication review',
    status: 'Upcoming',
  },
];

export default function DoctorAppointmentsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">Doctor view</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Appointments</h1>
            <p className="mt-2 text-sm text-slate-500">
              A cleaner schedule board for doctors, without the admin-wide hospital controls.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <LuCalendarCheck2 className="h-4 w-4" />
            4 appointments scheduled today
          </div>
        </div>
      </section>

      <div className="grid gap-4">
        {doctorAppointments.map((appointment) => (
          <article
            key={`${appointment.patient}-${appointment.time}`}
            className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <LuClock3 className="h-4 w-4" />
                  {appointment.time}
                </div>
                <h2 className="text-xl font-semibold text-slate-950">{appointment.patient}</h2>
                <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                    <LuFileText className="h-4 w-4" />
                    {appointment.type}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                    <LuMapPin className="h-4 w-4" />
                    {appointment.room}
                  </span>
                </div>
              </div>
              <span className="inline-flex w-fit rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                {appointment.status}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
