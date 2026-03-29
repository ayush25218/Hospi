import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendResponse } from '../../utils/api-response.js';
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from './department.service.js';

export const createDepartmentHandler = asyncHandler(async (req: Request, res: Response) => {
  const department = await createDepartment(req.body, req.user!.id);

  sendResponse({
    res,
    statusCode: 201,
    message: 'Department created successfully',
    data: department,
  });
});

export const getDepartmentsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const departments = await getDepartments();

  sendResponse({
    res,
    message: 'Departments fetched successfully',
    data: departments,
  });
});

export const updateDepartmentHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const department = await updateDepartment(req.params.id, req.body);

  sendResponse({
    res,
    message: 'Department updated successfully',
    data: department,
  });
});

export const deleteDepartmentHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await deleteDepartment(req.params.id);

  sendResponse({
    res,
    message: 'Department deleted successfully',
  });
});
