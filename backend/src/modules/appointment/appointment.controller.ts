import type { Request, Response } from 'express';
import { recordAuditEvent } from '../audit-log/audit-log.service.js';
import { sendResponse } from '../../utils/api-response.js';
import { asyncHandler } from '../../utils/async-handler.js';
import {
  createAppointment,
  getAppointmentById,
  getAppointmentsForUser,
  updateAppointment,
} from './appointment.service.js';

export const createAppointmentHandler = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await createAppointment(req.body, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'appointment.created',
    entityType: 'appointment',
    entityId: appointment?.id ?? appointment?._id?.toString(),
    summary: 'Created appointment record',
  });

  sendResponse({
    res,
    statusCode: 201,
    message: 'Appointment created successfully',
    data: appointment,
  });
});

export const getAppointmentsHandler = asyncHandler(async (req: Request, res: Response) => {
  const appointments = await getAppointmentsForUser(req.user!);

  sendResponse({
    res,
    message: 'Appointments fetched successfully',
    data: appointments,
  });
});

export const getAppointmentByIdHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const appointment = await getAppointmentById(req.params.id, req.user!);

  sendResponse({
    res,
    message: 'Appointment fetched successfully',
    data: appointment,
  });
});

export const updateAppointmentHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const appointment = await updateAppointment(req.params.id, req.body, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'appointment.updated',
    entityType: 'appointment',
    entityId: appointment?._id?.toString(),
    summary: 'Updated appointment record',
  });

  sendResponse({
    res,
    message: 'Appointment updated successfully',
    data: appointment,
  });
});
