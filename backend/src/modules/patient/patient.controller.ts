import type { Request, Response } from 'express';
import { sendResponse } from '../../utils/api-response.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { recordAuditEvent } from '../audit-log/audit-log.service.js';
import { createPatient, getPatientByUserId, getPatients } from './patient.service.js';

export const createPatientHandler = asyncHandler(async (req: Request, res: Response) => {
  const patient = await createPatient(req.body, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'patient.created',
    entityType: 'patient',
    entityId: patient?.id ?? patient?._id?.toString(),
    summary: 'Created patient profile',
  });

  sendResponse({
    res,
    statusCode: 201,
    message: 'Patient created successfully',
    data: patient,
  });
});

export const getPatientsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const patients = await getPatients(_req.user!);

  sendResponse({
    res,
    message: 'Patients fetched successfully',
    data: patients,
  });
});

export const getMyPatientProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  const patient = await getPatientByUserId(req.user!.id);

  sendResponse({
    res,
    message: 'Patient profile fetched successfully',
    data: patient,
  });
});
