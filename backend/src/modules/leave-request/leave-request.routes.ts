import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import {
  createLeaveRequestHandler,
  deleteLeaveRequestHandler,
  getLeaveRequestsHandler,
  updateLeaveRequestStatusHandler,
} from './leave-request.controller.js';
import {
  createLeaveRequestSchema,
  updateLeaveRequestStatusSchema,
} from './leave-request.validation.js';

const router = Router();

router.get('/', auth('admin'), getLeaveRequestsHandler);
router.post('/', auth('admin'), validateRequest(createLeaveRequestSchema), createLeaveRequestHandler);
router.patch(
  '/:id/status',
  auth('admin'),
  validateRequest(updateLeaveRequestStatusSchema),
  updateLeaveRequestStatusHandler,
);
router.delete('/:id', auth('admin'), deleteLeaveRequestHandler);

export const leaveRequestRoutes = router;
