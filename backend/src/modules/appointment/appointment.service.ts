import { AppError } from '../../utils/app-error.js';
import { DoctorModel } from '../doctor/doctor.model.js';
import { PatientModel } from '../patient/patient.model.js';
import { AppointmentModel } from './appointment.model.js';
import type { z } from 'zod';
import type { createAppointmentSchema } from './appointment.validation.js';
import type { UserRole } from '../user/user.model.js';

type CreateAppointmentPayload = z.infer<typeof createAppointmentSchema>['body'];

export async function createAppointment(payload: CreateAppointmentPayload, createdBy: string) {
  const [patient, doctor] = await Promise.all([
    PatientModel.findById(payload.patientId),
    DoctorModel.findById(payload.doctorId),
  ]);

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  const appointment = await AppointmentModel.create({
    patient: patient._id,
    doctor: doctor._id,
    scheduledAt: new Date(payload.scheduledAt),
    reason: payload.reason,
    notes: payload.notes,
    status: payload.status ?? 'scheduled',
    createdBy,
  });

  return AppointmentModel.findById(appointment._id)
    .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
    .populate('createdBy', '-password');
}

export async function getAppointmentsForUser(userId: string, role: UserRole) {
  const query: Record<string, unknown> = {};

  if (role === 'doctor') {
    const doctor = await DoctorModel.findOne({ user: userId });

    if (!doctor) {
      throw new AppError('Doctor profile not found', 404);
    }

    query.doctor = doctor._id;
  }

  if (role === 'patient') {
    const patient = await PatientModel.findOne({ user: userId });

    if (!patient) {
      throw new AppError('Patient profile not found', 404);
    }

    query.patient = patient._id;
  }

  return AppointmentModel.find(query)
    .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
    .populate('createdBy', '-password')
    .sort({ scheduledAt: 1 });
}
