import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendResponse } from '../../utils/api-response.js';
import {
  createLeaveRequest,
  deleteLeaveRequest,
  getLeaveRequests,
  updateLeaveRequestStatus,
} from './leave-request.service.js';

export const createLeaveRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const leaveRequest = await createLeaveRequest(req.body, req.user!.id);

  sendResponse({
    res,
    statusCode: 201,
    message: 'Leave request created successfully',
    data: leaveRequest,
  });
});

export const getLeaveRequestsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const leaveRequests = await getLeaveRequests();

  sendResponse({
    res,
    message: 'Leave requests fetched successfully',
    data: leaveRequests,
  });
});

export const updateLeaveRequestStatusHandler = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
  const leaveRequest = await updateLeaveRequestStatus(req.params.id, req.body);

  sendResponse({
    res,
    message: 'Leave request updated successfully',
    data: leaveRequest,
  });
  },
);

export const deleteLeaveRequestHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await deleteLeaveRequest(req.params.id);

  sendResponse({
    res,
    message: 'Leave request deleted successfully',
  });
});
