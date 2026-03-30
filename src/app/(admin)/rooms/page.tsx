'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LuBadgePlus,
  LuBedDouble,
  LuBuilding2,
  LuCalendarDays,
  LuCheckCheck,
  LuSearch,
  LuStethoscope,
  LuTrash2,
  LuUserRound,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { useSession } from '@/hooks/use-session';
import {
  apiRequest,
  describeError,
  formatDateTime,
  getInitials,
  type DoctorRecord,
  type PatientRecord,
  type RoomRecord,
  type RoomStatus,
} from '@/lib/api-client';
import { getTodayInputValue, toIsoDateValue } from '@/lib/date-inputs';

type RoomFormState = {
  roomNumber: string;
  floor: string;
  roomType: string;
  bedLabel: string;
  notes: string;
};

type AssignmentFormState = {
  patientId: string;
  doctorId: string;
  admittedAt: string;
  bedLabel: string;
  notes: string;
};

const initialRoomForm: RoomFormState = {
  roomNumber: '',
  floor: '',
  roomType: '',
  bedLabel: '',
  notes: '',
};

const initialAssignmentForm: AssignmentFormState = {
  patientId: '',
  doctorId: '',
  admittedAt: getTodayInputValue(),
  bedLabel: '',
  notes: '',
};

export default function RoomsPage() {
  const session = useSession();
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [roomForm, setRoomForm] = useState<RoomFormState>(initialRoomForm);
  const [assignmentForm, setAssignmentForm] = useState<AssignmentFormState>(initialAssignmentForm);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RoomStatus>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingRoom, setIsSavingRoom] = useState(false);
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.token) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadData = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [roomsResponse, patientsResponse, doctorsResponse] = await Promise.all([
          apiRequest<RoomRecord[]>('/rooms', {}, session),
          apiRequest<PatientRecord[]>('/patients', {}, session),
          apiRequest<DoctorRecord[]>('/doctors', {}, session),
        ]);

        if (isActive) {
          setRooms(roomsResponse);
          setPatients(patientsResponse);
          setDoctors(doctorsResponse);
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load room data right now.'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isActive = false;
    };
  }, [session]);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room._id === selectedRoomId) ?? null,
    [rooms, selectedRoomId],
  );

  const filteredRooms = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return rooms.filter((room) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        room.roomNumber.toLowerCase().includes(normalizedSearch) ||
        room.roomType.toLowerCase().includes(normalizedSearch) ||
        room.patient?.user.name.toLowerCase().includes(normalizedSearch) ||
        room.doctor?.user.name.toLowerCase().includes(normalizedSearch);

      const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
      const matchesType = typeFilter === 'all' || room.roomType === typeFilter;
      const matchesFloor = floorFilter === 'all' || room.floor === floorFilter;

      return matchesSearch && matchesStatus && matchesType && matchesFloor;
    });
  }, [floorFilter, rooms, searchTerm, statusFilter, typeFilter]);

  const roomTypes = useMemo(
    () => Array.from(new Set(rooms.map((room) => room.roomType))).sort((a, b) => a.localeCompare(b)),
    [rooms],
  );

  const floors = useMemo(
    () => Array.from(new Set(rooms.map((room) => room.floor))).sort((a, b) => a.localeCompare(b)),
    [rooms],
  );

  const roomCounts = useMemo(() => {
    return rooms.reduce(
      (summary, room) => {
        summary[room.status] += 1;
        return summary;
      },
      {
        available: 0,
        occupied: 0,
        cleaning: 0,
        maintenance: 0,
      } as Record<RoomStatus, number>,
    );
  }, [rooms]);

  const handleRoomFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setRoomForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAssignmentChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setAssignmentForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCreateRoom = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.token) {
      return;
    }

    setIsSavingRoom(true);
    setError('');

    try {
      const createdRoom = await apiRequest<RoomRecord>(
        '/rooms',
        {
          method: 'POST',
          body: JSON.stringify({
            roomNumber: roomForm.roomNumber.trim(),
            floor: roomForm.floor.trim(),
            roomType: roomForm.roomType.trim(),
            bedLabel: roomForm.bedLabel.trim() || undefined,
            notes: roomForm.notes.trim() || undefined,
          }),
        },
        session,
      );

      setRooms((current) => [...current, createdRoom].sort((left, right) => left.roomNumber.localeCompare(right.roomNumber)));
      setRoomForm(initialRoomForm);
      setSelectedRoomId(createdRoom._id);
    } catch (submissionError) {
      setError(describeError(submissionError, 'Unable to create this room right now.'));
    } finally {
      setIsSavingRoom(false);
    }
  };

  const handleAssignRoom = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.token || !selectedRoom) {
      return;
    }

    setIsSavingAssignment(true);
    setError('');

    try {
      const updatedRoom = await apiRequest<RoomRecord>(
        `/rooms/${selectedRoom._id}/assign`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            patientId: assignmentForm.patientId,
            doctorId: assignmentForm.doctorId,
            admittedAt: toIsoDateValue(assignmentForm.admittedAt),
            bedLabel: assignmentForm.bedLabel.trim() || undefined,
            notes: assignmentForm.notes.trim() || undefined,
          }),
        },
        session,
      );

      setRooms((current) => current.map((room) => (room._id === selectedRoom._id ? updatedRoom : room)));
      setAssignmentForm({
        patientId: updatedRoom.patient?._id ?? '',
        doctorId: updatedRoom.doctor?._id ?? '',
        admittedAt: updatedRoom.admittedAt ? updatedRoom.admittedAt.slice(0, 10) : getTodayInputValue(),
        bedLabel: updatedRoom.bedLabel ?? '',
        notes: updatedRoom.notes ?? '',
      });
    } catch (submissionError) {
      setError(describeError(submissionError, 'Unable to assign this room right now.'));
    } finally {
      setIsSavingAssignment(false);
    }
  };

  const setSelectedRoom = (room: RoomRecord) => {
    setSelectedRoomId(room._id);
    setAssignmentForm({
      patientId: room.patient?._id ?? '',
      doctorId: room.doctor?._id ?? '',
      admittedAt: room.admittedAt ? room.admittedAt.slice(0, 10) : getTodayInputValue(),
      bedLabel: room.bedLabel ?? '',
      notes: room.notes ?? '',
    });
  };

  const updateRoomStatus = async (roomId: string, status: Exclude<RoomStatus, 'occupied'>) => {
    if (!session?.token) {
      return;
    }

    try {
      const updatedRoom = await apiRequest<RoomRecord>(
        `/rooms/${roomId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        },
        session,
      );

      setRooms((current) => current.map((room) => (room._id === roomId ? updatedRoom : room)));

      if (selectedRoomId === roomId) {
        setSelectedRoom(updatedRoom);
      }
    } catch (statusError) {
      setError(describeError(statusError, 'Unable to update room status right now.'));
    }
  };

  const vacateRoom = async (roomId: string, status: 'available' | 'cleaning') => {
    if (!session?.token) {
      return;
    }

    try {
      const updatedRoom = await apiRequest<RoomRecord>(
        `/rooms/${roomId}/vacate`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        },
        session,
      );

      setRooms((current) => current.map((room) => (room._id === roomId ? updatedRoom : room)));

      if (selectedRoomId === roomId) {
        setSelectedRoom(updatedRoom);
      }
    } catch (vacateError) {
      setError(describeError(vacateError, 'Unable to update this room right now.'));
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!session?.token) {
      return;
    }

    const confirmed = window.confirm('Delete this room?');

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest<null>(
        `/rooms/${roomId}`,
        {
          method: 'DELETE',
        },
        session,
      );

      setRooms((current) => current.filter((room) => room._id !== roomId));

      if (selectedRoomId === roomId) {
        setSelectedRoomId('');
        setAssignmentForm(initialAssignmentForm);
      }
    } catch (deleteError) {
      setError(describeError(deleteError, 'Unable to delete this room right now.'));
    }
  };

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Room management now loads from MongoDB. Sign in again through the admin portal to manage live allotments."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
            <LuBedDouble className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Rooms & Bed Management</h1>
            <p className="mt-1 text-sm text-slate-500">
              Add rooms, allot patients, and keep IPD occupancy in sync with the real database.
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Available" value={String(roomCounts.available)} tone="emerald" />
        <SummaryCard label="Occupied" value={String(roomCounts.occupied)} tone="blue" />
        <SummaryCard label="Cleaning" value={String(roomCounts.cleaning)} tone="amber" />
        <SummaryCard label="Maintenance" value={String(roomCounts.maintenance)} tone="slate" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_360px_minmax(0,1fr)]">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Add room</h2>
          <p className="mt-1 text-sm text-slate-500">Create a new room or bed slot before assigning a patient.</p>

          <form onSubmit={handleCreateRoom} className="mt-5 space-y-4">
            <Field label="Room number">
              <input
                type="text"
                name="roomNumber"
                value={roomForm.roomNumber}
                onChange={handleRoomFormChange}
                placeholder="301-ICU"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
            </Field>

            <Field label="Floor" icon={LuBuilding2}>
              <input
                type="text"
                name="floor"
                value={roomForm.floor}
                onChange={handleRoomFormChange}
                placeholder="3rd Floor"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
            </Field>

            <Field label="Room type">
              <input
                type="text"
                name="roomType"
                value={roomForm.roomType}
                onChange={handleRoomFormChange}
                placeholder="ICU, Private, Semi-Private"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                required
              />
            </Field>

            <Field label="Default bed label">
              <input
                type="text"
                name="bedLabel"
                value={roomForm.bedLabel}
                onChange={handleRoomFormChange}
                placeholder="Bed-1"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              />
            </Field>

            <Field label="Notes">
              <textarea
                name="notes"
                rows={4}
                value={roomForm.notes}
                onChange={handleRoomFormChange}
                placeholder="Ventilator support, isolation, or housekeeping notes"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
              />
            </Field>

            <button
              type="submit"
              disabled={isSavingRoom}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LuBadgePlus className="h-4 w-4" />
              {isSavingRoom ? 'Saving room...' : 'Create room'}
            </button>
          </form>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">
            {selectedRoom ? `Manage ${selectedRoom.roomNumber}` : 'Select a room'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {selectedRoom
              ? 'Assign or reassign the room, then update its housekeeping state when discharged.'
              : 'Choose a card from the room grid to open live room actions.'}
          </p>

          {selectedRoom ? (
            <div className="mt-5 space-y-5">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {selectedRoom.floor} · {selectedRoom.roomType}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">{selectedRoom.roomNumber}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoomStatusClasses(selectedRoom.status)}`}>
                    {toLabel(selectedRoom.status)}
                  </span>
                </div>

                {selectedRoom.patient ? (
                  <div className="mt-4 grid gap-3 rounded-2xl bg-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-50 font-semibold text-cyan-700">
                        {getInitials(selectedRoom.patient.user.name)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{selectedRoom.patient.user.name}</p>
                        <p className="text-xs text-slate-500">
                          {selectedRoom.doctor?.user.name ?? 'No doctor assigned'}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">
                      Bed: {selectedRoom.bedLabel || 'Not specified'} · Admitted{' '}
                      {selectedRoom.admittedAt ? formatDateTime(selectedRoom.admittedAt) : 'today'}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
                    This room is currently empty. Use the form below to allot a patient.
                  </div>
                )}
              </div>

              <form onSubmit={handleAssignRoom} className="space-y-4">
                <Field label="Patient" icon={LuUserRound}>
                  <select
                    name="patientId"
                    value={assignmentForm.patientId}
                    onChange={handleAssignmentChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                    required
                  >
                    <option value="">Select patient</option>
                    {patients.map((patient) => (
                      <option key={patient._id} value={patient._id}>
                        {patient.user.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Doctor" icon={LuStethoscope}>
                  <select
                    name="doctorId"
                    value={assignmentForm.doctorId}
                    onChange={handleAssignmentChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                    required
                  >
                    <option value="">Select doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.user.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                  <Field label="Admit date" icon={LuCalendarDays}>
                    <input
                      type="date"
                      name="admittedAt"
                      value={assignmentForm.admittedAt}
                      onChange={handleAssignmentChange}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                      required
                    />
                  </Field>

                  <Field label="Bed label">
                    <input
                      type="text"
                      name="bedLabel"
                      value={assignmentForm.bedLabel}
                      onChange={handleAssignmentChange}
                      placeholder="Bed-2"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                    />
                  </Field>
                </div>

                <Field label="Notes">
                  <textarea
                    name="notes"
                    rows={4}
                    value={assignmentForm.notes}
                    onChange={handleAssignmentChange}
                    placeholder="Admission remarks or nursing handoff"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  />
                </Field>

                <button
                  type="submit"
                  disabled={isSavingAssignment}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSavingAssignment ? 'Saving assignment...' : selectedRoom.status === 'occupied' ? 'Reassign room' : 'Assign room'}
                </button>
              </form>

              <div className="grid gap-3">
                {selectedRoom.status === 'occupied' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void vacateRoom(selectedRoom._id, 'cleaning')}
                      className="rounded-2xl border border-amber-200 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                    >
                      Discharge and send to cleaning
                    </button>
                    <button
                      type="button"
                      onClick={() => void vacateRoom(selectedRoom._id, 'available')}
                      className="rounded-2xl border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      Discharge and mark available
                    </button>
                  </>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => void updateRoomStatus(selectedRoom._id, 'available')}
                      className="rounded-2xl border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      <span className="inline-flex items-center gap-2">
                        <LuCheckCheck className="h-4 w-4" />
                        Mark available
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void updateRoomStatus(selectedRoom._id, 'maintenance')}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Mark maintenance
                    </button>
                  </div>
                )}

                {selectedRoom.status !== 'occupied' ? (
                  <button
                    type="button"
                    onClick={() => void handleDeleteRoom(selectedRoom._id)}
                    className="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                  >
                    <span className="inline-flex items-center gap-2">
                      <LuTrash2 className="h-4 w-4" />
                      Delete room
                    </span>
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Select any room card to open live assignment controls.
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_180px_180px]">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <LuSearch className="h-4 w-4 text-slate-400" />
                  Search rooms
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Room, patient, doctor, or type"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                />
              </label>

              <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter}>
                <option value="all">All statuses</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
              </FilterSelect>

              <FilterSelect label="Type" value={typeFilter} onChange={setTypeFilter}>
                <option value="all">All types</option>
                {roomTypes.map((roomType) => (
                  <option key={roomType} value={roomType}>
                    {roomType}
                  </option>
                ))}
              </FilterSelect>

              <FilterSelect label="Floor" value={floorFilter} onChange={setFloorFilter}>
                <option value="all">All floors</option>
                {floors.map((floor) => (
                  <option key={floor} value={floor}>
                    {floor}
                  </option>
                ))}
              </FilterSelect>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {isLoading ? (
              <div className="rounded-[1.75rem] border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm md:col-span-2">
                Loading room inventory...
              </div>
            ) : filteredRooms.length > 0 ? (
              filteredRooms.map((room) => (
                <article
                  key={room._id}
                  className={`rounded-[1.75rem] border p-5 shadow-sm transition ${
                    selectedRoomId === room._id ? 'border-cyan-300 bg-cyan-50/40' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {room.floor} · {room.roomType}
                      </p>
                      <h3 className="mt-1 text-xl font-semibold text-slate-950">{room.roomNumber}</h3>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoomStatusClasses(room.status)}`}>
                      {toLabel(room.status)}
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    {room.patient ? (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white font-semibold text-slate-700">
                            {getInitials(room.patient.user.name)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{room.patient.user.name}</p>
                            <p className="text-xs text-slate-500">{room.doctor?.user.name || 'No doctor assigned'}</p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-slate-600">
                          Bed {room.bedLabel || 'Not set'} ·{' '}
                          {room.admittedAt ? `Admitted ${formatDateTime(room.admittedAt)}` : 'Admission date not set'}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500">No patient assigned yet.</p>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRoom(room)}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {selectedRoomId === room._id ? 'Selected' : 'Open controls'}
                    </button>

                    {room.status === 'occupied' ? (
                      <button
                        type="button"
                        onClick={() => void vacateRoom(room._id, 'cleaning')}
                        className="rounded-full border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
                      >
                        Discharge
                      </button>
                    ) : room.status !== 'available' ? (
                      <button
                        type="button"
                        onClick={() => void updateRoomStatus(room._id, 'available')}
                        className="rounded-full border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                      >
                        Mark available
                      </button>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm md:col-span-2">
                No rooms found for the current filters.
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

function FilterSelect<T extends string>({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
      >
        {children}
      </select>
    </label>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'emerald' | 'blue' | 'amber' | 'slate';
}) {
  const toneClasses = {
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-sky-50 text-sky-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-700',
  }[tone];

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses}`}>{label}</span>
      <p className="mt-4 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function getRoomStatusClasses(status: RoomStatus) {
  switch (status) {
    case 'available':
      return 'bg-emerald-100 text-emerald-700';
    case 'occupied':
      return 'bg-sky-100 text-sky-700';
    case 'cleaning':
      return 'bg-amber-100 text-amber-700';
    case 'maintenance':
    default:
      return 'bg-slate-200 text-slate-700';
  }
}

function toLabel(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
