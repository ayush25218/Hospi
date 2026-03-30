import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { getAuditLogsHandler } from './audit-log.controller.js';

const router = Router();

router.get('/', auth('admin'), getAuditLogsHandler);

export const auditLogRoutes = router;
