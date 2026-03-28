import type { ElementType } from 'react';
import { LuBadgeCheck, LuClock3, LuHospital, LuMail, LuPhone } from 'react-icons/lu';

const availability = [
  'Mon to Fri: 09:00 AM - 05:00 PM',
  'Ward round: 11:00 AM - 12:30 PM',
  'Teleconsultation: 04:00 PM - 05:00 PM',
];

export default function DoctorProfilePage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-white/10 text-2xl font-semibold">
            DR
          </div>
          <h1 className="mt-5 text-3xl font-semibold">Dr. Asha Mehta</h1>
          <p className="mt-2 text-sm text-white/70">Consultant Cardiologist</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1.5 text-sm font-semibold text-emerald-200">
            <LuBadgeCheck className="h-4 w-4" />
            Verified doctor profile
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Professional details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <InfoItem icon={LuHospital} label="Department" value="Cardiology" />
            <InfoItem icon={LuClock3} label="Experience" value="11 years" />
            <InfoItem icon={LuMail} label="Email" value="doctor@hospi.com" />
            <InfoItem icon={LuPhone} label="Phone" value="+91 98765 43121" />
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Availability</h2>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            {availability.map((slot) => (
              <li key={slot} className="rounded-2xl bg-slate-50 px-4 py-3">
                {slot}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-slate-700 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  );
}
