'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LuBadgeIndianRupee,
  LuCalendarDays,
  LuCheckCheck,
  LuCreditCard,
  LuReceiptText,
  LuSave,
  LuSearch,
  LuTrash2,
  LuUserRound,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { useSession } from '@/hooks/use-session';
import {
  apiRequest,
  describeError,
  formatCurrency,
  formatDate,
  type InvoiceRecord,
  type PatientRecord,
  type PaymentMethod,
  type PaymentRecord,
  type PaymentStatus,
} from '@/lib/api-client';
import { getTodayInputValue, toIsoDateValue } from '@/lib/date-inputs';

type PaymentFormState = {
  payerName: string;
  payerEmail: string;
  patientId: string;
  invoiceId: string;
  amount: string;
  paymentDate: string;
  method: PaymentMethod;
  status: PaymentStatus;
  notes: string;
};

const initialForm: PaymentFormState = {
  payerName: '',
  payerEmail: '',
  patientId: '',
  invoiceId: '',
  amount: '',
  paymentDate: getTodayInputValue(),
  method: 'upi',
  status: 'success',
  notes: '',
};

export default function PaymentsPage() {
  const session = useSession();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [formData, setFormData] = useState<PaymentFormState>(initialForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
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
        const [paymentsResponse, patientsResponse, invoicesResponse] = await Promise.all([
          apiRequest<PaymentRecord[]>('/payments', {}, session),
          apiRequest<PatientRecord[]>('/patients', {}, session),
          apiRequest<InvoiceRecord[]>('/invoices', {}, session),
        ]);

        if (isActive) {
          setPayments(paymentsResponse);
          setPatients(patientsResponse);
          setInvoices(invoicesResponse);
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load payments right now.'));
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

  const filteredPayments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        payment.payerName.toLowerCase().includes(normalizedSearch) ||
        payment.paymentNumber.toLowerCase().includes(normalizedSearch) ||
        payment.patient?.user.name.toLowerCase().includes(normalizedSearch) ||
        payment.invoice?.invoiceNumber.toLowerCase().includes(normalizedSearch);

      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchTerm, statusFilter]);

  const totals = useMemo(() => {
    return filteredPayments.reduce(
      (summary, payment) => {
        summary.total += payment.amount;

        if (payment.status === 'success') {
          summary.success += payment.amount;
        }

        if (payment.status === 'pending') {
          summary.pending += payment.amount;
        }

        return summary;
      },
      { total: 0, success: 0, pending: 0 },
    );
  }, [filteredPayments]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    if (name === 'patientId') {
      const selectedPatient = patients.find((patient) => patient._id === value);

      setFormData((current) => ({
        ...current,
        patientId: value,
        payerName: selectedPatient?.user.name ?? current.payerName,
        payerEmail: selectedPatient?.user.email ?? current.payerEmail,
      }));
      return;
    }

    if (name === 'invoiceId') {
      const selectedInvoice = invoices.find((invoice) => invoice._id === value);

      setFormData((current) => ({
        ...current,
        invoiceId: value,
        amount: selectedInvoice ? String(selectedInvoice.totalAmount) : current.amount,
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
      const createdPayment = await apiRequest<PaymentRecord>(
        '/payments',
        {
          method: 'POST',
          body: JSON.stringify({
            payerName: formData.payerName.trim(),
            payerEmail: formData.payerEmail.trim().toLowerCase() || undefined,
            patientId: formData.patientId || undefined,
            invoiceId: formData.invoiceId || undefined,
            amount: Number(formData.amount),
            paymentDate: toIsoDateValue(formData.paymentDate),
            method: formData.method,
            status: formData.status,
            notes: formData.notes.trim() || undefined,
          }),
        },
        session,
      );

      setPayments((current) => [createdPayment, ...current]);
      setFormData(initialForm);
    } catch (submissionError) {
      setError(describeError(submissionError, 'Unable to save this payment right now.'));
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatus = async (paymentId: string, status: PaymentStatus) => {
    if (!session?.token) {
      return;
    }

    try {
      const updatedPayment = await apiRequest<PaymentRecord>(
        `/payments/${paymentId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        },
        session,
      );

      setPayments((current) => current.map((payment) => (payment._id === paymentId ? updatedPayment : payment)));
    } catch (updateError) {
      setError(describeError(updateError, 'Unable to update payment status right now.'));
    }
  };

  const handleDelete = async (paymentId: string) => {
    if (!session?.token) {
      return;
    }

    const confirmed = window.confirm('Delete this payment record?');

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest<null>(
        `/payments/${paymentId}`,
        {
          method: 'DELETE',
        },
        session,
      );

      setPayments((current) => current.filter((payment) => payment._id !== paymentId));
    } catch (deleteError) {
      setError(describeError(deleteError, 'Unable to delete this payment right now.'));
    }
  };

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Payments now load from MongoDB. Sign in again through the admin portal to manage the live payment desk."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
            <LuCreditCard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Payments Desk</h1>
            <p className="mt-1 text-sm text-slate-500">
              Track patient collections, invoice settlements, and payment status without dummy transactions.
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
          <h2 className="text-xl font-semibold text-slate-950">Record payment</h2>
          <p className="mt-1 text-sm text-slate-500">Log a new hospital payment against a patient or invoice.</p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <Field label="Patient" icon={LuUserRound}>
              <select
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              >
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.user.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Invoice" icon={LuReceiptText}>
              <select
                name="invoiceId"
                value={formData.invoiceId}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              >
                <option value="">Optional invoice link</option>
                {invoices.map((invoice) => (
                  <option key={invoice._id} value={invoice._id}>
                    {invoice.invoiceNumber} · {invoice.recipientName}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Payer name">
              <input
                type="text"
                name="payerName"
                value={formData.payerName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="Aarav Sharma"
                required
              />
            </Field>

            <Field label="Payer email">
              <input
                type="email"
                name="payerEmail"
                value={formData.payerEmail}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="aarav@hospi.com"
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <Field label="Amount" icon={LuBadgeIndianRupee}>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  placeholder="5000"
                  required
                />
              </Field>

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
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <Field label="Method">
                <select
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="credit-card">Credit card</option>
                  <option value="debit-card">Debit card</option>
                  <option value="net-banking">Net banking</option>
                </select>
              </Field>

              <Field label="Status">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                >
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
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
                placeholder="Desk note, settlement reference, or remark"
              />
            </Field>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LuSave className="h-4 w-4" />
              {isSaving ? 'Saving payment...' : 'Save payment'}
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard label="Visible transactions" value={String(filteredPayments.length)} />
            <SummaryCard label="Collected" value={formatCurrency(totals.success)} />
            <SummaryCard label="Pending" value={formatCurrency(totals.pending)} />
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <LuSearch className="h-4 w-4 text-slate-400" />
                  Search payments
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Payer, payment ID, patient, invoice"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 text-sm font-medium text-slate-700">Status filter</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as 'all' | PaymentStatus)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                >
                  <option value="all">All statuses</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </label>
            </div>
          </div>

          <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Transaction</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Linked records</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Amount</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Method</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                        Loading payments...
                      </td>
                    </tr>
                  ) : filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => (
                      <tr key={payment._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{payment.paymentNumber}</p>
                          <p className="text-xs text-slate-500">
                            {payment.payerName} · {formatDate(payment.paymentDate)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          <p>{payment.patient?.user.name || 'No patient linked'}</p>
                          <p className="text-xs text-slate-500">{payment.invoice?.invoiceNumber || 'No invoice linked'}</p>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">{formatCurrency(payment.amount)}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{toLabel(payment.method)}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(payment.status)}`}>
                            {toLabel(payment.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {payment.status !== 'success' ? (
                              <button
                                type="button"
                                onClick={() => void updateStatus(payment._id, 'success')}
                                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                              >
                                <LuCheckCheck className="h-3.5 w-3.5" />
                                Mark success
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => void handleDelete(payment._id)}
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
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                        No payments found for the current filters.
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

function getStatusClasses(status: PaymentStatus) {
  switch (status) {
    case 'success':
      return 'bg-emerald-100 text-emerald-700';
    case 'pending':
      return 'bg-amber-100 text-amber-700';
    case 'failed':
      return 'bg-rose-100 text-rose-700';
    case 'refunded':
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
