'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { LuBuilding2, LuPrinter, LuSearch, LuStethoscope, LuUserPlus } from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import {
  apiRequest,
  describeError,
  formatRecordId,
  getInitials,
  type DoctorRecord,
} from '@/lib/api-client';
import { useSession } from '@/hooks/use-session';

export default function DoctorsListPage() {
  const session = useSession();
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.token) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadDoctors = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await apiRequest<DoctorRecord[]>('/doctors', {}, session);

        if (isActive) {
          setDoctors(response);
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load doctors right now.'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadDoctors();

    return () => {
      isActive = false;
    };
  }, [session]);

  const departments = useMemo(
    () => Array.from(new Set(doctors.map((doctor) => doctor.department))).sort((a, b) => a.localeCompare(b)),
    [doctors]
  );

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const recordId = formatRecordId('DOC', doctor._id).toLowerCase();
      const matchesSearch =
        doctor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recordId.includes(searchTerm.toLowerCase());

      const matchesDepartment = departmentFilter === '' || doctor.department === departmentFilter;
      return matchesSearch && matchesDepartment;
    });
  }, [departmentFilter, doctors, searchTerm]);

  const handlePrint = () => {
    window.print();
  };

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Doctor records now load from MongoDB. Sign in again through the admin portal to view the synced list."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between non-printable">
        <div className="flex items-center gap-3">
          <LuStethoscope className="h-8 w-8 text-indigo-700" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Doctors</h1>
            <p className="mt-1 text-sm text-gray-500">Live doctor directory synced from the backend.</p>
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
            href="/doctor/add"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
          >
            <LuUserPlus className="h-5 w-5" />
            Add New Doctor
          </Link>
        </div>
      </div>

      <div className="space-y-4 rounded-xl bg-white p-4 shadow-md non-printable md:flex md:items-center md:gap-4 md:space-y-0">
        <div className="relative flex-1">
          <span className="absolute left-3 top-3.5 text-gray-400">
            <LuSearch className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search by doctor name, email, or record ID..."
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="relative flex-1">
          <span className="absolute left-3 top-3.5 text-gray-400">
            <LuBuilding2 className="h-5 w-5" />
          </span>
          <select
            className="w-full appearance-none rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
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
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Name</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Doctor ID</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Department</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Specialization</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Phone</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
                    Loading doctors...
                  </td>
                </tr>
              ) : filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <tr key={doctor._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                          {getInitials(doctor.user.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doctor.user.name}</p>
                          <p className="text-sm text-gray-500">{doctor.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatRecordId('DOC', doctor._id)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{doctor.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{doctor.specialization}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{doctor.user.phone || 'Not added yet'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          doctor.user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {doctor.user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
                    No doctors found yet. Add one to see it here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-gray-600 non-printable">
        Showing <span className="font-medium">{filteredDoctors.length}</span> doctor records.
      </p>
    </div>
  );
}
