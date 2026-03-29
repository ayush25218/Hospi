import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendResponse } from '../../utils/api-response.js';
import { createInvoice, deleteInvoice, getInvoices } from './invoice.service.js';

export const createInvoiceHandler = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await createInvoice(req.body, req.user!.id);

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

  sendResponse({
    res,
    message: 'Invoice deleted successfully',
  });
});
