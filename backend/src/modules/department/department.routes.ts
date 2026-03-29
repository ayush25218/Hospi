import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import {
  createDepartmentHandler,
  deleteDepartmentHandler,
  getDepartmentsHandler,
  updateDepartmentHandler,
} from './department.controller.js';
import { createDepartmentSchema, updateDepartmentSchema } from './department.validation.js';

const router = Router();

router.get('/', auth('admin'), getDepartmentsHandler);
router.post('/', auth('admin'), validateRequest(createDepartmentSchema), createDepartmentHandler);
router.patch('/:id', auth('admin'), validateRequest(updateDepartmentSchema), updateDepartmentHandler);
router.delete('/:id', auth('admin'), deleteDepartmentHandler);

export const departmentRoutes = router;
