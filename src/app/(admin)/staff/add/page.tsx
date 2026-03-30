'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuBuilding2, LuCalendarDays, LuMail, LuPhone, LuSave, LuStickyNote, LuUserRound } from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { useSession } from '@/hooks/use-session';
import { apiRequest, describeError, type DepartmentRecord, type StaffMemberStatus } from '@/lib/api-client';
import { getTodayInputValue, toIsoDateValue } from '@/lib/date-inputs';

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
  joinedAt: getTodayInputValue(),
  notes: '',
};

export default function AddStaffPage() {
  const session = useSession();
  const router = useRouter();
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
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

    const loadDepartments = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await apiRequest<DepartmentRecord[]>('/departments', {}, session);

        if (isActive) {
          setDepartments(response);
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

    void loadDepartments();

    return () => {
      isActive = false;
    };
  }, [session]);

  const departmentSuggestions = useMemo(
    () => departments.map((department) => department.name).sort((left, right) => left.localeCompare(right)),
    [departments],
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.token) {
      setError('Your admin session is missing its backend token. Sign in again from the admin login page.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await apiRequest(
        '/staff-members',
        {
          method: 'POST',
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

      router.push('/staff/list');
      router.refresh();
    } catch (submissionError) {
      setError(describeError(submissionError, 'Unable to save this staff profile right now.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Staff now saves to MongoDB. Sign in again through the admin portal to add team members."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
            <LuUserRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Add Staff Member</h1>
            <p className="mt-1 text-sm text-slate-500">
              Create a live staff profile for reception, nursing, pharmacy, finance, or support teams.
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full name" icon={LuUserRound}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Aarav Sharma"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
            </Field>

            <Field label="Email" icon={LuMail}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="aarav@hospi.com"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
            </Field>

            <Field label="Phone" icon={LuPhone}>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
            </Field>

            <Field label="Department" icon={LuBuilding2}>
              <input
                type="text"
                name="department"
                list="staff-departments"
                value={formData.department}
                onChange={handleChange}
                placeholder={isLoading ? 'Loading departments...' : 'Front Desk'}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
              <datalist id="staff-departments">
                {departmentSuggestions.map((department) => (
                  <option key={department} value={department} />
                ))}
              </datalist>
            </Field>

            <Field label="Role">
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Receptionist"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
            </Field>

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

            <Field label="Joined date" icon={LuCalendarDays}>
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

          <div className="mt-4">
            <Field label="Notes" icon={LuStickyNote}>
              <textarea
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Shift timing, certifications, or onboarding notes"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <LuSave className="h-4 w-4" />
            {isSaving ? 'Saving staff member...' : 'Save staff member'}
          </button>
        </form>

        <aside className="space-y-4">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">What gets created</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>A unique staff ID is generated automatically.</li>
              <li>The profile appears instantly in the live staff roster.</li>
              <li>Payroll can link directly to this staff member later.</li>
            </ul>
          </section>

          <section className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-950">Department tips</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              If a department is not listed yet, type it manually here first. You can formalize it later in the
              department manager.
            </p>
          </section>
        </aside>
      </section>
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
