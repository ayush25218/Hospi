import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import {
  createContactHandler,
  deleteContactHandler,
  getContactsHandler,
  updateContactHandler,
} from './contact.controller.js';
import { createContactSchema, updateContactSchema } from './contact.validation.js';

const router = Router();

router.get('/', auth('admin'), getContactsHandler);
router.post('/', auth('admin'), validateRequest(createContactSchema), createContactHandler);
router.patch('/:id', auth('admin'), validateRequest(updateContactSchema), updateContactHandler);
router.delete('/:id', auth('admin'), deleteContactHandler);

export const contactRoutes = router;
