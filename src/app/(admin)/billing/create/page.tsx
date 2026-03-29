'use client';

import { startTransition, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ComponentType, ReactNode } from 'react';
import {
  LuArrowRight,
  LuCalendarDays,
  LuFilePlus2,
  LuMail,
  LuMinus,
  LuNotebookText,
  LuPlus,
  LuReceiptText,
  LuSave,
  LuUserRound,
  LuWallet,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { useSession } from '@/hooks/use-session';
import {
  apiRequest,
  describeError,
  formatCurrency,
  formatRecordId,
  type DoctorRecord,
  type InvoiceLineItem,
  type InvoicePaystubType,
  type InvoiceRecord,
  type InvoiceRecipientType,
  type InvoiceStatus,
  type PatientRecord,
} from '@/lib/api-client';
import { getTodayInputValue, toIsoDateValue } from '@/lib/date-inputs';

type DraftLineItem = InvoiceLineItem & {
  id: string;
};

const patientStatuses: InvoiceStatus[] = ['draft', 'pending', 'paid', 'cancelled'];
const staffStatuses: InvoiceStatus[] = ['draft', 'pending', 'paid', 'cancelled'];
const paystubOptions: InvoicePaystubType[] = ['salary', 'expense', 'bonus'];

export default function CreateInvoicePage() {
  const router = useRouter();
  const session = useSession();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [invoiceFor, setInvoiceFor] = useState<InvoiceRecipientType>('patient');
  const [recipientId, setRecipientId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [issueDate, setIssueDate] = useState(getTodayInputValue());
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [status, setStatus] = useState<InvoiceStatus>('pending');
  const [paystubType, setPaystubType] = useState<InvoicePaystubType>('patient-bill');
  const [discount, setDiscount] = useState('0');
  const [taxRate, setTaxRate] = useState('0');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<DraftLineItem[]>([
    {
      id: 'line-1',
      description: 'Consultation fee',
      quantity: 1,
      price: 500,
    },
  ]);
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
        const [patientsResponse, doctorsResponse] = await Promise.all([
          apiRequest<PatientRecord[]>('/patients', {}, session),
          apiRequest<DoctorRecord[]>('/doctors', {}, session),
        ]);

        if (isActive) {
          setPatients(patientsResponse);
          setDoctors(doctorsResponse);
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load billing options right now.'));
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

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient._id === recipientId) ?? null,
    [patients, recipientId],
  );
  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor._id === recipientId) ?? null,
    [doctors, recipientId],
  );

  useEffect(() => {
    if (invoiceFor === 'patient') {
      setPaystubType('patient-bill');
      setStatus((current) => (current === 'paid' ? current : 'pending'));
    } else {
      setPaystubType((current) => (current === 'patient-bill' ? 'salary' : current));
    }

    setRecipientId('');
    setRecipientName('');
    setRecipientEmail('');
    setPeriodStart('');
    setPeriodEnd('');
  }, [invoiceFor]);

  useEffect(() => {
    if (invoiceFor === 'patient' && selectedPatient) {
      setRecipientName(selectedPatient.user.name);
      setRecipientEmail(selectedPatient.user.email);
    }

    if (invoiceFor === 'doctor' && selectedDoctor) {
      setRecipientName(selectedDoctor.user.name);
      setRecipientEmail(selectedDoctor.user.email);
    }
  }, [invoiceFor, selectedDoctor, selectedPatient]);

  const totals = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const numericDiscount = Number(discount) || 0;
    const numericTaxRate = Number(taxRate) || 0;
    const discountedSubtotal = Math.max(subtotal - numericDiscount, 0);
    const taxAmount = discountedSubtotal * (numericTaxRate / 100);

    return {
      subtotal,
      discount: numericDiscount,
      taxRate: numericTaxRate,
      taxAmount,
      totalAmount: discountedSubtotal + taxAmount,
    };
  }, [discount, lineItems, taxRate]);

  const missingSelection =
    invoiceFor === 'patient'
      ? patients.length === 0
      : invoiceFor === 'doctor'
        ? doctors.length === 0
        : false;

  const handleLineItemChange = (
    lineId: string,
    field: keyof InvoiceLineItem,
    value: string,
  ) => {
    setLineItems((current) =>
      current.map((item) =>
        item.id === lineId
          ? {
              ...item,
              [field]: field === 'description' ? value : Number(value) || 0,
            }
          : item,
      ),
    );
  };

  const addLineItem = () => {
    setLineItems((current) => [
      ...current,
      {
        id: `line-${Date.now()}`,
        description: '',
        quantity: 1,
        price: 0,
      },
    ]);
  };

  const removeLineItem = (lineId: string) => {
    setLineItems((current) => (current.length === 1 ? current : current.filter((item) => item.id !== lineId)));
  };

  const handleRecipientSelection = (value: string) => {
    setRecipientId(value);

    if (invoiceFor === 'staff') {
      return;
    }

    if (!value) {
      setRecipientName('');
      setRecipientEmail('');
    }
  };

  const saveInvoice = async (nextStatus: InvoiceStatus) => {
    if (!session?.token) {
      setError('Your admin session is missing its backend token. Sign in again from the admin login page.');
      return;
    }

    if (!issueDate) {
      setError('Choose an invoice date before saving.');
      return;
    }

    const normalizedLineItems = lineItems
      .map((item) => ({
        description: item.description.trim(),
        quantity: Number(item.quantity),
        price: Number(item.price),
      }))
      .filter((item) => item.description.length > 0 && item.quantity > 0);

    if (normalizedLineItems.length === 0) {
      setError('Add at least one valid line item before saving.');
      return;
    }

    if ((invoiceFor === 'patient' || invoiceFor === 'doctor') && !recipientId) {
      setError(`Select a ${invoiceFor} before saving this invoice.`);
      return;
    }

    if (!recipientName.trim()) {
      setError('Recipient name is required.');
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      await apiRequest<InvoiceRecord>(
        '/invoices',
        {
          method: 'POST',
          body: JSON.stringify({
            recipientType: invoiceFor,
            recipientName: recipientName.trim(),
            recipientEmail: recipientEmail.trim() || undefined,
            patientId: invoiceFor === 'patient' ? recipientId : undefined,
            doctorId: invoiceFor === 'doctor' ? recipientId : undefined,
            paystubType: invoiceFor === 'patient' ? 'patient-bill' : paystubType,
            issueDate: toIsoDateValue(issueDate),
            periodStart: periodStart ? toIsoDateValue(periodStart) : undefined,
            periodEnd: periodEnd ? toIsoDateValue(periodEnd) : undefined,
            lineItems: normalizedLineItems,
            taxRate: totals.taxRate,
            discount: totals.discount,
            status: nextStatus,
            notes: notes.trim() || undefined,
          }),
        },
        session,
      );

      startTransition(() => {
        router.push('/billing/all-invoices');
      });
    } catch (submissionError) {
      setError(describeError(submissionError, 'Unable to save this invoice right now.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await saveInvoice(status);
  };

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Billing now saves invoices directly in MongoDB. Sign in again through the admin portal so this page can send authenticated API requests."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
              <LuFilePlus2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">Create Invoice</h1>
              <p className="mt-1 text-sm text-slate-500">
                Generate patient bills and paystubs using live records from the backend.
              </p>
            </div>
          </div>

          <Link
            href="/billing/all-invoices"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <LuReceiptText className="h-4 w-4" />
            View all invoices
          </Link>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <LuWallet className="h-5 w-5 text-cyan-600" />
              <h2 className="text-xl font-semibold text-slate-950">Invoice type</h2>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                { value: 'patient', label: 'Patient Bill', copy: 'Consultations, tests, and treatment charges.' },
                { value: 'doctor', label: 'Doctor Paystub', copy: 'Salary, incentives, or reimbursements.' },
                { value: 'staff', label: 'Staff Paystub', copy: 'Back-office or operations payout slips.' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setInvoiceFor(option.value as InvoiceRecipientType)}
                  className={`rounded-[1.5rem] border p-4 text-left transition ${
                    invoiceFor === option.value
                      ? 'border-cyan-300 bg-cyan-50 shadow-sm'
                      : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <p className="font-semibold text-slate-900">{option.label}</p>
                  <p className="mt-2 text-sm text-slate-500">{option.copy}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <LuUserRound className="h-5 w-5 text-cyan-600" />
              <h2 className="text-xl font-semibold text-slate-950">Recipient details</h2>
            </div>

            {missingSelection ? (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                {invoiceFor === 'patient'
                  ? 'Add at least one patient before creating a patient bill.'
                  : 'Add at least one doctor before creating a doctor paystub.'}
              </div>
            ) : null}

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {invoiceFor === 'staff' ? (
                <>
                  <Field label="Staff member or recipient" icon={LuUserRound}>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(event) => setRecipientName(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                      placeholder="Rohan Verma"
                      required
                    />
                  </Field>

                  <Field label="Email address" icon={LuMail}>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(event) => setRecipientEmail(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                      placeholder="rohan@hospi.com"
                    />
                  </Field>
                </>
              ) : (
                <>
                  <Field label={invoiceFor === 'patient' ? 'Patient' : 'Doctor'} icon={LuUserRound}>
                    <select
                      value={recipientId}
                      onChange={(event) => handleRecipientSelection(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                      disabled={isLoadingOptions || missingSelection}
                      required
                    >
                      <option value="">
                        {isLoadingOptions
                          ? `Loading ${invoiceFor}s...`
                          : `Select ${invoiceFor}`}
                      </option>
                      {(invoiceFor === 'patient' ? patients : doctors).map((record) => (
                        <option key={record._id} value={record._id}>
                          {record.user.name} ({formatRecordId(invoiceFor === 'patient' ? 'PAT' : 'DOC', record._id)})
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Email address" icon={LuMail}>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(event) => setRecipientEmail(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400"
                      placeholder="Auto-filled from saved record"
                    />
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="Recipient name" icon={LuUserRound}>
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(event) => setRecipientName(event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400"
                        placeholder="Auto-filled from saved record"
                        required
                      />
                    </Field>
                  </div>
                </>
              )}

              <Field label="Issue date" icon={LuCalendarDays}>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(event) => setIssueDate(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  required
                />
              </Field>

              <Field label="Status" icon={LuNotebookText}>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as InvoiceStatus)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                >
                  {(invoiceFor === 'patient' ? patientStatuses : staffStatuses).map((option) => (
                    <option key={option} value={option}>
                      {toLabel(option)}
                    </option>
                  ))}
                </select>
              </Field>

              {invoiceFor !== 'patient' ? (
                <>
                  <Field label="Paystub type" icon={LuReceiptText}>
                    <select
                      value={paystubType}
                      onChange={(event) => setPaystubType(event.target.value as InvoicePaystubType)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                    >
                      {paystubOptions.map((option) => (
                        <option key={option} value={option}>
                          {toLabel(option)}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Period start" icon={LuCalendarDays}>
                    <input
                      type="date"
                      value={periodStart}
                      onChange={(event) => setPeriodStart(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                    />
                  </Field>

                  <Field label="Period end" icon={LuCalendarDays}>
                    <input
                      type="date"
                      value={periodEnd}
                      onChange={(event) => setPeriodEnd(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                    />
                  </Field>
                </>
              ) : null}

              <div className="md:col-span-2">
                <Field label="Internal notes" icon={LuNotebookText}>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                    placeholder="Add invoice notes, payment remarks, or payout context"
                  />
                </Field>
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <LuReceiptText className="h-5 w-5 text-cyan-600" />
                <h2 className="text-xl font-semibold text-slate-950">Line items</h2>
              </div>
              <button
                type="button"
                onClick={addLineItem}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <LuPlus className="h-4 w-4" />
                Add line
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {lineItems.map((item, index) => (
                <div key={item.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-700">Item {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeLineItem(item.id)}
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      <LuMinus className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_120px_160px]">
                    <Field label="Description">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(event) => handleLineItemChange(item.id, 'description', event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                        placeholder="MRI scan, consultation, reimbursement"
                        required
                      />
                    </Field>

                    <Field label="Quantity">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(event) => handleLineItemChange(item.id, 'quantity', event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                        required
                      />
                    </Field>

                    <Field label="Unit amount">
                      <input
                        type="number"
                        min={0}
                        value={item.price}
                        onChange={(event) => handleLineItemChange(item.id, 'price', event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                        required
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <LuWallet className="h-5 w-5 text-cyan-600" />
              <h2 className="text-xl font-semibold text-slate-950">Summary</h2>
            </div>

            <div className="mt-5 space-y-4">
              <StatRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
              <div className="grid gap-4">
                <Field label="Discount">
                  <input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={(event) => setDiscount(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  />
                </Field>
                <Field label="Tax rate (%)">
                  <input
                    type="number"
                    min={0}
                    value={taxRate}
                    onChange={(event) => setTaxRate(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  />
                </Field>
              </div>
              <StatRow label="Tax amount" value={formatCurrency(totals.taxAmount)} />
              <div className="border-t border-dashed border-slate-200 pt-4">
                <StatRow label="Grand total" value={formatCurrency(totals.totalAmount)} strong />
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">Save invoice</p>
            <p className="mt-2 text-sm text-slate-500">
              Draft keeps the invoice editable. Final save uses the selected status and shows it in the billing list.
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => void saveInvoice('draft')}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <LuNotebookText className="h-4 w-4" />
                Save as draft
              </button>
              <button
                type="submit"
                disabled={isSaving || (missingSelection && invoiceFor !== 'staff')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <LuSave className="h-4 w-4" />
                {isSaving ? 'Saving invoice...' : 'Save invoice'}
              </button>
              <Link
                href="/billing/all-invoices"
                className="inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-cyan-700 transition hover:text-cyan-900"
              >
                Review saved invoices
                <LuArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </aside>
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
  icon?: ComponentType<{ className?: string }>;
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

function StatRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`text-sm ${strong ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>{label}</span>
      <span className={strong ? 'text-lg font-semibold text-slate-950' : 'font-medium text-slate-700'}>{value}</span>
    </div>
  );
}

function toLabel(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
