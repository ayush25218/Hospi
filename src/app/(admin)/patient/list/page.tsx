'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  LuCalendarDays,
  LuPrinter,
  LuSearch,
  LuUserPlus,
  LuUsers,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import {
  apiRequest,
  calculateAge,
  describeError,
  formatDate,
  formatRecordId,
  getInitials,
  type PatientRecord,
} from '@/lib/api-client';
import { useSession } from '@/hooks/use-session';

type TimeRange = 'all' | 'daily' | 'monthly' | 'quarterly' | 'yearly';

const filterButtons: { label: string; range: TimeRange }[] = [
  { label: 'All Time', range: 'all' },
  { label: 'Daily', range: 'daily' },
  { label: 'Monthly', range: 'monthly' },
  { label: 'Quarterly', range: 'quarterly' },
  { label: 'Yearly', range: 'yearly' },
];

export default function PatientsListPage() {
  const session = useSession();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.token) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadPatients = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await apiRequest<PatientRecord[]>('/patients', {}, session);

        if (isActive) {
          setPatients(response);
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load patients right now.'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadPatients();

    return () => {
      isActive = false;
    };
  }, [session]);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const today = new Date();
      const registrationDate = new Date(patient.createdAt);
      const recordId = formatRecordId('PAT', patient._id).toLowerCase();
      const normalizedSearch = searchTerm.toLowerCase();

      const matchesSearch =
        patient.user.name.toLowerCase().includes(normalizedSearch) ||
        recordId.includes(normalizedSearch) ||
        (patient.user.phone ?? '').includes(searchTerm);

      let matchesTime = false;

      switch (timeRange) {
        case 'daily':
          matchesTime = registrationDate.toDateString() === today.toDateString();
          break;
        case 'monthly':
          matchesTime =
            registrationDate.getMonth() === today.getMonth() &&
            registrationDate.getFullYear() === today.getFullYear();
          break;
        case 'quarterly':
          matchesTime =
            Math.floor(registrationDate.getMonth() / 3) === Math.floor(today.getMonth() / 3) &&
            registrationDate.getFullYear() === today.getFullYear();
          break;
        case 'yearly':
          matchesTime = registrationDate.getFullYear() === today.getFullYear();
          break;
        case 'all':
        default:
          matchesTime = true;
      }

      return matchesSearch && matchesTime;
    });
  }, [patients, searchTerm, timeRange]);

  const handlePrint = () => {
    window.print();
  };

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Patient records now load from MongoDB. Sign in again through the admin portal to view the synced list."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between non-printable">
        <div className="flex items-center gap-3">
          <LuUsers className="h-8 w-8 text-indigo-700" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Patients</h1>
            <p className="mt-1 text-sm text-gray-500">Patient registrations synced from MongoDB.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white transition hover:bg-gray-700"
          >
            <LuPrinter className="h-5 w-5" />
            Print List
          </button>
          <Link
            href="/patient/add"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
          >
            <LuUserPlus className="h-5 w-5" />
            Add New Patient
          </Link>
        </div>
      </div>

      <div className="space-y-4 rounded-xl bg-white p-4 shadow-md non-printable">
        <div className="relative">
          <span className="absolute left-3 top-3.5 text-gray-400">
            <LuSearch className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search by patient name, patient ID, or phone..."
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center text-sm font-medium text-gray-600">
            <LuCalendarDays className="mr-2 h-4 w-4" />
            Filter by registration date:
          </span>
          {filterButtons.map((button) => (
            <button
              key={button.range}
              onClick={() => setTimeRange(button.range)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                timeRange === button.range
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl bg-white shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Patient Name</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Patient ID</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Age</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Phone</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                    Loading patients...
                  </td>
                </tr>
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                          {getInitials(patient.user.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{patient.user.name}</p>
                          <p className="text-sm text-gray-500">{patient.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatRecordId('PAT', patient._id)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{calculateAge(patient.dateOfBirth)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{patient.user.phone || 'Not added yet'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(patient.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                    No patients found yet. Add one to see it here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-gray-600 non-printable">
        Showing <span className="font-medium">{filteredPatients.length}</span> patient records.
      </p>
    </div>
  );
}
