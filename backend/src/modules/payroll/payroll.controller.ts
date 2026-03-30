import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendResponse } from '../../utils/api-response.js';
import { createPayroll, deletePayroll, getPayrolls, updatePayroll } from './payroll.service.js';

export const createPayrollHandler = asyncHandler(async (req: Request, res: Response) => {
  const payroll = await createPayroll(req.body, req.user!.id);

  sendResponse({
    res,
    statusCode: 201,
    message: 'Payroll record created successfully',
    data: payroll,
  });
});

export const getPayrollsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const payrolls = await getPayrolls();

  sendResponse({
    res,
    message: 'Payroll records fetched successfully',
    data: payrolls,
  });
});

export const updatePayrollHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const payroll = await updatePayroll(req.params.id, req.body);

  sendResponse({
    res,
    message: 'Payroll record updated successfully',
    data: payroll,
  });
});

export const deletePayrollHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await deletePayroll(req.params.id);

  sendResponse({
    res,
    message: 'Payroll record deleted successfully',
  });
});
