import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import {
  createPaymentHandler,
  deletePaymentHandler,
  getPaymentsHandler,
  updatePaymentHandler,
} from './payment.controller.js';
import { createPaymentSchema, updatePaymentSchema } from './payment.validation.js';

const router = Router();

router.get('/', auth('admin'), getPaymentsHandler);
router.post('/', auth('admin'), validateRequest(createPaymentSchema), createPaymentHandler);
router.patch('/:id', auth('admin'), validateRequest(updatePaymentSchema), updatePaymentHandler);
router.delete('/:id', auth('admin'), deletePaymentHandler);

export const paymentRoutes = router;
