'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  LuBuilding2,
  LuMail,
  LuPhone,
  LuSave,
  LuSearch,
  LuTrash2,
  LuUserPlus,
  LuUserRound,
  LuX,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { useSession } from '@/hooks/use-session';
import {
  apiRequest,
  describeError,
  formatDate,
  getInitials,
  type StaffMemberRecord,
  type StaffMemberStatus,
} from '@/lib/api-client';
import { toDateInputValue, toIsoDateValue } from '@/lib/date-inputs';

type StaffFormState = {
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  status: StaffMemberStatus;
  joinedAt: string;
  notes: string;
};

const initialForm: StaffFormState = {
  name: '',
  email: '',
  phone: '',
  department: '',
  role: '',
  status: 'active',
  joinedAt: '',
  notes: '',
};

export default function StaffListPage() {
  const session = useSession();
  const [staffMembers, setStaffMembers] = useState<StaffMemberRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | StaffMemberStatus>('all');
  const [editingId, setEditingId] = useState('');
  const [formData, setFormData] = useState<StaffFormState>(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.token) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadStaff = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await apiRequest<StaffMemberRecord[]>('/staff-members', {}, session);

        if (isActive) {
          setStaffMembers(response);
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load staff members right now.'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadStaff();

    return () => {
      isActive = false;
    };
  }, [session]);

  const filteredStaff = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return staffMembers.filter((member) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        member.name.toLowerCase().includes(normalizedSearch) ||
        member.email.toLowerCase().includes(normalizedSearch) ||
        member.staffId.toLowerCase().includes(normalizedSearch) ||
        member.role.toLowerCase().includes(normalizedSearch);

      const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [departmentFilter, searchTerm, staffMembers, statusFilter]);

  const departments = useMemo(
    () => Array.from(new Set(staffMembers.map((member) => member.department))).sort((a, b) => a.localeCompare(b)),
    [staffMembers],
  );

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleEdit = (member: StaffMemberRecord) => {
    setEditingId(member._id);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone ?? '',
      department: member.department,
      role: member.role,
      status: member.status,
      joinedAt: toDateInputValue(member.joinedAt),
      notes: member.notes ?? '',
    });
  };

  const resetForm = () => {
    setEditingId('');
    setFormData(initialForm);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.token || !editingId) {
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const updatedMember = await apiRequest<StaffMemberRecord>(
        `/staff-members/${editingId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim(),
            department: formData.department.trim(),
            role: formData.role.trim(),
            status: formData.status,
            joinedAt: toIsoDateValue(formData.joinedAt),
            notes: formData.notes.trim() || undefined,
          }),
        },
        session,
      );

      setStaffMembers((current) => current.map((member) => (member._id === editingId ? updatedMember : member)));
      resetForm();
    } catch (submissionError) {
      setError(describeError(submissionError, 'Unable to update this staff profile right now.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (staffMemberId: string) => {
    if (!session?.token) {
      return;
    }

    const confirmed = window.confirm('Delete this staff member?');

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest<null>(
        `/staff-members/${staffMemberId}`,
        {
          method: 'DELETE',
        },
        session,
      );

      setStaffMembers((current) => current.filter((member) => member._id !== staffMemberId));

      if (editingId === staffMemberId) {
        resetForm();
      }
    } catch (deleteError) {
      setError(describeError(deleteError, 'Unable to delete this staff profile right now.'));
    }
  };

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Staff roster now loads from MongoDB. Sign in again through the admin portal to manage live team records."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
              <LuUserRound className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">Staff Directory</h1>
              <p className="mt-1 text-sm text-slate-500">
                Review active teams, update profiles, and keep staffing data ready for payroll and leave.
              </p>
            </div>
          </div>

          <Link
            href="/staff/add"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <LuUserPlus className="h-4 w-4" />
            Add staff member
          </Link>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-6">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <LuSearch className="h-4 w-4 text-slate-400" />
                  Search staff
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Name, email, role, or staff ID"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 text-sm font-medium text-slate-700">Department</span>
                <select
                  value={departmentFilter}
                  onChange={(event) => setDepartmentFilter(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                >
                  <option value="all">All departments</option>
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 text-sm font-medium text-slate-700">Status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as 'all' | StaffMemberStatus)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="on-leave">On leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {isLoading ? (
              <div className="rounded-[1.75rem] border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm md:col-span-2">
                Loading staff roster...
              </div>
            ) : filteredStaff.length > 0 ? (
              filteredStaff.map((member) => (
                <article key={member._id} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 font-semibold text-cyan-700">
                        {getInitials(member.name)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950">{member.name}</h3>
                        <p className="text-sm text-slate-500">
                          {member.staffId} · {member.role}
                        </p>
                      </div>
                    </div>

                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(member.status)}`}>
                      {toLabel(member.status)}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <LuBuilding2 className="h-4 w-4 text-slate-400" />
                      {member.department}
                    </p>
                    <p className="flex items-center gap-2">
                      <LuPhone className="h-4 w-4 text-slate-400" />
                      {member.phone || 'No phone added'}
                    </p>
                    <p className="flex items-center gap-2">
                      <LuMail className="h-4 w-4 text-slate-400" />
                      {member.email}
                    </p>
                  </div>

                  <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Joined {formatDate(member.joinedAt)}
                  </div>

                  {member.notes ? (
                    <p className="mt-4 text-sm leading-6 text-slate-600">{member.notes}</p>
                  ) : null}

                  <div className="mt-5 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(member)}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(member._id)}
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
                No staff members found for the current filters.
              </div>
            )}
          </div>
        </section>

        <aside className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                {editingId ? 'Edit staff profile' : 'Select a staff member'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {editingId ? 'Update live staff metadata from here.' : 'Choose a card to edit team details.'}
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

          {editingId ? (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <Field label="Full name">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  required
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  required
                />
              </Field>

              <Field label="Phone">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  required
                />
              </Field>

              <Field label="Department">
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  required
                />
              </Field>

              <Field label="Role">
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  required
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <Field label="Status">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  >
                    <option value="active">Active</option>
                    <option value="on-leave">On leave</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </Field>

                <Field label="Joined date">
                  <input
                    type="date"
                    name="joinedAt"
                    value={formData.joinedAt}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                    required
                  />
                </Field>
              </div>

              <Field label="Notes">
                <textarea
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                />
              </Field>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <LuSave className="h-4 w-4" />
                {isSaving ? 'Saving changes...' : 'Update staff member'}
              </button>
            </form>
          ) : (
            <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Select any staff card to open the live edit form.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function getStatusClasses(status: StaffMemberStatus) {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-700';
    case 'on-leave':
      return 'bg-amber-100 text-amber-700';
    case 'inactive':
    default:
      return 'bg-slate-200 text-slate-700';
  }
}

function toLabel(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
