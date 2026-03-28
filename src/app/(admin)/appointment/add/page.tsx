'use client';

import { useState } from 'react';
import type { ElementType, ReactNode } from 'react';
import { LuCalendarPlus, LuSave, LuStethoscope, LuUserRound } from 'react-icons/lu';

export default function AddAppointmentPage() {
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    date: '',
    time: '',
    reason: '',
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    window.alert('Appointment saved in demo mode.');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
            <LuCalendarPlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Create Appointment</h1>
            <p className="mt-1 text-sm text-slate-500">Quick booking form for front desk and admin teams.</p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Patient name" icon={LuUserRound}>
            <input
              type="text"
              name="patient"
              value={formData.patient}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              placeholder="Enter patient name"
              required
            />
          </Field>

          <Field label="Doctor" icon={LuStethoscope}>
            <select
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              required
            >
              <option value="">Select doctor</option>
              <option value="Dr. Priya Gupta">Dr. Priya Gupta</option>
              <option value="Dr. Rohan Joshi">Dr. Rohan Joshi</option>
              <option value="Dr. Anjali Rao">Dr. Anjali Rao</option>
            </select>
          </Field>

          <Field label="Date">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              required
            />
          </Field>

          <Field label="Time">
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              required
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Reason for visit">
              <textarea
                name="reason"
                rows={5}
                value={formData.reason}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="Add a short note for the visit"
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <LuSave className="h-4 w-4" />
            Save appointment
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: ElementType;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        {Icon ? <Icon className="h-4 w-4 text-slate-400" /> : null}
        {label}
      </span>
      {children}
    </label>
  );
}
