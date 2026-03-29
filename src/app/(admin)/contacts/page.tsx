'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LuContact,
  LuMail,
  LuMapPin,
  LuPhone,
  LuSave,
  LuSearch,
  LuTrash2,
  LuUserRound,
  LuX,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { useSession } from '@/hooks/use-session';
import { apiRequest, describeError, getInitials, type ContactRecord, type ContactType } from '@/lib/api-client';

type ContactFormState = {
  name: string;
  contactType: ContactType;
  role: string;
  department: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};

const initialForm: ContactFormState = {
  name: '',
  contactType: 'staff',
  role: '',
  department: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
};

export default function ContactsPage() {
  const session = useSession();
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [formData, setFormData] = useState<ContactFormState>(initialForm);
  const [editingId, setEditingId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ContactType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.token) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadContacts = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await apiRequest<ContactRecord[]>('/contacts', {}, session);

        if (isActive) {
          setContacts(response);
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load contacts right now.'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadContacts();

    return () => {
      isActive = false;
    };
  }, [session]);

  const filteredContacts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return contacts.filter((contact) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        contact.name.toLowerCase().includes(normalizedSearch) ||
        contact.role.toLowerCase().includes(normalizedSearch) ||
        contact.department?.toLowerCase().includes(normalizedSearch) ||
        contact.email?.toLowerCase().includes(normalizedSearch) ||
        contact.phone?.toLowerCase().includes(normalizedSearch);

      const matchesType = typeFilter === 'all' || contact.contactType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [contacts, searchTerm, typeFilter]);

  const departments = useMemo(
    () =>
      Array.from(
        new Set(
          contacts
            .map((contact) => contact.department?.trim())
            .filter((department): department is string => Boolean(department)),
        ),
      ).sort((left, right) => left.localeCompare(right)),
    [contacts],
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

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId('');
  };

  const handleEdit = (contact: ContactRecord) => {
    setEditingId(contact._id);
    setFormData({
      name: contact.name,
      contactType: contact.contactType,
      role: contact.role,
      department: contact.department ?? '',
      phone: contact.phone ?? '',
      email: contact.email ?? '',
      address: contact.address ?? '',
      notes: contact.notes ?? '',
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
        contactType: formData.contactType,
        role: formData.role.trim(),
        department: formData.department.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim().toLowerCase() || undefined,
        address: formData.address.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };

      if (editingId) {
        const updatedContact = await apiRequest<ContactRecord>(
          `/contacts/${editingId}`,
          {
            method: 'PATCH',
            body: JSON.stringify(payload),
          },
          session,
        );

        setContacts((current) =>
          current.map((contact) => (contact._id === editingId ? updatedContact : contact)),
        );
      } else {
        const createdContact = await apiRequest<ContactRecord>(
          '/contacts',
          {
            method: 'POST',
            body: JSON.stringify(payload),
          },
          session,
        );

        setContacts((current) => [createdContact, ...current]);
      }

      resetForm();
    } catch (submissionError) {
      setError(describeError(submissionError, 'Unable to save this contact right now.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (contactId: string) => {
    if (!session?.token) {
      return;
    }

    const confirmed = window.confirm('Delete this contact?');

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest<null>(
        `/contacts/${contactId}`,
        {
          method: 'DELETE',
        },
        session,
      );

      setContacts((current) => current.filter((contact) => contact._id !== contactId));

      if (editingId === contactId) {
        resetForm();
      }
    } catch (deleteError) {
      setError(describeError(deleteError, 'Unable to delete this contact right now.'));
    }
  };

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Contacts now load from MongoDB. Sign in again through the admin portal to manage the live directory."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
            <LuContact className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Contacts Directory</h1>
            <p className="mt-1 text-sm text-slate-500">
              Maintain doctors, staff, vendors, and support contacts in one shared directory.
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
                {editingId ? 'Edit contact' : 'Add contact'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Save a team member, vendor, or support point of contact.
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

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <Field label="Contact type">
                <select
                  name="contactType"
                  value={formData.contactType}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                >
                  <option value="doctor">Doctor</option>
                  <option value="staff">Staff</option>
                  <option value="vendor">Vendor</option>
                  <option value="support">Support</option>
                </select>
              </Field>

              <Field label="Role">
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  placeholder="Receptionist, Pharmacist, Vendor"
                  required
                />
              </Field>
            </div>

            <Field label="Department">
              <input
                type="text"
                name="department"
                list="contact-departments"
                value={formData.department}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="Cardiology, Admin, Pharmacy"
              />
              <datalist id="contact-departments">
                {departments.map((department) => (
                  <option key={department} value={department} />
                ))}
              </datalist>
            </Field>

            <Field label="Phone" icon={LuPhone}>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="+91 98765 43210"
              />
            </Field>

            <Field label="Email" icon={LuMail}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="contact@hospi.com"
              />
            </Field>

            <Field label="Address" icon={LuMapPin}>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="Main lobby, second floor, or vendor location"
              />
            </Field>

            <Field label="Notes">
              <textarea
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                placeholder="Extra availability notes or escalation details"
              />
            </Field>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LuSave className="h-4 w-4" />
              {isSaving ? 'Saving contact...' : editingId ? 'Update contact' : 'Save contact'}
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <LuSearch className="h-4 w-4 text-slate-400" />
                  Search contacts
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  placeholder="Name, role, phone, email"
                />
              </label>

              <label className="block">
                <span className="mb-2 text-sm font-medium text-slate-700">Type filter</span>
                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value as 'all' | ContactType)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                >
                  <option value="all">All contact types</option>
                  <option value="doctor">Doctors</option>
                  <option value="staff">Staff</option>
                  <option value="vendor">Vendors</option>
                  <option value="support">Support</option>
                </select>
              </label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {isLoading ? (
              <div className="rounded-[1.75rem] border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm md:col-span-2">
                Loading contacts...
              </div>
            ) : filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <article
                  key={contact._id}
                  className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 font-semibold text-cyan-700">
                        {getInitials(contact.name)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950">{contact.name}</h3>
                        <p className="text-sm text-slate-500">
                          {contact.role} · {toLabel(contact.contactType)}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {contact.department || 'No department'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p>{contact.phone || 'No phone added'}</p>
                    <p>{contact.email || 'No email added'}</p>
                    <p>{contact.address || 'No address added'}</p>
                  </div>

                  {contact.notes ? (
                    <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                      {contact.notes}
                    </p>
                  ) : null}

                  <div className="mt-5 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(contact)}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(contact._id)}
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
                No contacts found for the current filters.
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

function toLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
