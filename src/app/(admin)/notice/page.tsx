'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LuBellRing,
  LuPin,
  LuPinOff,
  LuSave,
  LuSearch,
  LuTrash2,
  LuX,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { useSession } from '@/hooks/use-session';
import {
  apiRequest,
  describeError,
  formatDate,
  type NoticeAudience,
  type NoticeCategory,
  type NoticeRecord,
} from '@/lib/api-client';

type NoticeFormState = {
  title: string;
  content: string;
  category: NoticeCategory;
  author: string;
  audience: NoticeAudience;
  isPinned: boolean;
};

const initialForm: NoticeFormState = {
  title: '',
  content: '',
  category: 'general',
  author: 'Admin',
  audience: 'all-staff',
  isPinned: false,
};

const categoryStyles: Record<NoticeCategory, string> = {
  urgent: 'bg-rose-100 text-rose-700',
  hr: 'bg-sky-100 text-sky-700',
  clinical: 'bg-emerald-100 text-emerald-700',
  events: 'bg-amber-100 text-amber-700',
  general: 'bg-slate-100 text-slate-700',
};

export default function NoticePage() {
  const session = useSession();
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [formData, setFormData] = useState<NoticeFormState>(initialForm);
  const [editingId, setEditingId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | NoticeCategory>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.token) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadNotices = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await apiRequest<NoticeRecord[]>('/notices', {}, session);

        if (isActive) {
          setNotices(sortNotices(response));
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load notices right now.'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadNotices();

    return () => {
      isActive = false;
    };
  }, [session]);

  const filteredNotices = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return notices.filter((notice) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        notice.title.toLowerCase().includes(normalizedSearch) ||
        notice.content.toLowerCase().includes(normalizedSearch) ||
        notice.author.toLowerCase().includes(normalizedSearch);

      const matchesCategory = categoryFilter === 'all' || notice.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [categoryFilter, notices, searchTerm]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = event.target;
    const nextValue =
      type === 'checkbox' ? (event.target as HTMLInputElement).checked : value;

    setFormData((current) => ({
      ...current,
      [name]: nextValue,
    }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId('');
  };

  const handleEdit = (notice: NoticeRecord) => {
    setEditingId(notice._id);
    setFormData({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      author: notice.author,
      audience: notice.audience,
      isPinned: notice.isPinned,
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
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        author: formData.author.trim() || 'Admin',
        audience: formData.audience,
        isPinned: formData.isPinned,
      };

      if (editingId) {
        const updatedNotice = await apiRequest<NoticeRecord>(
          `/notices/${editingId}`,
          {
            method: 'PATCH',
            body: JSON.stringify(payload),
          },
          session,
        );

        setNotices((current) =>
          sortNotices(current.map((notice) => (notice._id === editingId ? updatedNotice : notice))),
        );
      } else {
        const createdNotice = await apiRequest<NoticeRecord>(
          '/notices',
          {
            method: 'POST',
            body: JSON.stringify(payload),
          },
          session,
        );

        setNotices((current) => sortNotices([createdNotice, ...current]));
      }

      resetForm();
    } catch (submissionError) {
      setError(describeError(submissionError, 'Unable to save this notice right now.'));
    } finally {
      setIsSaving(false);
    }
  };

  const togglePinned = async (notice: NoticeRecord) => {
    if (!session?.token) {
      return;
    }

    try {
      const updatedNotice = await apiRequest<NoticeRecord>(
        `/notices/${notice._id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            isPinned: !notice.isPinned,
          }),
        },
        session,
      );

      setNotices((current) =>
        sortNotices(
          current.map((currentNotice) =>
            currentNotice._id === notice._id ? updatedNotice : currentNotice,
          ),
        ),
      );
    } catch (toggleError) {
      setError(describeError(toggleError, 'Unable to update this notice right now.'));
    }
  };

  const handleDelete = async (noticeId: string) => {
    if (!session?.token) {
      return;
    }

    const confirmed = window.confirm('Delete this notice?');

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest<null>(
        `/notices/${noticeId}`,
        {
          method: 'DELETE',
        },
        session,
      );

      setNotices((current) => current.filter((notice) => notice._id !== noticeId));

      if (editingId === noticeId) {
        resetForm();
      }
    } catch (deleteError) {
      setError(describeError(deleteError, 'Unable to delete this notice right now.'));
    }
  };

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Notices now load from MongoDB. Sign in again through the admin portal to manage the live notice board."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
            <LuBellRing className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Notice Board</h1>
            <p className="mt-1 text-sm text-slate-500">
              Share admin updates, urgent announcements, and team-wide notices from one place.
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
                {editingId ? 'Edit notice' : 'Post notice'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Draft a notice for staff, doctors, or specific admin groups.
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
            <Field label="Title">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="New billing software rollout"
                required
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <Field label="Category">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                >
                  <option value="general">General</option>
                  <option value="urgent">Urgent</option>
                  <option value="hr">HR</option>
                  <option value="clinical">Clinical</option>
                  <option value="events">Events</option>
                </select>
              </Field>

              <Field label="Audience">
                <select
                  name="audience"
                  value={formData.audience}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                >
                  <option value="all-staff">All staff</option>
                  <option value="doctors-only">Doctors only</option>
                  <option value="nurses-only">Nurses only</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
            </div>

            <Field label="Author">
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="Admin"
              />
            </Field>

            <Field label="Message">
              <textarea
                name="content"
                rows={6}
                value={formData.content}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="Write the announcement details here"
                required
              />
            </Field>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
              <input
                type="checkbox"
                name="isPinned"
                checked={formData.isPinned}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-cyan-600"
              />
              <span className="text-sm font-medium text-slate-700">Pin this notice to the top</span>
            </label>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LuSave className="h-4 w-4" />
              {isSaving ? 'Saving notice...' : editingId ? 'Update notice' : 'Post notice'}
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <LuSearch className="h-4 w-4 text-slate-400" />
                  Search notices
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  placeholder="Title, content, or author"
                />
              </label>

              <label className="block">
                <span className="mb-2 text-sm font-medium text-slate-700">Category filter</span>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value as 'all' | NoticeCategory)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                >
                  <option value="all">All categories</option>
                  <option value="general">General</option>
                  <option value="urgent">Urgent</option>
                  <option value="hr">HR</option>
                  <option value="clinical">Clinical</option>
                  <option value="events">Events</option>
                </select>
              </label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {isLoading ? (
              <div className="rounded-[1.75rem] border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm md:col-span-2">
                Loading notices...
              </div>
            ) : filteredNotices.length > 0 ? (
              filteredNotices.map((notice) => (
                <article
                  key={notice._id}
                  className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryStyles[notice.category]}`}>
                          {toLabel(notice.category)}
                        </span>
                        {notice.isPinned ? (
                          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                            Pinned
                          </span>
                        ) : null}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-950">{notice.title}</h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => void togglePinned(notice)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {notice.isPinned ? <LuPinOff className="h-3.5 w-3.5" /> : <LuPin className="h-3.5 w-3.5" />}
                      {notice.isPinned ? 'Unpin' : 'Pin'}
                    </button>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">{notice.content}</p>

                  <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <p>Audience: {toLabel(notice.audience)}</p>
                    <p className="mt-1">By {notice.author} · {formatDate(notice.createdAt)}</p>
                  </div>

                  <div className="mt-5 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(notice)}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(notice._id)}
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
                No notices found for the current filters.
              </div>
            )}
          </div>
        </section>
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

function toLabel(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function sortNotices(notices: NoticeRecord[]) {
  return [...notices].sort((left, right) => {
    if (left.isPinned !== right.isPinned) {
      return Number(right.isPinned) - Number(left.isPinned);
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}
