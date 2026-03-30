'use client';

import { startTransition, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import type { ElementType, ReactNode } from 'react';
import {
  LuArrowLeft,
  LuCalendarPlus,
  LuClock3,
  LuFilePenLine,
  LuFileText,
  LuSave,
  LuStethoscope,
  LuUserRound,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { useSession } from '@/hooks/use-session';
import {
  apiRequest,
  describeError,
  formatRecordId,
  type AppointmentRecord,
  type AppointmentStatus,
  type DoctorRecord,
  type PatientRecord,
} from '@/lib/api-client';

const appointmentStatuses: Array<{ label: string; value: AppointmentStatus }> = [
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function EditAppointmentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const session = useSession();
  const appointmentId = typeof params?.id === 'string' ? params.id : '';
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    reason: '',
    notes: '',
    status: 'scheduled' as AppointmentStatus,
  });
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [appointmentRef, setAppointmentRef] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.token || !appointmentId) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadForm = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [appointment, patientResponse, doctorResponse] = await Promise.all([
          apiRequest<AppointmentRecord>(`/appointments/${appointmentId}`, {}, session),
          apiRequest<PatientRecord[]>('/patients', {}, session),
          apiRequest<DoctorRecord[]>('/doctors', {}, session),
        ]);

        if (!isActive) {
          return;
        }

        const scheduledAt = new Date(appointment.scheduledAt);

        setPatients(patientResponse);
        setDoctors(doctorResponse);
        setAppointmentRef(formatRecordId('APT', appointment._id));
        setFormData({
          patientId: appointment.patient._id,
          doctorId: appointment.doctor._id,
          date: scheduledAt.toISOString().slice(0, 10),
          time: scheduledAt.toTimeString().slice(0, 5),
          reason: appointment.reason,
          notes: appointment.notes ?? '',
          status: appointment.status,
        });
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load this appointment right now.'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadForm();

    return () => {
      isActive = false;
    };
  }, [appointmentId, session]);

  const canSave = useMemo(() => {
    return patients.length > 0 && doctors.length > 0;
  }, [doctors.length, patients.length]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.token) {
      setError('Your admin session is missing its backend token. Sign in again from the admin login page.');
      return;
    }

    if (!appointmentId) {
      setError('Appointment id is missing from the route.');
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      await apiRequest<AppointmentRecord>(
        `/appointments/${appointmentId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            patientId: formData.patientId,
            doctorId: formData.doctorId,
            scheduledAt: new Date(`${formData.date}T${formData.time}`).toISOString(),
            reason: formData.reason.trim(),
            notes: formData.notes.trim() || undefined,
            status: formData.status,
          }),
        },
        session,
      );

      startTransition(() => {
        router.push('/appointment');
      });
    } catch (submissionError) {
      setError(describeError(submissionError, 'Unable to update this appointment right now.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Appointment edits now sync directly with MongoDB. Sign in again through the admin portal to update this record."
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">Edit appointment</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">
              {appointmentRef || 'Appointment'} details
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Update patient assignment, timing, visit details, and current appointment status.
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

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Patient" icon={LuUserRound}>
            <select
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              required
              disabled={isLoading}
            >
              <option value="">{isLoading ? 'Loading patients...' : 'Select patient'}</option>
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
              disabled={isLoading}
            >
              <option value="">{isLoading ? 'Loading doctors...' : 'Select doctor'}</option>
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
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              required
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </Field>

          <Field label="Status" icon={LuFilePenLine}>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              required
              disabled={isLoading}
            >
              {appointmentStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </Field>
          </div>
        </div>

        {!isLoading && !canSave ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            This appointment cannot be edited until at least one patient and one doctor record are available.
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSaving || isLoading || !canSave}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <LuSave className="h-4 w-4" />
            {isSaving ? 'Updating appointment...' : 'Update appointment'}
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
