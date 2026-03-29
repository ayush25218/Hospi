'use client';

import { startTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ComponentType, ReactNode } from 'react';
import {
  LuCalendar,
  LuDroplets,
  LuKeyRound,
  LuMail,
  LuMapPin,
  LuPhone,
  LuSave,
  LuShieldPlus,
  LuUser,
  LuUserPlus,
  LuUsers,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { apiRequest, describeError, type PatientRecord } from '@/lib/api-client';
import { useSession } from '@/hooks/use-session';

export default function AddPatientPage() {
  const router = useRouter();
  const session = useSession();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'Patient@12345',
    gender: 'male',
    dateOfBirth: '',
    bloodGroup: '',
    emergencyContact: '',
    address: '',
    medicalHistory: '',
  });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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

    setError('');
    setIsSaving(true);

    try {
      await apiRequest<PatientRecord>(
        '/patients',
        {
          method: 'POST',
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim() || undefined,
            password: formData.password,
            gender: formData.gender,
            dateOfBirth: new Date(`${formData.dateOfBirth}T00:00:00`).toISOString(),
            bloodGroup: formData.bloodGroup.trim() || undefined,
            emergencyContact: formData.emergencyContact.trim() || undefined,
            address: formData.address.trim() || undefined,
            medicalHistory: formData.medicalHistory
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
          }),
        },
        session
      );

      startTransition(() => {
        router.push('/patient/list');
      });
    } catch (submissionError) {
      setError(describeError(submissionError, 'Unable to save this patient right now.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Patient records now save directly in MongoDB. Sign in again through the admin portal so this page can send authenticated API requests."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <LuUserPlus className="h-8 w-8 text-indigo-700" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Patient</h1>
          <p className="mt-1 text-sm text-gray-500">
            Register a patient profile with contact, identity, and medical basics.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-8 shadow-md">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field label="Full Name" icon={LuUser}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Patient Full Name"
            />
          </Field>

          <Field label="Email Address" icon={LuMail}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="patient@example.com"
            />
          </Field>

          <Field label="Phone Number" icon={LuPhone}>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="+91 98765 43210"
            />
          </Field>

          <Field label="Login Password" icon={LuKeyRound}>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              required
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </Field>

          <Field label="Gender" icon={LuUsers}>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full appearance-none rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>

          <Field label="Date of Birth" icon={LuCalendar}>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </Field>

          <Field label="Blood Group" icon={LuDroplets}>
            <input
              type="text"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="B+"
            />
          </Field>

          <Field label="Emergency Contact" icon={LuShieldPlus}>
            <input
              type="text"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="+91 90000 00000"
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Address" icon={LuMapPin}>
              <textarea
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="123 Main Street, City, State"
              />
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field label="Medical History" icon={LuShieldPlus}>
              <textarea
                name="medicalHistory"
                rows={3}
                value={formData.medicalHistory}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Diabetes, Hypertension, Asthma"
              />
            </Field>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <LuSave className="h-5 w-5" />
            {isSaving ? 'Saving Patient...' : 'Save Patient'}
          </button>
        </div>
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
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-3.5 text-gray-400">
          <Icon className="h-5 w-5" />
        </span>
        {children}
      </div>
    </label>
  );
}
