import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import {
  createAppointmentHandler,
  getAppointmentByIdHandler,
  getAppointmentsHandler,
  updateAppointmentHandler,
} from './appointment.controller.js';
import { createAppointmentSchema, updateAppointmentSchema } from './appointment.validation.js';

const router = Router();

router.get('/', auth('admin', 'doctor', 'patient'), getAppointmentsHandler);
router.get('/:id', auth('admin'), getAppointmentByIdHandler);
router.post(
  '/',
  auth('admin', 'doctor'),
  validateRequest(createAppointmentSchema),
  createAppointmentHandler,
);
router.patch(
  '/:id',
  auth('admin'),
  validateRequest(updateAppointmentSchema),
  updateAppointmentHandler,
);

export const appointmentRoutes = router;
