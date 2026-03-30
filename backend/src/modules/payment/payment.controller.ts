import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendResponse } from '../../utils/api-response.js';
import { recordAuditEvent } from '../audit-log/audit-log.service.js';
import { createPayment, deletePayment, getPayments, updatePayment } from './payment.service.js';

export const createPaymentHandler = asyncHandler(async (req: Request, res: Response) => {
  const payment = await createPayment(req.body, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'payment.created',
    entityType: 'payment',
    entityId: payment.id,
    summary: `Created payment ${payment.paymentNumber}`,
  });

  sendResponse({
    res,
    statusCode: 201,
    message: 'Payment created successfully',
    data: payment,
  });
});

export const getPaymentsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const payments = await getPayments(_req.user!);

  sendResponse({
    res,
    message: 'Payments fetched successfully',
    data: payments,
  });
});

export const updatePaymentHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const payment = await updatePayment(req.params.id, req.body, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'payment.updated',
    entityType: 'payment',
    entityId: payment.id,
    summary: `Updated payment ${payment.paymentNumber} to ${payment.status}`,
  });

  sendResponse({
    res,
    message: 'Payment updated successfully',
    data: payment,
  });
});

export const deletePaymentHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await deletePayment(req.params.id, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'payment.deleted',
    entityType: 'payment',
    entityId: req.params.id,
    summary: 'Deleted payment entry',
  });

  sendResponse({
    res,
    message: 'Payment deleted successfully',
  });
});
