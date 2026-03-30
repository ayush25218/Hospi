'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LuCalendarDays,
  LuClipboardList,
  LuClock3,
  LuSave,
  LuSearch,
  LuStethoscope,
  LuTrash2,
  LuUserRound,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { useSession } from '@/hooks/use-session';
import {
  apiRequest,
  describeError,
  formatDateTime,
  type DoctorRecord,
  type OperationRecord,
  type OperationStatus,
  type PatientRecord,
} from '@/lib/api-client';
import { getTodayInputValue } from '@/lib/date-inputs';

type OperationFormState = {
  doctorId: string;
  patientId: string;
  operationName: string;
  scheduledDate: string;
  scheduledTime: string;
  roomNumber: string;
  status: OperationStatus;
  notes: string;
};

const initialForm: OperationFormState = {
  doctorId: '',
  patientId: '',
  operationName: '',
  scheduledDate: getTodayInputValue(),
  scheduledTime: '10:00',
  roomNumber: '',
  status: 'pending',
  notes: '',
};

export default function OperationTodoList() {
  const session = useSession();
  const [operations, setOperations] = useState<OperationRecord[]>([]);
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [formData, setFormData] = useState<OperationFormState>(initialForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OperationStatus>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.token) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadData = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [operationsResponse, doctorsResponse, patientsResponse] = await Promise.all([
          apiRequest<OperationRecord[]>('/operations', {}, session),
          apiRequest<DoctorRecord[]>('/doctors', {}, session),
          apiRequest<PatientRecord[]>('/patients', {}, session),
        ]);

        if (isActive) {
          setOperations(operationsResponse);
          setDoctors(doctorsResponse);
          setPatients(patientsResponse);
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load operation schedule right now.'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isActive = false;
    };
  }, [session]);

  const filteredOperations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return operations.filter((operation) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        operation.operationName.toLowerCase().includes(normalizedSearch) ||
        operation.doctorName.toLowerCase().includes(normalizedSearch) ||
        operation.patientName.toLowerCase().includes(normalizedSearch) ||
        operation.roomNumber?.toLowerCase().includes(normalizedSearch);

      const matchesStatus = statusFilter === 'all' || operation.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [operations, searchTerm, statusFilter]);

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
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const createdOperation = await apiRequest<OperationRecord>(
        '/operations',
        {
          method: 'POST',
          body: JSON.stringify({
            doctorId: formData.doctorId,
            patientId: formData.patientId,
            operationName: formData.operationName.trim(),
            scheduledAt: new Date(`${formData.scheduledDate}T${formData.scheduledTime}:00`).toISOString(),
            roomNumber: formData.roomNumber.trim() || undefined,
            status: formData.status,
            notes: formData.notes.trim() || undefined,
          }),
        },
        session,
      );

      setOperations((current) => [createdOperation, ...current].sort((left, right) => left.scheduledAt.localeCompare(right.scheduledAt)));
      setFormData(initialForm);
    } catch (submissionError) {
      setError(describeError(submissionError, 'Unable to save this operation right now.'));
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatus = async (operationId: string, status: OperationStatus) => {
    if (!session?.token) {
      return;
    }

    try {
      const updatedOperation = await apiRequest<OperationRecord>(
        `/operations/${operationId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        },
        session,
      );

      setOperations((current) =>
        current.map((operation) => (operation._id === operationId ? updatedOperation : operation)),
      );
    } catch (updateError) {
      setError(describeError(updateError, 'Unable to update this operation right now.'));
    }
  };

  const handleDelete = async (operationId: string) => {
    if (!session?.token) {
      return;
    }

    const confirmed = window.confirm('Delete this operation?');

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest<null>(
        `/operations/${operationId}`,
        {
          method: 'DELETE',
        },
        session,
      );

      setOperations((current) => current.filter((operation) => operation._id !== operationId));
    } catch (deleteError) {
      setError(describeError(deleteError, 'Unable to delete this operation right now.'));
    }
  };

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Operation scheduling now loads from MongoDB. Sign in again through the admin portal to manage the live surgery queue."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
            <LuClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Operation Scheduler</h1>
            <p className="mt-1 text-sm text-slate-500">
              Keep surgery planning, room references, and status progression in one live schedule.
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Schedule operation</h2>
          <p className="mt-1 text-sm text-slate-500">Create a new OT task using real patient and doctor records.</p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <Field label="Doctor" icon={LuStethoscope}>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              >
                <option value="">Select doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.user.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Patient" icon={LuUserRound}>
              <select
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              >
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.user.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Operation name">
              <input
                type="text"
                name="operationName"
                value={formData.operationName}
                onChange={handleChange}
                placeholder="Appendectomy"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <Field label="Date" icon={LuCalendarDays}>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  required
                />
              </Field>

              <Field label="Time" icon={LuClock3}>
                <input
                  type="time"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  required
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <Field label="OT / room number">
                <input
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  placeholder="OT-2"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                />
              </Field>

              <Field label="Status">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </Field>
            </div>

            <Field label="Notes">
              <textarea
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Pre-op requirements or handoff note"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              />
            </Field>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LuSave className="h-4 w-4" />
              {isSaving ? 'Saving operation...' : 'Save operation'}
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <LuSearch className="h-4 w-4 text-slate-400" />
                  Search operations
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Operation, doctor, patient, or room"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 text-sm font-medium text-slate-700">Status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as 'all' | OperationStatus)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
            </div>
          </div>

          <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Procedure</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Doctor / Patient</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Schedule</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                        Loading operations...
                      </td>
                    </tr>
                  ) : filteredOperations.length > 0 ? (
                    filteredOperations.map((operation) => (
                      <tr key={operation._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{operation.operationName}</p>
                          <p className="text-xs text-slate-500">{operation.roomNumber || 'Room not assigned yet'}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          <p className="font-medium text-slate-900">{operation.doctorName}</p>
                          <p>{operation.patientName}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{formatDateTime(operation.scheduledAt)}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(operation.status)}`}>
                            {toLabel(operation.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {operation.status !== 'completed' ? (
                              <button
                                type="button"
                                onClick={() => void updateStatus(operation._id, 'completed')}
                                className="rounded-full border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                              >
                                Complete
                              </button>
                            ) : null}
                            {operation.status === 'pending' ? (
                              <button
                                type="button"
                                onClick={() => void updateStatus(operation._id, 'in-progress')}
                                className="rounded-full border border-sky-200 px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-50"
                              >
                                Start
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => void handleDelete(operation._id)}
                              className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                            >
                              <LuTrash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                        No operations found for the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
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

function getStatusClasses(status: OperationStatus) {
  switch (status) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-700';
    case 'in-progress':
      return 'bg-sky-100 text-sky-700';
    case 'cancelled':
      return 'bg-rose-100 text-rose-700';
    case 'pending':
    default:
      return 'bg-amber-100 text-amber-700';
  }
}

function toLabel(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
