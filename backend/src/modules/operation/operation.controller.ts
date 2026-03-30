import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendResponse } from '../../utils/api-response.js';
import {
  createOperation,
  deleteOperation,
  getOperations,
  updateOperationStatus,
} from './operation.service.js';

export const createOperationHandler = asyncHandler(async (req: Request, res: Response) => {
  const operation = await createOperation(req.body, req.user!.id);

  sendResponse({
    res,
    statusCode: 201,
    message: 'Operation saved successfully',
    data: operation,
  });
});

export const getOperationsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const operations = await getOperations();

  sendResponse({
    res,
    message: 'Operations fetched successfully',
    data: operations,
  });
});

export const updateOperationStatusHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const operation = await updateOperationStatus(req.params.id, req.body);

  sendResponse({
    res,
    message: 'Operation updated successfully',
    data: operation,
  });
});

export const deleteOperationHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await deleteOperation(req.params.id);

  sendResponse({
    res,
    message: 'Operation deleted successfully',
  });
});
