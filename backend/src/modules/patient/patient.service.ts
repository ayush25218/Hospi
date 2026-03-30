import type { z } from 'zod';
import type { AuthenticatedUser } from '../../types/authenticated-user.js';
import { AppError } from '../../utils/app-error.js';
import { getOrganizationUserIds } from '../../utils/organization-scope.js';
import { UserModel } from '../user/user.model.js';
import { PatientModel } from './patient.model.js';
import type { createPatientSchema } from './patient.validation.js';

type CreatePatientPayload = z.infer<typeof createPatientSchema>['body'];

export async function createPatient(payload: CreatePatientPayload, actor: AuthenticatedUser) {
  const existingUser = await UserModel.findOne({
    email: payload.email,
    organization: actor.organizationId,
  });

  if (existingUser) {
    throw new AppError('Patient already exists with this email', 409);
  }

  const user = await UserModel.create({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    password: payload.password,
    role: 'patient',
    organization: actor.organizationId,
  });

  try {
    const patient = await PatientModel.create({
      user: user._id,
      gender: payload.gender,
      dateOfBirth: new Date(payload.dateOfBirth),
      bloodGroup: payload.bloodGroup,
      address: payload.address,
      emergencyContact: payload.emergencyContact,
      medicalHistory: payload.medicalHistory ?? [],
    });

    const populatedPatient = await PatientModel.findById(patient._id).populate('user', '-password');
    return populatedPatient;
  } catch (error) {
    await UserModel.findByIdAndDelete(user._id);
    throw error;
  }
}

export async function getPatients(actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  return PatientModel.find({ user: { $in: organizationUserIds } }).populate('user', '-password').sort({ createdAt: -1 });
}

export async function getPatientByUserId(userId: string) {
  const patient = await PatientModel.findOne({ user: userId }).populate('user', '-password');

  if (!patient) {
    throw new AppError('Patient profile not found', 404);
  }

  return patient;
}
