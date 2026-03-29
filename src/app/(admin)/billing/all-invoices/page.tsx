'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  LuEye,
  LuFilePlus2,
  LuFilter,
  LuPrinter,
  LuReceiptText,
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
  type InvoiceRecord,
  type InvoiceRecipientType,
  type InvoiceStatus,
} from '@/lib/api-client';

type TypeFilter = 'all' | InvoiceRecipientType;
type StatusFilter = 'all' | InvoiceStatus;

export default function AllInvoicesPage() {
  const session = useSession();
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.token) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadInvoices = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await apiRequest<InvoiceRecord[]>('/invoices', {}, session);

        if (isActive) {
          setInvoices(response);
          setSelectedInvoiceId(response[0]?._id ?? '');
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load invoices right now.'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadInvoices();

    return () => {
      isActive = false;
    };
  }, [session]);

  const filteredInvoices = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        invoice.invoiceNumber.toLowerCase().includes(normalizedSearch) ||
        invoice.recipientName.toLowerCase().includes(normalizedSearch) ||
        invoice.recipientEmail?.toLowerCase().includes(normalizedSearch) ||
        invoice.createdBy.name.toLowerCase().includes(normalizedSearch);

      const matchesType = typeFilter === 'all' || invoice.recipientType === typeFilter;
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter, typeFilter]);

  const selectedInvoice =
    filteredInvoices.find((invoice) => invoice._id === selectedInvoiceId) ??
    filteredInvoices[0] ??
    null;

  useEffect(() => {
    if (!filteredInvoices.some((invoice) => invoice._id === selectedInvoiceId)) {
      setSelectedInvoiceId(filteredInvoices[0]?._id ?? '');
    }
  }, [filteredInvoices, selectedInvoiceId]);

  const handleDelete = async (invoiceId: string) => {
    if (!session?.token) {
      return;
    }

    const confirmed = window.confirm('Delete this invoice permanently?');

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest<null>(
        `/invoices/${invoiceId}`,
        {
          method: 'DELETE',
        },
        session,
      );

      setInvoices((current) => current.filter((invoice) => invoice._id !== invoiceId));
      setError('');
    } catch (deleteError) {
      setError(describeError(deleteError, 'Unable to delete this invoice right now.'));
    }
  };

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Invoices now load from MongoDB. Sign in again through the admin portal to view the synced billing history."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
              <LuReceiptText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">All Invoices</h1>
              <p className="mt-1 text-sm text-slate-500">
                Search, review, print, and manage every saved invoice from one place.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <LuPrinter className="h-4 w-4" />
              Print list
            </button>
            <Link
              href="/billing/create"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <LuFilePlus2 className="h-4 w-4" />
              Create invoice
            </Link>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <LuSearch className="h-4 w-4 text-slate-400" />
              Search invoices
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              placeholder="Invoice number, recipient, or creator"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <LuFilter className="h-4 w-4 text-slate-400" />
              Recipient type
            </span>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
            >
              <option value="all">All types</option>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="staff">Staff</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <LuFilter className="h-4 w-4 text-slate-400" />
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-600">Invoice</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-600">Recipient</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-600">Issue Date</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-600">Total</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                      Loading invoices...
                    </td>
                  </tr>
                ) : filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice._id}
                      className={`border-b border-slate-100 transition hover:bg-slate-50 ${
                        selectedInvoiceId === invoice._id ? 'bg-cyan-50/60' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-slate-500">{toLabel(invoice.paystubType)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{invoice.recipientName}</p>
                        <p className="text-xs text-slate-500">{toLabel(invoice.recipientType)}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{formatDate(invoice.issueDate)}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{formatCurrency(invoice.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(invoice.status)}`}>
                          {toLabel(invoice.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceId(invoice._id)}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <LuEye className="h-3.5 w-3.5" />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(invoice._id)}
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
                      No invoices found for the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          {selectedInvoice ? (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-cyan-700">{selectedInvoice.invoiceNumber}</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{selectedInvoice.recipientName}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {toLabel(selectedInvoice.recipientType)} invoice created on {formatDate(selectedInvoice.createdAt)}
                </p>
              </div>

              <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
                <DetailRow label="Issue date" value={formatDate(selectedInvoice.issueDate)} />
                <DetailRow label="Status" value={toLabel(selectedInvoice.status)} />
                <DetailRow label="Email" value={selectedInvoice.recipientEmail || 'Not added'} />
                <DetailRow label="Created by" value={selectedInvoice.createdBy.name} />
                {selectedInvoice.periodStart ? (
                  <DetailRow
                    label="Pay period"
                    value={`${formatDate(selectedInvoice.periodStart)} to ${formatDate(
                      selectedInvoice.periodEnd ?? selectedInvoice.periodStart,
                    )}`}
                  />
                ) : null}
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Items</h3>
                <div className="mt-3 space-y-3">
                  {selectedInvoice.lineItems.map((item, index) => (
                    <div key={`${selectedInvoice._id}-${index}`} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-slate-900">{item.description}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.quantity} x {formatCurrency(item.price)}
                          </p>
                        </div>
                        <p className="font-semibold text-slate-900">
                          {formatCurrency(item.quantity * item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-200 pt-4">
                <DetailRow label="Subtotal" value={formatCurrency(selectedInvoice.subtotal)} />
                <DetailRow label="Discount" value={formatCurrency(selectedInvoice.discount)} />
                <DetailRow label="Tax" value={formatCurrency(selectedInvoice.taxAmount)} />
                <DetailRow label="Grand total" value={formatCurrency(selectedInvoice.totalAmount)} strong />
              </div>

              {selectedInvoice.notes ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Notes</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{selectedInvoice.notes}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="grid min-h-[280px] place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center">
              <div>
                <p className="font-medium text-slate-700">No invoice selected</p>
                <p className="mt-2 text-sm text-slate-500">Choose a row from the table to inspect its details.</p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function DetailRow({
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
      <span className={strong ? 'text-base font-semibold text-slate-950' : 'text-sm font-medium text-slate-700'}>
        {value}
      </span>
    </div>
  );
}

function getStatusClasses(status: InvoiceStatus) {
  switch (status) {
    case 'paid':
      return 'bg-emerald-100 text-emerald-700';
    case 'draft':
      return 'bg-slate-100 text-slate-700';
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
