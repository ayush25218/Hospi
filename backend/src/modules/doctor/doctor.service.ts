import { AppError } from '../../utils/app-error.js';
import { UserModel } from '../user/user.model.js';
import { DoctorModel } from './doctor.model.js';
import type { z } from 'zod';
import type { createDoctorSchema } from './doctor.validation.js';

type CreateDoctorPayload = z.infer<typeof createDoctorSchema>['body'];

export async function createDoctor(payload: CreateDoctorPayload) {
  const existingUser = await UserModel.findOne({ email: payload.email });

  if (existingUser) {
    throw new AppError('Doctor already exists with this email', 409);
  }

  const user = await UserModel.create({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    password: payload.password,
    role: 'doctor',
  });

  try {
    const doctor = await DoctorModel.create({
      user: user._id,
      department: payload.department,
      specialization: payload.specialization,
      yearsOfExperience: payload.yearsOfExperience ?? 0,
      consultationFee: payload.consultationFee ?? 0,
      bio: payload.bio,
      availability: payload.availability ?? [],
    });

    const populatedDoctor = await DoctorModel.findById(doctor._id).populate('user', '-password');
    return populatedDoctor;
  } catch (error) {
    await UserModel.findByIdAndDelete(user._id);
    throw error;
  }
}

export async function getDoctors() {
  return DoctorModel.find().populate('user', '-password').sort({ createdAt: -1 });
}

export async function getDoctorByUserId(userId: string) {
  const doctor = await DoctorModel.findOne({ user: userId }).populate('user', '-password');

  if (!doctor) {
    throw new AppError('Doctor profile not found', 404);
  }

  return doctor;
}
