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
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
        session
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
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
            <LuCalendarPlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Create Appointment</h1>
            <p className="mt-1 text-sm text-slate-500">
              Book a real appointment using saved doctor and patient records.
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!isLoadingOptions && !canCreateAppointment ? (
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Add patient and doctor records first</h2>
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
        <form onSubmit={handleSubmit} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Patient" icon={LuUserRound}>
              <select
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
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
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
                disabled={isLoadingOptions}
              >
                <option value="">{isLoadingOptions ? 'Loading doctors...' : 'Select doctor'}</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.user.name} · {doctor.specialization}
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
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
            </Field>

            <Field label="Time" icon={LuClock3}>
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
              <Field label="Reason for visit" icon={LuFileText}>
                <textarea
                  name="reason"
                  rows={4}
                  value={formData.reason}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
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
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  placeholder="Optional prep notes, reminders, or staff instructions"
                />
              </Field>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSaving || isLoadingOptions}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LuSave className="h-4 w-4" />
              {isSaving ? 'Saving appointment...' : 'Save appointment'}
            </button>
          </div>
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
