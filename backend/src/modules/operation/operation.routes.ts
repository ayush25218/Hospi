import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import {
  createOperationHandler,
  deleteOperationHandler,
  getOperationsHandler,
  updateOperationStatusHandler,
} from './operation.controller.js';
import { createOperationSchema, updateOperationStatusSchema } from './operation.validation.js';

const router = Router();

router.get('/', auth('admin'), getOperationsHandler);
router.post('/', auth('admin'), validateRequest(createOperationSchema), createOperationHandler);
router.patch('/:id/status', auth('admin'), validateRequest(updateOperationStatusSchema), updateOperationStatusHandler);
router.delete('/:id', auth('admin'), deleteOperationHandler);

export const operationRoutes = router;
