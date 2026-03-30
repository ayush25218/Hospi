import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import {
  createPayrollHandler,
  deletePayrollHandler,
  getPayrollsHandler,
  updatePayrollHandler,
} from './payroll.controller.js';
import { createPayrollSchema, updatePayrollSchema } from './payroll.validation.js';

const router = Router();

router.get('/', auth('admin'), getPayrollsHandler);
router.post('/', auth('admin'), validateRequest(createPayrollSchema), createPayrollHandler);
router.patch('/:id', auth('admin'), validateRequest(updatePayrollSchema), updatePayrollHandler);
router.delete('/:id', auth('admin'), deletePayrollHandler);

export const payrollRoutes = router;
