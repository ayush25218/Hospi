import type { Request, Response } from 'express';
import { sendResponse } from '../../utils/api-response.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { createPatient, getPatientByUserId, getPatients } from './patient.service.js';

export const createPatientHandler = asyncHandler(async (req: Request, res: Response) => {
  const patient = await createPatient(req.body);

  sendResponse({
    res,
    statusCode: 201,
    message: 'Patient created successfully',
    data: patient,
  });
});

export const getPatientsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const patients = await getPatients();

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
