'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LuBuilding2,
  LuSave,
  LuSearch,
  LuStethoscope,
  LuTrash2,
  LuUsers,
  LuX,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { useSession } from '@/hooks/use-session';
import {
  apiRequest,
  describeError,
  getInitials,
  type DepartmentRecord,
  type DoctorRecord,
} from '@/lib/api-client';

type DepartmentFormState = {
  name: string;
  description: string;
  headDoctorId: string;
  staffCount: string;
};

const initialForm: DepartmentFormState = {
  name: '',
  description: '',
  headDoctorId: '',
  staffCount: '0',
};

export default function DepartmentsPage() {
  const session = useSession();
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [formData, setFormData] = useState<DepartmentFormState>(initialForm);
  const [editingId, setEditingId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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
        const [departmentsResponse, doctorsResponse] = await Promise.all([
          apiRequest<DepartmentRecord[]>('/departments', {}, session),
          apiRequest<DoctorRecord[]>('/doctors', {}, session),
        ]);

        if (isActive) {
          setDepartments(departmentsResponse);
          setDoctors(doctorsResponse);
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load departments right now.'));
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

  const filteredDepartments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return departments.filter((department) => {
      if (!normalizedSearch) {
        return true;
      }

      return (
        department.name.toLowerCase().includes(normalizedSearch) ||
        department.description?.toLowerCase().includes(normalizedSearch) ||
        department.headDoctor?.user.name.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [departments, searchTerm]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId('');
  };

  const handleEdit = (department: DepartmentRecord) => {
    setEditingId(department._id);
    setFormData({
      name: department.name,
      description: department.description ?? '',
      headDoctorId: department.headDoctor?._id ?? '',
      staffCount: String(department.staffCount),
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.token) {
      setError('Your admin session is missing its backend token. Sign in again from the admin login page.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        headDoctorId: formData.headDoctorId || undefined,
        staffCount: Number(formData.staffCount) || 0,
      };

      if (editingId) {
        const updatedDepartment = await apiRequest<DepartmentRecord>(
          `/departments/${editingId}`,
          {
            method: 'PATCH',
            body: JSON.stringify(payload),
          },
          session,
        );

        setDepartments((current) =>
          current.map((department) => (department._id === editingId ? updatedDepartment : department)),
        );
      } else {
        const createdDepartment = await apiRequest<DepartmentRecord>(
          '/departments',
          {
            method: 'POST',
            body: JSON.stringify(payload),
          },
          session,
        );

        setDepartments((current) =>
          [createdDepartment, ...current].sort((left, right) => left.name.localeCompare(right.name)),
        );
      }

      resetForm();
    } catch (submissionError) {
      setError(describeError(submissionError, 'Unable to save this department right now.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (departmentId: string) => {
    if (!session?.token) {
      return;
    }

    const confirmed = window.confirm('Delete this department?');

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest<null>(
        `/departments/${departmentId}`,
        {
          method: 'DELETE',
        },
        session,
      );

      setDepartments((current) => current.filter((department) => department._id !== departmentId));

      if (editingId === departmentId) {
        resetForm();
      }
    } catch (deleteError) {
      setError(describeError(deleteError, 'Unable to delete this department right now.'));
    }
  };

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Departments now load from MongoDB. Sign in again through the admin portal to manage the live department list."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
            <LuBuilding2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Departments</h1>
            <p className="mt-1 text-sm text-slate-500">
              Organize hospital specialties, assign HODs, and track team size in one place.
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                {editingId ? 'Edit department' : 'Add department'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Save the department profile, HOD, and staff count.
              </p>
            </div>

            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <LuX className="h-3.5 w-3.5" />
                Cancel
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <Field label="Department name" icon={LuBuilding2}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="Cardiology"
                required
              />
            </Field>

            <Field label="Head of department" icon={LuStethoscope}>
              <select
                name="headDoctorId"
                value={formData.headDoctorId}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.user.name} · {doctor.specialization}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Total staff" icon={LuUsers}>
              <input
                type="number"
                min={0}
                name="staffCount"
                value={formData.staffCount}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              />
            </Field>

            <Field label="Description">
              <textarea
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="What does this department handle?"
              />
            </Field>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LuSave className="h-4 w-4" />
              {isSaving ? 'Saving department...' : editingId ? 'Update department' : 'Save department'}
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <LuSearch className="h-4 w-4 text-slate-400" />
                Search departments
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="Department name, description, or HOD"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {isLoading ? (
              <div className="rounded-[1.75rem] border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm md:col-span-2">
                Loading departments...
              </div>
            ) : filteredDepartments.length > 0 ? (
              filteredDepartments.map((department) => (
                <article
                  key={department._id}
                  className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">{department.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {department.headDoctor ? department.headDoctor.user.name : 'No HOD assigned yet'}
                      </p>
                    </div>
                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                      {department.doctorCount} doctors
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {department.description || 'No department description added yet.'}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Doctors</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">{department.doctorCount}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Staff</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">{department.staffCount}</p>
                    </div>
                  </div>

                  {department.headDoctor ? (
                    <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 p-3">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700">
                        {getInitials(department.headDoctor.user.name)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{department.headDoctor.user.name}</p>
                        <p className="text-sm text-slate-500">{department.headDoctor.specialization}</p>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-5 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(department)}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(department._id)}
                      className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                    >
                      <LuTrash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm md:col-span-2">
                No departments found for the current search.
              </div>
            )}
          </div>
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
