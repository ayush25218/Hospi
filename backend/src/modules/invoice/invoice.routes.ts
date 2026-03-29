import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { createInvoiceHandler, deleteInvoiceHandler, getInvoicesHandler } from './invoice.controller.js';
import { createInvoiceSchema } from './invoice.validation.js';

const router = Router();

router.get('/', auth('admin'), getInvoicesHandler);
router.post('/', auth('admin'), validateRequest(createInvoiceSchema), createInvoiceHandler);
router.delete('/:id', auth('admin'), deleteInvoiceHandler);

export const invoiceRoutes = router;
