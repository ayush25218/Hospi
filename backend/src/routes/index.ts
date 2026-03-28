import { Router } from 'express';
import { getDatabaseStatus } from '../db/connect-database.js';
import { appointmentRoutes } from '../modules/appointment/appointment.routes.js';
import { authRoutes } from '../modules/auth/auth.routes.js';
import { doctorRoutes } from '../modules/doctor/doctor.routes.js';
import { patientRoutes } from '../modules/patient/patient.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hospi backend is running',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: getDatabaseStatus(),
    },
  });
});

router.use('/auth', authRoutes);
router.use('/doctors', doctorRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);

export const apiRouter = router;
