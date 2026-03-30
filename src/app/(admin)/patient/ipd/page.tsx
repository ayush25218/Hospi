'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { LuBedDouble, LuBuilding2, LuCalendarDays, LuSearch, LuUserRound } from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { useSession } from '@/hooks/use-session';
import {
  apiRequest,
  describeError,
  formatDateTime,
  formatRecordId,
  getInitials,
  type RoomRecord,
} from '@/lib/api-client';

export default function IPDPage() {
  const session = useSession();
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.token) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadAdmissions = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await apiRequest<RoomRecord[]>('/rooms', {}, session);

        if (isActive) {
          setRooms(response.filter((room) => room.status === 'occupied' && room.patient));
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load IPD admissions right now.'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadAdmissions();

    return () => {
      isActive = false;
    };
  }, [session]);

  const departments = useMemo(
    () =>
      Array.from(
        new Set(rooms.map((room) => room.doctor?.department).filter((department): department is string => Boolean(department))),
      ).sort((a, b) => a.localeCompare(b)),
    [rooms],
  );

  const filteredAdmissions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return rooms.filter((room) => {
      const patient = room.patient;
      const doctor = room.doctor;

      if (!patient) {
        return false;
      }

      const matchesSearch =
        normalizedSearch.length === 0 ||
        patient.user.name.toLowerCase().includes(normalizedSearch) ||
        formatRecordId('PAT', patient._id).toLowerCase().includes(normalizedSearch) ||
        room.roomNumber.toLowerCase().includes(normalizedSearch) ||
        doctor?.user.name.toLowerCase().includes(normalizedSearch);

      const matchesDepartment = departmentFilter === 'all' || doctor?.department === departmentFilter;
      return matchesSearch && matchesDepartment;
    });
  }, [departmentFilter, rooms, searchTerm]);

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="IPD admissions now load from MongoDB room assignments. Sign in again through the admin portal to monitor the live ward list."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
              <LuBedDouble className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">In-Patient Admissions</h1>
              <p className="mt-1 text-sm text-slate-500">
                Live admission list generated from actual occupied rooms and doctor assignments.
              </p>
            </div>
          </div>

          <Link
            href="/rooms"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Open room manager
          </Link>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <LuSearch className="h-4 w-4 text-slate-400" />
              Search admissions
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Patient, doctor, room, or patient ref"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <LuBuilding2 className="h-4 w-4 text-slate-400" />
              Department
            </span>
            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
            >
              <option value="all">All departments</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          <div className="rounded-[1.75rem] border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm md:col-span-2">
            Loading admissions...
          </div>
        ) : filteredAdmissions.length > 0 ? (
          filteredAdmissions.map((room) => {
            const patient = room.patient!;
            return (
              <article key={room._id} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 font-semibold text-cyan-700">
                      {getInitials(patient.user.name)}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-950">{patient.user.name}</h2>
                      <p className="text-sm text-slate-500">{formatRecordId('PAT', patient._id)}</p>
                    </div>
                  </div>

                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                    {room.roomNumber}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <LuUserRound className="h-4 w-4 text-slate-400" />
                    {patient.user.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <LuBuilding2 className="h-4 w-4 text-slate-400" />
                    {room.doctor?.department || 'Department not assigned'}
                  </p>
                  <p className="flex items-center gap-2">
                    <LuCalendarDays className="h-4 w-4 text-slate-400" />
                    {room.admittedAt ? formatDateTime(room.admittedAt) : 'Admission date not captured'}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 text-sm text-slate-600">
                  <div>
                    <p className="font-medium text-slate-900">{room.doctor?.user.name || 'No doctor assigned'}</p>
                    <p>{room.bedLabel || 'Bed label not set'}</p>
                  </div>

                  <Link
                    href="/rooms"
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Manage room
                  </Link>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm md:col-span-2">
            No live IPD admissions found for the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
