import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendResponse } from '../../utils/api-response.js';
import { recordAuditEvent } from '../audit-log/audit-log.service.js';
import {
  createOperation,
  deleteOperation,
  getOperations,
  updateOperationStatus,
} from './operation.service.js';

export const createOperationHandler = asyncHandler(async (req: Request, res: Response) => {
  const operation = await createOperation(req.body, req.user!.id);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'operation.created',
    entityType: 'operation',
    entityId: operation.id,
    summary: `Scheduled operation ${operation.operationName}`,
  });

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

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'operation.updated',
    entityType: 'operation',
    entityId: operation.id,
    summary: `Updated operation ${operation.operationName} to ${operation.status}`,
  });

  sendResponse({
    res,
    message: 'Operation updated successfully',
    data: operation,
  });
});

export const deleteOperationHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await deleteOperation(req.params.id);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'operation.deleted',
    entityType: 'operation',
    entityId: req.params.id,
    summary: 'Deleted operation entry',
  });

  sendResponse({
    res,
    message: 'Operation deleted successfully',
  });
});
