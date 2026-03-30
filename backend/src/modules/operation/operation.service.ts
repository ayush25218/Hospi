import type { z } from 'zod';
import type { AuthenticatedUser } from '../../types/authenticated-user.js';
import { AppError } from '../../utils/app-error.js';
import { getOrganizationUserIds } from '../../utils/organization-scope.js';
import { DoctorModel } from '../doctor/doctor.model.js';
import { PatientModel } from '../patient/patient.model.js';
import { OperationModel } from './operation.model.js';
import type { createOperationSchema, updateOperationStatusSchema } from './operation.validation.js';

type CreateOperationPayload = z.infer<typeof createOperationSchema>['body'];
type UpdateOperationStatusPayload = z.infer<typeof updateOperationStatusSchema>['body'];

export async function createOperation(payload: CreateOperationPayload, actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  const [doctor, patient] = await Promise.all([
    payload.doctorId
      ? DoctorModel.findOne({ _id: payload.doctorId, user: { $in: organizationUserIds } }).populate('user', '-password')
      : Promise.resolve(null),
    payload.patientId
      ? PatientModel.findOne({ _id: payload.patientId, user: { $in: organizationUserIds } }).populate('user', '-password')
      : Promise.resolve(null),
  ]);

  if (payload.doctorId && !doctor) {
    throw new AppError('Doctor not found', 404);
  }

  if (payload.patientId && !patient) {
    throw new AppError('Patient not found', 404);
  }

  const operation = await OperationModel.create({
    doctor: doctor?._id,
    patient: patient?._id,
    doctorName: payload.doctorName || String((doctor?.user as { name?: string } | undefined)?.name ?? ''),
    patientName: payload.patientName || String((patient?.user as { name?: string } | undefined)?.name ?? ''),
    operationName: payload.operationName,
    scheduledAt: new Date(payload.scheduledAt),
    status: payload.status ?? 'pending',
    roomNumber: payload.roomNumber,
    notes: payload.notes,
    createdBy: actor.id,
  });

  return getOperationById(operation.id, actor);
}

export async function getOperations(actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  return OperationModel.find({ createdBy: { $in: organizationUserIds } })
    .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
    .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
    .populate('createdBy', '-password')
    .sort({ scheduledAt: 1, createdAt: -1 });
}

export async function updateOperationStatus(operationId: string, payload: UpdateOperationStatusPayload, actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  const operation = await OperationModel.findOneAndUpdate(
    { _id: operationId, createdBy: { $in: organizationUserIds } },
    {
      status: payload.status,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
    .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
    .populate('createdBy', '-password');

  if (!operation) {
    throw new AppError('Operation record not found', 404);
  }

  return operation;
}

export async function deleteOperation(operationId: string, actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  const deletedOperation = await OperationModel.findOneAndDelete({
    _id: operationId,
    createdBy: { $in: organizationUserIds },
  });

  if (!deletedOperation) {
    throw new AppError('Operation record not found', 404);
  }
}

async function getOperationById(operationId: string, actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  const operation = await OperationModel.findOne({
    _id: operationId,
    createdBy: { $in: organizationUserIds },
  })
    .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
    .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
    .populate('createdBy', '-password');

  if (!operation) {
    throw new AppError('Operation record not found', 404);
  }

  return operation;
}
