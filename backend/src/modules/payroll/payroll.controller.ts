import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendResponse } from '../../utils/api-response.js';
import { recordAuditEvent } from '../audit-log/audit-log.service.js';
import { createPayroll, deletePayroll, getPayrolls, updatePayroll } from './payroll.service.js';

export const createPayrollHandler = asyncHandler(async (req: Request, res: Response) => {
  const payroll = await createPayroll(req.body, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'payroll.created',
    entityType: 'payroll',
    entityId: payroll.id,
    summary: `Created payroll ${payroll.payrollNumber}`,
  });

  sendResponse({
    res,
    statusCode: 201,
    message: 'Payroll record created successfully',
    data: payroll,
  });
});

export const getPayrollsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const payrolls = await getPayrolls(_req.user!);

  sendResponse({
    res,
    message: 'Payroll records fetched successfully',
    data: payrolls,
  });
});

export const updatePayrollHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const payroll = await updatePayroll(req.params.id, req.body, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'payroll.updated',
    entityType: 'payroll',
    entityId: payroll.id,
    summary: `Updated payroll ${payroll.payrollNumber} to ${payroll.status}`,
  });

  sendResponse({
    res,
    message: 'Payroll record updated successfully',
    data: payroll,
  });
});

export const deletePayrollHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await deletePayroll(req.params.id, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'payroll.deleted',
    entityType: 'payroll',
    entityId: req.params.id,
    summary: 'Deleted payroll entry',
  });

  sendResponse({
    res,
    message: 'Payroll record deleted successfully',
  });
});
