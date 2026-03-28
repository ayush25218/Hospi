import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import {
  createDoctorHandler,
  getDoctorsHandler,
  getMyDoctorProfileHandler,
} from './doctor.controller.js';
import { createDoctorSchema } from './doctor.validation.js';

const router = Router();

router.get('/', auth('admin', 'doctor'), getDoctorsHandler);
router.get('/me', auth('doctor'), getMyDoctorProfileHandler);
router.post('/', auth('admin'), validateRequest(createDoctorSchema), createDoctorHandler);

export const doctorRoutes = router;
