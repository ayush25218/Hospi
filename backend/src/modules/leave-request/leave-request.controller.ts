import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendResponse } from '../../utils/api-response.js';
import { recordAuditEvent } from '../audit-log/audit-log.service.js';
import {
  createLeaveRequest,
  deleteLeaveRequest,
  getLeaveRequests,
  updateLeaveRequestStatus,
} from './leave-request.service.js';

export const createLeaveRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const leaveRequest = await createLeaveRequest(req.body, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'leave-request.created',
    entityType: 'leave-request',
    entityId: leaveRequest.id,
    summary: `Created leave request for ${leaveRequest.name}`,
  });

  sendResponse({
    res,
    statusCode: 201,
    message: 'Leave request created successfully',
    data: leaveRequest,
  });
});

export const getLeaveRequestsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const leaveRequests = await getLeaveRequests(_req.user!);

  sendResponse({
    res,
    message: 'Leave requests fetched successfully',
    data: leaveRequests,
  });
});

export const updateLeaveRequestStatusHandler = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
  const leaveRequest = await updateLeaveRequestStatus(req.params.id, req.body, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'leave-request.updated',
    entityType: 'leave-request',
    entityId: leaveRequest.id,
    summary: `Updated leave request status for ${leaveRequest.name} to ${leaveRequest.status}`,
  });

  sendResponse({
    res,
    message: 'Leave request updated successfully',
    data: leaveRequest,
  });
  },
);

export const deleteLeaveRequestHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await deleteLeaveRequest(req.params.id, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'leave-request.deleted',
    entityType: 'leave-request',
    entityId: req.params.id,
    summary: 'Deleted leave request entry',
  });

  sendResponse({
    res,
    message: 'Leave request deleted successfully',
  });
});
