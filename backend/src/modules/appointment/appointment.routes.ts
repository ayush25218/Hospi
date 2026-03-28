import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { createAppointmentHandler, getAppointmentsHandler } from './appointment.controller.js';
import { createAppointmentSchema } from './appointment.validation.js';

const router = Router();

router.get('/', auth('admin', 'doctor', 'patient'), getAppointmentsHandler);
router.post(
  '/',
  auth('admin', 'doctor'),
  validateRequest(createAppointmentSchema),
  createAppointmentHandler,
);

export const appointmentRoutes = router;
