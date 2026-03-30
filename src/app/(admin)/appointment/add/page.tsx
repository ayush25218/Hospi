'use client';

import { startTransition, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ElementType, ReactNode } from 'react';
import {
  LuCalendarPlus,
  LuClock3,
  LuFileText,
  LuSave,
  LuSparkles,
  LuStethoscope,
  LuUserRound,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import {
  apiRequest,
  describeError,
  formatRecordId,
  type AppointmentRecord,
  type DoctorRecord,
  type PatientRecord,
} from '@/lib/api-client';
import { useSession } from '@/hooks/use-session';

export default function AddAppointmentPage() {
  const router = useRouter();
  const session = useSession();
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    reason: '',
    notes: '',
  });
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.token) {
      setIsLoadingOptions(false);
      return;
    }

    let isActive = true;

    const loadOptions = async () => {
      setIsLoadingOptions(true);
      setError('');

      try {
        const [patientResponse, doctorResponse] = await Promise.all([
          apiRequest<PatientRecord[]>('/patients', {}, session),
          apiRequest<DoctorRecord[]>('/doctors', {}, session),
        ]);

        if (isActive) {
          setPatients(patientResponse);
          setDoctors(doctorResponse);
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load patients and doctors right now.'));
        }
      } finally {
        if (isActive) {
          setIsLoadingOptions(false);
        }
      }
    };

    void loadOptions();

    return () => {
      isActive = false;
    };
  }, [session]);

  const canCreateAppointment = useMemo(() => patients.length > 0 && doctors.length > 0, [doctors.length, patients.length]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.token) {
      setError('Your admin session is missing its backend token. Sign in again from the admin login page.');
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      await apiRequest<AppointmentRecord>(
        '/appointments',
        {
          method: 'POST',
          body: JSON.stringify({
            patientId: formData.patientId,
            doctorId: formData.doctorId,
            scheduledAt: new Date(`${formData.date}T${formData.time}`).toISOString(),
            reason: formData.reason.trim(),
            notes: formData.notes.trim() || undefined,
          }),
        },
        session,
      );

      startTransition(() => {
        router.push('/appointment');
      });
    } catch (submissionError) {
      setError(describeError(submissionError, 'Unable to create this appointment right now.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Appointments now save directly in MongoDB. Sign in again through the admin portal so this page can send authenticated API requests."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="hospi-panel overflow-hidden rounded-[2.2rem] px-6 py-8 text-white shadow-[0_28px_90px_rgba(5,12,24,0.42)] sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">
              <LuCalendarPlus className="h-4 w-4" />
              New appointment
            </div>

            <div>
              <h1 className="text-4xl font-semibold leading-[0.95] text-white sm:text-5xl">
                Create a polished, live appointment in one pass.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/66 sm:text-base">
                Book a real appointment using saved doctor and patient records, with a calmer form layout that works better on desktop and mobile.
              </p>
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.8rem] border border-white/10 bg-white/[0.05] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white/74">Booking readiness</p>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
                <LuSparkles className="h-3.5 w-3.5" />
                Live
              </span>
            </div>
            <SummaryValue label="Patients available" value={String(patients.length)} />
            <SummaryValue label="Doctors available" value={String(doctors.length)} />
            <SummaryValue label="Form status" value={canCreateAppointment ? 'Ready' : 'Waiting'} />
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!isLoadingOptions && !canCreateAppointment ? (
        <section className="hospi-light-panel rounded-[1.9rem] p-6 text-slate-950">
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Add patient and doctor records first</h2>
          <p className="mt-2 text-sm text-slate-500">
            An appointment needs one saved patient and one saved doctor. Create the missing records, then come back here.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/patient/add"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <LuUserRound className="h-4 w-4" />
              Add Patient
            </Link>
            <Link
              href="/doctor/add"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <LuStethoscope className="h-4 w-4" />
              Add Doctor
            </Link>
          </div>
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="hospi-light-panel rounded-[1.9rem] p-6 text-slate-950">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Patient" icon={LuUserRound}>
                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  className="w-full rounded-[1.3rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-cyan-400"
                  required
                  disabled={isLoadingOptions}
                >
                  <option value="">{isLoadingOptions ? 'Loading patients...' : 'Select patient'}</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.user.name} ({formatRecordId('PAT', patient._id)})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Doctor" icon={LuStethoscope}>
                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  className="w-full rounded-[1.3rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-cyan-400"
                  required
                  disabled={isLoadingOptions}
                >
                  <option value="">{isLoadingOptions ? 'Loading doctors...' : 'Select doctor'}</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.user.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Date" icon={LuCalendarPlus}>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full rounded-[1.3rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-cyan-400"
                  required
                />
              </Field>

              <Field label="Time" icon={LuClock3}>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full rounded-[1.3rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-cyan-400"
                  required
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Reason for visit" icon={LuFileText}>
                  <textarea
                    name="reason"
                    rows={4}
                    value={formData.reason}
                    onChange={handleChange}
                    className="w-full rounded-[1.3rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-cyan-400"
                    placeholder="Add a short note for the visit"
                    required
                  />
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="Internal notes" icon={LuFileText}>
                  <textarea
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full rounded-[1.3rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-cyan-400"
                    placeholder="Optional prep notes, reminders, or staff instructions"
                  />
                </Field>
              </div>
            </div>
          </section>

          <aside className="hospi-light-panel rounded-[1.9rem] p-6 text-slate-950">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Booking summary</h2>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <div className="rounded-[1.35rem] bg-slate-50 px-4 py-4">
                Patient: {formData.patientId ? patients.find((item) => item._id === formData.patientId)?.user.name || 'Selected' : 'Not selected'}
              </div>
              <div className="rounded-[1.35rem] bg-slate-50 px-4 py-4">
                Doctor: {formData.doctorId ? doctors.find((item) => item._id === formData.doctorId)?.user.name || 'Selected' : 'Not selected'}
              </div>
              <div className="rounded-[1.35rem] bg-slate-50 px-4 py-4">
                Schedule: {formData.date && formData.time ? `${formData.date} at ${formData.time}` : 'Not scheduled yet'}
              </div>
              <div className="rounded-[1.35rem] bg-slate-50 px-4 py-4">
                Notes: {formData.notes.trim() ? 'Included' : 'No internal notes'}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving || isLoadingOptions}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LuSave className="h-4 w-4" />
              {isSaving ? 'Saving appointment...' : 'Save appointment'}
            </button>
          </aside>
        </form>
      )}
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

function SummaryValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.05] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/42">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
