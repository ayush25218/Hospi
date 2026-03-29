'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LuCalendarDays,
  LuIndianRupee,
  LuReceiptText,
  LuSave,
  LuSearch,
  LuTrash2,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { useSession } from '@/hooks/use-session';
import {
  apiRequest,
  describeError,
  formatCurrency,
  formatDate,
  type ExpenseRecord,
  type ExpenseStatus,
} from '@/lib/api-client';
import { getTodayInputValue, toIsoDateValue } from '@/lib/date-inputs';

type ExpenseFormState = {
  category: string;
  amount: string;
  description: string;
  expenseDate: string;
  status: ExpenseStatus;
};

const initialForm: ExpenseFormState = {
  category: '',
  amount: '',
  description: '',
  expenseDate: getTodayInputValue(),
  status: 'pending',
};

export default function ExpensesPage() {
  const session = useSession();
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [formData, setFormData] = useState<ExpenseFormState>(initialForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ExpenseStatus>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.token) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadExpenses = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await apiRequest<ExpenseRecord[]>('/expenses', {}, session);

        if (isActive) {
          setExpenses(response);
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load expenses right now.'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadExpenses();

    return () => {
      isActive = false;
    };
  }, [session]);

  const filteredExpenses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return expenses.filter((expense) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        expense.category.toLowerCase().includes(normalizedSearch) ||
        expense.description.toLowerCase().includes(normalizedSearch);

      const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [expenses, searchTerm, statusFilter]);

  const summary = useMemo(() => {
    return expenses.reduce(
      (accumulator, expense) => {
        accumulator.total += expense.amount;

        if (expense.status === 'approved') {
          accumulator.approved += expense.amount;
        } else {
          accumulator.pending += expense.amount;
        }

        return accumulator;
      },
      { total: 0, approved: 0, pending: 0 },
    );
  }, [expenses]);

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
      const createdExpense = await apiRequest<ExpenseRecord>(
        '/expenses',
        {
          method: 'POST',
          body: JSON.stringify({
            category: formData.category.trim(),
            amount: Number(formData.amount) || 0,
            description: formData.description.trim(),
            expenseDate: toIsoDateValue(formData.expenseDate),
            status: formData.status,
          }),
        },
        session,
      );

      setExpenses((current) => [createdExpense, ...current]);
      setFormData(initialForm);
    } catch (submissionError) {
      setError(describeError(submissionError, 'Unable to save this expense right now.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (expenseId: string) => {
    if (!session?.token) {
      return;
    }

    const confirmed = window.confirm('Delete this expense?');

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest<null>(
        `/expenses/${expenseId}`,
        {
          method: 'DELETE',
        },
        session,
      );

      setExpenses((current) => current.filter((expense) => expense._id !== expenseId));
    } catch (deleteError) {
      setError(describeError(deleteError, 'Unable to delete this expense right now.'));
    }
  };

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Expenses now load from MongoDB. Sign in again through the admin portal to manage the live expense ledger."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
            <LuReceiptText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Expenses</h1>
            <p className="mt-1 text-sm text-slate-500">
              Track operating spend with a live expense register and quick totals.
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
          <h2 className="text-xl font-semibold text-slate-950">Add expense</h2>
          <p className="mt-1 text-sm text-slate-500">Record a new operating or reimbursement expense.</p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <Field label="Category" icon={LuReceiptText}>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="Lab supplies, transport, maintenance"
                required
              />
            </Field>

            <Field label="Amount" icon={LuIndianRupee}>
              <input
                type="number"
                min={0}
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="2500"
                required
              />
            </Field>

            <Field label="Expense date" icon={LuCalendarDays}>
              <input
                type="date"
                name="expenseDate"
                value={formData.expenseDate}
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
                <option value="approved">Approved</option>
              </select>
            </Field>

            <Field label="Description">
              <textarea
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="What was purchased or reimbursed?"
                required
              />
            </Field>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LuSave className="h-4 w-4" />
              {isSaving ? 'Saving expense...' : 'Save expense'}
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard label="Total spend" value={formatCurrency(summary.total)} />
            <SummaryCard label="Approved" value={formatCurrency(summary.approved)} />
            <SummaryCard label="Pending" value={formatCurrency(summary.pending)} />
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <LuSearch className="h-4 w-4 text-slate-400" />
                  Search expenses
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  placeholder="Category or description"
                />
              </label>

              <label className="block">
                <span className="mb-2 text-sm font-medium text-slate-700">Status filter</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as 'all' | ExpenseStatus)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                </select>
              </label>
            </div>
          </div>

          <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Category</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Date</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Amount</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Description</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                        Loading expenses...
                      </td>
                    </tr>
                  ) : filteredExpenses.length > 0 ? (
                    filteredExpenses.map((expense) => (
                      <tr key={expense._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{expense.category}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{formatDate(expense.expenseDate)}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{formatCurrency(expense.amount)}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(expense.status)}`}>
                            {expense.status === 'approved' ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{expense.description}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => void handleDelete(expense._id)}
                            className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                          >
                            <LuTrash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                        No expenses found for the current filters.
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
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function getStatusClasses(status: ExpenseStatus) {
  return status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';
}
