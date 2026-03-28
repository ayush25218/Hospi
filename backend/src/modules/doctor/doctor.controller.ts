import type { Request, Response } from 'express';
import { sendResponse } from '../../utils/api-response.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { createDoctor, getDoctorByUserId, getDoctors } from './doctor.service.js';

export const createDoctorHandler = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await createDoctor(req.body);

  sendResponse({
    res,
    statusCode: 201,
    message: 'Doctor created successfully',
    data: doctor,
  });
});

export const getDoctorsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const doctors = await getDoctors();

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
