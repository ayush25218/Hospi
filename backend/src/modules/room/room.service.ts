import type { z } from 'zod';
import { AppError } from '../../utils/app-error.js';
import { DoctorModel } from '../doctor/doctor.model.js';
import { PatientModel } from '../patient/patient.model.js';
import { RoomModel } from './room.model.js';
import type {
  assignRoomSchema,
  createRoomSchema,
  updateRoomSchema,
  updateRoomStatusSchema,
  vacateRoomSchema,
} from './room.validation.js';

type CreateRoomPayload = z.infer<typeof createRoomSchema>['body'];
type UpdateRoomPayload = z.infer<typeof updateRoomSchema>['body'];
type AssignRoomPayload = z.infer<typeof assignRoomSchema>['body'];
type UpdateRoomStatusPayload = z.infer<typeof updateRoomStatusSchema>['body'];
type VacateRoomPayload = z.infer<typeof vacateRoomSchema>['body'];

export async function createRoom(payload: CreateRoomPayload, createdBy: string) {
  const room = await RoomModel.create({
    roomNumber: payload.roomNumber,
    floor: payload.floor,
    roomType: payload.roomType,
    bedLabel: payload.bedLabel,
    status: payload.status ?? 'available',
    notes: payload.notes,
    createdBy,
  });

  return getRoomById(room.id);
}

export async function getRooms() {
  return RoomModel.find()
    .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
    .populate('createdBy', '-password')
    .sort({ roomNumber: 1 });
}

export async function updateRoom(roomId: string, payload: UpdateRoomPayload) {
  const nextStatus = payload.status;
  const room = await RoomModel.findByIdAndUpdate(
    roomId,
    {
      ...(payload.roomNumber ? { roomNumber: payload.roomNumber } : {}),
      ...(payload.floor ? { floor: payload.floor } : {}),
      ...(payload.roomType ? { roomType: payload.roomType } : {}),
      ...(payload.bedLabel !== undefined ? { bedLabel: payload.bedLabel || undefined } : {}),
      ...(nextStatus ? { status: nextStatus } : {}),
      ...(payload.notes !== undefined ? { notes: payload.notes || undefined } : {}),
      ...(nextStatus && nextStatus !== 'occupied'
        ? {
            patient: undefined,
            doctor: undefined,
            admittedAt: undefined,
          }
        : {}),
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
    .populate('createdBy', '-password');

  if (!room) {
    throw new AppError('Room not found', 404);
  }

  return room;
}

export async function assignRoom(roomId: string, payload: AssignRoomPayload) {
  const [room, patient, doctor] = await Promise.all([
    RoomModel.findById(roomId),
    PatientModel.findById(payload.patientId),
    DoctorModel.findById(payload.doctorId),
  ]);

  if (!room) {
    throw new AppError('Room not found', 404);
  }

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  room.patient = patient._id;
  room.doctor = doctor._id;
  room.status = 'occupied';

  if (payload.bedLabel !== undefined) {
    room.bedLabel = payload.bedLabel;
  }

  room.admittedAt = payload.admittedAt ? new Date(payload.admittedAt) : new Date();

  if (payload.notes !== undefined) {
    room.notes = payload.notes;
  }

  await room.save();

  return getRoomById(room.id);
}

export async function updateRoomStatus(roomId: string, payload: UpdateRoomStatusPayload) {
  if (payload.status === 'occupied') {
    throw new AppError('Use room assignment to mark a room as occupied', 400);
  }

  const room = await RoomModel.findByIdAndUpdate(
    roomId,
    {
      status: payload.status,
      patient: undefined,
      doctor: undefined,
      admittedAt: undefined,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
    .populate('createdBy', '-password');

  if (!room) {
    throw new AppError('Room not found', 404);
  }

  return room;
}

export async function vacateRoom(roomId: string, payload: VacateRoomPayload) {
  const room = await RoomModel.findByIdAndUpdate(
    roomId,
    {
      status: payload.status ?? 'available',
      patient: undefined,
      doctor: undefined,
      admittedAt: undefined,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
    .populate('createdBy', '-password');

  if (!room) {
    throw new AppError('Room not found', 404);
  }

  return room;
}

export async function deleteRoom(roomId: string) {
  const room = await RoomModel.findById(roomId);

  if (!room) {
    throw new AppError('Room not found', 404);
  }

  if (room.status === 'occupied') {
    throw new AppError('Discharge the patient before deleting this room', 400);
  }

  await room.deleteOne();
}

async function getRoomById(roomId: string) {
  const room = await RoomModel.findById(roomId)
    .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
    .populate('createdBy', '-password');

  if (!room) {
    throw new AppError('Room not found', 404);
  }

  return room;
}
