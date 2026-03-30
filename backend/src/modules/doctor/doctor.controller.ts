import type { Request, Response } from 'express';
import { sendResponse } from '../../utils/api-response.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { recordAuditEvent } from '../audit-log/audit-log.service.js';
import { createDoctor, getDoctorByUserId, getDoctors } from './doctor.service.js';

export const createDoctorHandler = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await createDoctor(req.body, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'doctor.created',
    entityType: 'doctor',
    entityId: doctor?.id ?? doctor?._id?.toString(),
    summary: 'Created doctor profile',
  });

  sendResponse({
    res,
    statusCode: 201,
    message: 'Doctor created successfully',
    data: doctor,
  });
});

export const getDoctorsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const doctors = await getDoctors(_req.user!);

  sendResponse({
    res,
    message: 'Doctors fetched successfully',
    data: doctors,
  });
});

export const getMyDoctorProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await getDoctorByUserId(req.user!.id);

  sendResponse({
    res,
    message: 'Doctor profile fetched successfully',
    data: doctor,
  });
});
