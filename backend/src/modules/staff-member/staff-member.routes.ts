import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import {
  createStaffMemberHandler,
  deleteStaffMemberHandler,
  getStaffMembersHandler,
  updateStaffMemberHandler,
} from './staff-member.controller.js';
import { createStaffMemberSchema, updateStaffMemberSchema } from './staff-member.validation.js';

const router = Router();

router.get('/', auth('admin'), getStaffMembersHandler);
router.post('/', auth('admin'), validateRequest(createStaffMemberSchema), createStaffMemberHandler);
router.patch('/:id', auth('admin'), validateRequest(updateStaffMemberSchema), updateStaffMemberHandler);
router.delete('/:id', auth('admin'), deleteStaffMemberHandler);

export const staffMemberRoutes = router;
