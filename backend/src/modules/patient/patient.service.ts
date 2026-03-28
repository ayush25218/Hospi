import { AppError } from '../../utils/app-error.js';
import { UserModel } from '../user/user.model.js';
import { PatientModel } from './patient.model.js';
import type { z } from 'zod';
import type { createPatientSchema } from './patient.validation.js';

type CreatePatientPayload = z.infer<typeof createPatientSchema>['body'];

export async function createPatient(payload: CreatePatientPayload) {
  const existingUser = await UserModel.findOne({ email: payload.email });

  if (existingUser) {
    throw new AppError('Patient already exists with this email', 409);
  }

  const user = await UserModel.create({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    password: payload.password,
    role: 'patient',
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

export async function getPatients() {
  return PatientModel.find().populate('user', '-password').sort({ createdAt: -1 });
}

export async function getPatientByUserId(userId: string) {
  const patient = await PatientModel.findOne({ user: userId }).populate('user', '-password');

  if (!patient) {
    throw new AppError('Patient profile not found', 404);
  }

  return patient;
}
