'use client';

import { startTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ComponentType, ReactNode } from 'react';
import {
  LuBriefcaseMedical,
  LuBuilding2,
  LuClock3,
  LuIndianRupee,
  LuKeyRound,
  LuMail,
  LuPhone,
  LuSave,
  LuStethoscope,
  LuUser,
  LuUserPlus,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { apiRequest, describeError, type DoctorRecord } from '@/lib/api-client';
import { useSession } from '@/hooks/use-session';

const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Surgery', 'Radiology'];

export default function AddDoctorPage() {
  const router = useRouter();
  const session = useSession();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'Doctor@12345',
    department: '',
    specialization: '',
    yearsOfExperience: '',
    consultationFee: '',
    bio: '',
    availability: '',
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
      await apiRequest<DoctorRecord>(
        '/doctors',
        {
          method: 'POST',
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim() || undefined,
            password: formData.password,
            department: formData.department,
            specialization: formData.specialization.trim(),
            yearsOfExperience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : 0,
            consultationFee: formData.consultationFee ? Number(formData.consultationFee) : 0,
            bio: formData.bio.trim() || undefined,
            availability: formData.availability
              .split(',')
              .map((slot) => slot.trim())
              .filter(Boolean),
          }),
        },
        session
      );

      startTransition(() => {
        router.push('/doctor/list');
      });
    } catch (submissionError) {
      setError(describeError(submissionError, 'Unable to save this doctor right now.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Doctor records now save directly in MongoDB. Sign in again through the admin portal so this page can send authenticated API requests."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <LuUserPlus className="h-8 w-8 text-indigo-700" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Doctor</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a doctor account, profile, and availability block in one step.
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
              placeholder="Dr. John Doe"
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
              placeholder="john.doe@example.com"
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

          <Field label="Department" icon={LuBuilding2}>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full appearance-none rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Department</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Specialization" icon={LuStethoscope}>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Interventional Cardiologist"
            />
          </Field>

          <Field label="Years of Experience" icon={LuClock3}>
            <input
              type="number"
              name="yearsOfExperience"
              min={0}
              value={formData.yearsOfExperience}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="8"
            />
          </Field>

          <Field label="Consultation Fee" icon={LuIndianRupee}>
            <input
              type="number"
              name="consultationFee"
              min={0}
              value={formData.consultationFee}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="1200"
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Availability Slots" icon={LuBriefcaseMedical}>
              <input
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Mon 10am-2pm, Wed 4pm-8pm"
              />
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field label="Doctor Bio" icon={LuStethoscope}>
              <textarea
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Brief profile, consultation style, and procedures handled."
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
            {isSaving ? 'Saving Doctor...' : 'Save Doctor'}
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
