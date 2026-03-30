'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LuBadgeIndianRupee,
  LuCalendarDays,
  LuCheckCheck,
  LuSave,
  LuSearch,
  LuTrash2,
  LuUserRound,
  LuWallet,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { useSession } from '@/hooks/use-session';
import {
  apiRequest,
  describeError,
  formatCurrency,
  formatDate,
  type PayrollRecord,
  type PayrollStatus,
  type StaffMemberRecord,
} from '@/lib/api-client';
import { toIsoDateValue } from '@/lib/date-inputs';

function getCurrentMonthValue() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${month}`;
}

type PayrollFormState = {
  staffMemberId: string;
  employeeName: string;
  employeeId: string;
  department: string;
  designation: string;
  salary: string;
  month: string;
  paymentDate: string;
  status: PayrollStatus;
  notes: string;
};

const initialForm: PayrollFormState = {
  staffMemberId: '',
  employeeName: '',
  employeeId: '',
  department: '',
  designation: '',
  salary: '',
  month: getCurrentMonthValue(),
  paymentDate: new Date().toISOString().slice(0, 10),
  status: 'pending',
  notes: '',
};

export default function PayrollPage() {
  const session = useSession();
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMemberRecord[]>([]);
  const [formData, setFormData] = useState<PayrollFormState>(initialForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PayrollStatus>('all');
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
        const [payrollResponse, staffResponse] = await Promise.all([
          apiRequest<PayrollRecord[]>('/payroll', {}, session),
          apiRequest<StaffMemberRecord[]>('/staff-members', {}, session),
        ]);

        if (isActive) {
          setPayrolls(payrollResponse);
          setStaffMembers(staffResponse);
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load payroll records right now.'));
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

  const filteredPayrolls = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return payrolls.filter((payroll) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        payroll.employeeName.toLowerCase().includes(normalizedSearch) ||
        payroll.employeeId.toLowerCase().includes(normalizedSearch) ||
        payroll.department.toLowerCase().includes(normalizedSearch) ||
        payroll.designation.toLowerCase().includes(normalizedSearch);

      const matchesStatus = statusFilter === 'all' || payroll.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payrolls, searchTerm, statusFilter]);

  const totals = useMemo(() => {
    return filteredPayrolls.reduce(
      (summary, payroll) => {
        summary.total += payroll.salary;

        if (payroll.status === 'paid') {
          summary.paid += payroll.salary;
        }

        return summary;
      },
      { total: 0, paid: 0 },
    );
  }, [filteredPayrolls]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    if (name === 'staffMemberId') {
      const selectedStaff = staffMembers.find((member) => member._id === value);

      setFormData((current) => ({
        ...current,
        staffMemberId: value,
        employeeName: selectedStaff?.name ?? current.employeeName,
        employeeId: selectedStaff?.staffId ?? current.employeeId,
        department: selectedStaff?.department ?? current.department,
        designation: selectedStaff?.role ?? current.designation,
      }));
      return;
    }

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
      const createdPayroll = await apiRequest<PayrollRecord>(
        '/payroll',
        {
          method: 'POST',
          body: JSON.stringify({
            staffMemberId: formData.staffMemberId || undefined,
            employeeName: formData.employeeName.trim(),
            employeeId: formData.employeeId.trim(),
            department: formData.department.trim(),
            designation: formData.designation.trim(),
            salary: Number(formData.salary),
            month: formData.month,
            paymentDate: toIsoDateValue(formData.paymentDate),
            status: formData.status,
            notes: formData.notes.trim() || undefined,
          }),
        },
        session,
      );

      setPayrolls((current) => [createdPayroll, ...current]);
      setFormData(initialForm);
    } catch (submissionError) {
      setError(describeError(submissionError, 'Unable to save this payroll record right now.'));
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatus = async (payrollId: string, status: PayrollStatus) => {
    if (!session?.token) {
      return;
    }

    try {
      const updatedPayroll = await apiRequest<PayrollRecord>(
        `/payroll/${payrollId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        },
        session,
      );

      setPayrolls((current) => current.map((payroll) => (payroll._id === payrollId ? updatedPayroll : payroll)));
    } catch (updateError) {
      setError(describeError(updateError, 'Unable to update payroll status right now.'));
    }
  };

  const handleDelete = async (payrollId: string) => {
    if (!session?.token) {
      return;
    }

    const confirmed = window.confirm('Delete this payroll record?');

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest<null>(
        `/payroll/${payrollId}`,
        {
          method: 'DELETE',
        },
        session,
      );

      setPayrolls((current) => current.filter((payroll) => payroll._id !== payrollId));
    } catch (deleteError) {
      setError(describeError(deleteError, 'Unable to delete this payroll record right now.'));
    }
  };

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Payroll now loads from MongoDB. Sign in again through the admin portal to manage the live payroll queue."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
            <LuWallet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Payroll Manager</h1>
            <p className="mt-1 text-sm text-slate-500">
              Generate live salary entries from your staff roster and track pending payouts month by month.
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
          <h2 className="text-xl font-semibold text-slate-950">Create payroll entry</h2>
          <p className="mt-1 text-sm text-slate-500">Link a staff profile or enter a manual salary record.</p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <Field label="Staff member" icon={LuUserRound}>
              <select
                name="staffMemberId"
                value={formData.staffMemberId}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              >
                <option value="">Select staff member</option>
                {staffMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} · {member.staffId}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Employee name">
              <input
                type="text"
                name="employeeName"
                value={formData.employeeName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <Field label="Employee ID">
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
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
            </div>

            <Field label="Designation">
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <Field label="Salary" icon={LuBadgeIndianRupee}>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  required
                />
              </Field>

              <Field label="Month">
                <input
                  type="month"
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  required
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <Field label="Payment date" icon={LuCalendarDays}>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
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
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </Field>
            </div>

            <Field label="Notes">
              <textarea
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="Shift bonus, arrears, or payroll remarks"
              />
            </Field>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LuSave className="h-4 w-4" />
              {isSaving ? 'Saving payroll...' : 'Save payroll'}
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard label="Visible entries" value={String(filteredPayrolls.length)} />
            <SummaryCard label="Total payroll" value={formatCurrency(totals.total)} />
            <SummaryCard label="Paid out" value={formatCurrency(totals.paid)} />
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <LuSearch className="h-4 w-4 text-slate-400" />
                  Search payroll
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Employee, staff ID, department, designation"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 text-sm font-medium text-slate-700">Status filter</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as 'all' | PayrollStatus)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </label>
            </div>
          </div>

          <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Employee</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Month</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Salary</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                        Loading payroll records...
                      </td>
                    </tr>
                  ) : filteredPayrolls.length > 0 ? (
                    filteredPayrolls.map((payroll) => (
                      <tr key={payroll._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{payroll.employeeName}</p>
                          <p className="text-xs text-slate-500">
                            {payroll.employeeId} · {payroll.designation}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          <p>{formatMonth(payroll.month)}</p>
                          <p className="text-xs text-slate-500">Processed {formatDate(payroll.paymentDate)}</p>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">{formatCurrency(payroll.salary)}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(payroll.status)}`}>
                            {payroll.status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {payroll.status !== 'paid' ? (
                              <button
                                type="button"
                                onClick={() => void updateStatus(payroll._id, 'paid')}
                                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                              >
                                <LuCheckCheck className="h-3.5 w-3.5" />
                                Mark paid
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => void handleDelete(payroll._id)}
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
                        No payroll records found for the current filters.
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

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function formatMonth(value: string) {
  const [year, month] = value.split('-');

  if (!year || !month) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(Number(year), Number(month) - 1, 1));
}

function getStatusClasses(status: PayrollStatus) {
  return status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';
}
