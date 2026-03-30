import type { z } from 'zod';
import type { AuthenticatedUser } from '../../types/authenticated-user.js';
import { AppError } from '../../utils/app-error.js';
import { getOrganizationUserIds } from '../../utils/organization-scope.js';
import { DoctorModel } from '../doctor/doctor.model.js';
import { PatientModel } from '../patient/patient.model.js';
import { AppointmentModel } from './appointment.model.js';
import type { createAppointmentSchema, updateAppointmentSchema } from './appointment.validation.js';

type CreateAppointmentPayload = z.infer<typeof createAppointmentSchema>['body'];
type UpdateAppointmentPayload = z.infer<typeof updateAppointmentSchema>['body'];

export async function createAppointment(payload: CreateAppointmentPayload, actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  const [patient, doctor] = await Promise.all([
    PatientModel.findOne({ _id: payload.patientId, user: { $in: organizationUserIds } }),
    DoctorModel.findOne({ _id: payload.doctorId, user: { $in: organizationUserIds } }),
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
    createdBy: actor.id,
  });

  return getAppointmentById(appointment._id.toString(), actor);
}

export async function getAppointmentsForUser(actor: AuthenticatedUser) {
  const query: Record<string, unknown> = {};

  if (actor.role === 'admin') {
    const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
    query.createdBy = { $in: organizationUserIds };
  }

  if (actor.role === 'doctor') {
    const doctor = await DoctorModel.findOne({ user: actor.id });

    if (!doctor) {
      throw new AppError('Doctor profile not found', 404);
    }

    query.doctor = doctor._id;
  }

  if (actor.role === 'patient') {
    const patient = await PatientModel.findOne({ user: actor.id });

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

export async function getAppointmentById(appointmentId: string, actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  const appointment = await AppointmentModel.findOne({
    _id: appointmentId,
    createdBy: { $in: organizationUserIds },
  })
    .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
    .populate('createdBy', '-password');

  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  return appointment;
}

export async function updateAppointment(appointmentId: string, payload: UpdateAppointmentPayload, actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  const [appointment, patient, doctor] = await Promise.all([
    AppointmentModel.findOne({ _id: appointmentId, createdBy: { $in: organizationUserIds } }),
    PatientModel.findOne({ _id: payload.patientId, user: { $in: organizationUserIds } }),
    DoctorModel.findOne({ _id: payload.doctorId, user: { $in: organizationUserIds } }),
  ]);

  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  appointment.patient = patient._id;
  appointment.doctor = doctor._id;
  appointment.scheduledAt = new Date(payload.scheduledAt);
  appointment.reason = payload.reason;
  appointment.notes = payload.notes ?? null;
  appointment.status = payload.status ?? appointment.status;

  await appointment.save();

  return getAppointmentById(appointment._id.toString(), actor);
}
