import { Router } from 'express';
import { getDatabaseStatus } from '../db/connect-database.js';
import { appointmentRoutes } from '../modules/appointment/appointment.routes.js';
import { authRoutes } from '../modules/auth/auth.routes.js';
import { contactRoutes } from '../modules/contact/contact.routes.js';
import { departmentRoutes } from '../modules/department/department.routes.js';
import { doctorRoutes } from '../modules/doctor/doctor.routes.js';
import { expenseRoutes } from '../modules/expense/expense.routes.js';
import { fileEntryRoutes } from '../modules/file-entry/file-entry.routes.js';
import { invoiceRoutes } from '../modules/invoice/invoice.routes.js';
import { leaveRequestRoutes } from '../modules/leave-request/leave-request.routes.js';
import { noticeRoutes } from '../modules/notice/notice.routes.js';
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
router.use('/contacts', contactRoutes);
router.use('/departments', departmentRoutes);
router.use('/doctors', doctorRoutes);
router.use('/expenses', expenseRoutes);
router.use('/files', fileEntryRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/leave-requests', leaveRequestRoutes);
router.use('/notices', noticeRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);

export const apiRouter = router;
