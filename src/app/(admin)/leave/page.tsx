'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LuCalendarDays,
  LuFileText,
  LuMail,
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
  formatDate,
  type LeaveRequestRecord,
  type LeaveRequestStatus,
} from '@/lib/api-client';
import { calculateDaySpan, getTodayInputValue, toIsoDateValue } from '@/lib/date-inputs';

type LeaveFormState = {
  name: string;
  email: string;
  department: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
};

const initialForm: LeaveFormState = {
  name: '',
  email: '',
  department: '',
  leaveType: '',
  fromDate: getTodayInputValue(),
  toDate: getTodayInputValue(),
  reason: '',
};

export default function LeavePage() {
  const session = useSession();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestRecord[]>([]);
  const [formData, setFormData] = useState<LeaveFormState>(initialForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LeaveRequestStatus>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.token) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadLeaveRequests = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await apiRequest<LeaveRequestRecord[]>('/leave-requests', {}, session);

        if (isActive) {
          setLeaveRequests(response);
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load leave requests right now.'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadLeaveRequests();

    return () => {
      isActive = false;
    };
  }, [session]);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return leaveRequests.filter((request) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        request.name.toLowerCase().includes(normalizedSearch) ||
        request.email.toLowerCase().includes(normalizedSearch) ||
        request.department.toLowerCase().includes(normalizedSearch) ||
        request.leaveType.toLowerCase().includes(normalizedSearch);

      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leaveRequests, searchTerm, statusFilter]);

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
      const createdRequest = await apiRequest<LeaveRequestRecord>(
        '/leave-requests',
        {
          method: 'POST',
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            department: formData.department.trim(),
            leaveType: formData.leaveType.trim(),
            fromDate: toIsoDateValue(formData.fromDate),
            toDate: toIsoDateValue(formData.toDate),
            reason: formData.reason.trim(),
          }),
        },
        session,
      );

      setLeaveRequests((current) => [createdRequest, ...current]);
      setFormData(initialForm);
    } catch (submissionError) {
      setError(describeError(submissionError, 'Unable to save this leave request right now.'));
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatus = async (leaveRequestId: string, status: LeaveRequestStatus) => {
    if (!session?.token) {
      return;
    }

    try {
      const updatedRequest = await apiRequest<LeaveRequestRecord>(
        `/leave-requests/${leaveRequestId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        },
        session,
      );

      setLeaveRequests((current) =>
        current.map((request) => (request._id === leaveRequestId ? updatedRequest : request)),
      );
    } catch (updateError) {
      setError(describeError(updateError, 'Unable to update this leave request right now.'));
    }
  };

  const handleDelete = async (leaveRequestId: string) => {
    if (!session?.token) {
      return;
    }

    const confirmed = window.confirm('Delete this leave request?');

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest<null>(
        `/leave-requests/${leaveRequestId}`,
        {
          method: 'DELETE',
        },
        session,
      );

      setLeaveRequests((current) => current.filter((request) => request._id !== leaveRequestId));
    } catch (deleteError) {
      setError(describeError(deleteError, 'Unable to delete this leave request right now.'));
    }
  };

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Leave requests now load from MongoDB. Sign in again through the admin portal to manage the live leave queue."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
            <LuCalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Leave Requests</h1>
            <p className="mt-1 text-sm text-slate-500">
              Submit, review, and approve team leave requests from one admin workspace.
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
          <h2 className="text-xl font-semibold text-slate-950">New leave request</h2>
          <p className="mt-1 text-sm text-slate-500">Create a leave entry on behalf of a staff member or doctor.</p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <Field label="Full name" icon={LuUserRound}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="Dr. Priya Gupta"
                required
              />
            </Field>

            <Field label="Email" icon={LuMail}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="priya@hospi.com"
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
                placeholder="Cardiology"
                required
              />
            </Field>

            <Field label="Leave type">
              <input
                type="text"
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="Casual Leave, Sick Leave"
                required
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <Field label="From date" icon={LuCalendarDays}>
                <input
                  type="date"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  required
                />
              </Field>

              <Field label="To date" icon={LuCalendarDays}>
                <input
                  type="date"
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  required
                />
              </Field>
            </div>

            <Field label="Reason" icon={LuFileText}>
              <textarea
                name="reason"
                rows={4}
                value={formData.reason}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="Brief reason for leave"
                required
              />
            </Field>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LuSave className="h-4 w-4" />
              {isSaving ? 'Saving request...' : 'Save request'}
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <LuSearch className="h-4 w-4 text-slate-400" />
                  Search leave requests
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  placeholder="Name, email, department, leave type"
                />
              </label>

              <label className="block">
                <span className="mb-2 text-sm font-medium text-slate-700">Status filter</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as 'all' | LeaveRequestStatus)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
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
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Department</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Dates</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Days</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                        Loading leave requests...
                      </td>
                    </tr>
                  ) : filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                      <tr key={request._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{request.name}</p>
                          <p className="text-xs text-slate-500">{request.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{request.department}</p>
                          <p className="text-xs text-slate-500">{request.leaveType}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {formatDate(request.fromDate)} to {formatDate(request.toDate)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {calculateDaySpan(request.fromDate, request.toDate)} days
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(request.status)}`}>
                            {toLabel(request.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => void updateStatus(request._id, 'approved')}
                              className="rounded-full border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => void updateStatus(request._id, 'rejected')}
                              className="rounded-full border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(request._id)}
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
                        No leave requests found for the current filters.
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

function getStatusClasses(status: LeaveRequestStatus) {
  switch (status) {
    case 'approved':
      return 'bg-emerald-100 text-emerald-700';
    case 'rejected':
      return 'bg-rose-100 text-rose-700';
    case 'pending':
    default:
      return 'bg-amber-100 text-amber-700';
  }
}

function toLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
