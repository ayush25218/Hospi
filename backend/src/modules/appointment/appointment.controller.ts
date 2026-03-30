import type { Request, Response } from 'express';
import { recordAuditEvent } from '../audit-log/audit-log.service.js';
import { sendResponse } from '../../utils/api-response.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { createAppointment, getAppointmentsForUser } from './appointment.service.js';

export const createAppointmentHandler = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await createAppointment(req.body, req.user!.id);

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
  const appointments = await getAppointmentsForUser(req.user!.id, req.user!.role);

  sendResponse({
    res,
    message: 'Appointments fetched successfully',
    data: appointments,
  });
});
