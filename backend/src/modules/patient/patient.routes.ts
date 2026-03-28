import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import {
  createPatientHandler,
  getMyPatientProfileHandler,
  getPatientsHandler,
} from './patient.controller.js';
import { createPatientSchema } from './patient.validation.js';

const router = Router();

router.get('/', auth('admin', 'doctor'), getPatientsHandler);
router.get('/me', auth('patient'), getMyPatientProfileHandler);
router.post('/', auth('admin'), validateRequest(createPatientSchema), createPatientHandler);

export const patientRoutes = router;
