import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendResponse } from '../../utils/api-response.js';
import { recordAuditEvent } from '../audit-log/audit-log.service.js';
import { createInvoice, deleteInvoice, getInvoices } from './invoice.service.js';

export const createInvoiceHandler = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await createInvoice(req.body, req.user!.id);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'invoice.created',
    entityType: 'invoice',
    entityId: invoice?.id ?? invoice?._id?.toString(),
    summary: `Created invoice ${invoice?.invoiceNumber ?? ''}`.trim(),
  });

  sendResponse({
    res,
    statusCode: 201,
    message: 'Invoice created successfully',
    data: invoice,
  });
});

export const getInvoicesHandler = asyncHandler(async (_req: Request, res: Response) => {
  const invoices = await getInvoices();

  sendResponse({
    res,
    message: 'Invoices fetched successfully',
    data: invoices,
  });
});

export const deleteInvoiceHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await deleteInvoice(req.params.id);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'invoice.deleted',
    entityType: 'invoice',
    entityId: req.params.id,
    summary: 'Deleted invoice entry',
  });

  sendResponse({
    res,
    message: 'Invoice deleted successfully',
  });
});
