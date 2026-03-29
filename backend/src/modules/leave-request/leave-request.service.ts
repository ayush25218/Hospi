import type { z } from 'zod';
import { AppError } from '../../utils/app-error.js';
import { LeaveRequestModel } from './leave-request.model.js';
import type {
  createLeaveRequestSchema,
  updateLeaveRequestStatusSchema,
} from './leave-request.validation.js';

type CreateLeaveRequestPayload = z.infer<typeof createLeaveRequestSchema>['body'];
type UpdateLeaveRequestStatusPayload = z.infer<typeof updateLeaveRequestStatusSchema>['body'];

export async function createLeaveRequest(payload: CreateLeaveRequestPayload, createdBy: string) {
  return LeaveRequestModel.create({
    name: payload.name,
    email: payload.email,
    department: payload.department,
    leaveType: payload.leaveType,
    fromDate: new Date(payload.fromDate),
    toDate: new Date(payload.toDate),
    reason: payload.reason,
    createdBy,
  });
}

export async function getLeaveRequests() {
  return LeaveRequestModel.find().populate('createdBy', '-password').sort({ createdAt: -1 });
}

export async function updateLeaveRequestStatus(
  leaveRequestId: string,
  payload: UpdateLeaveRequestStatusPayload,
) {
  const leaveRequest = await LeaveRequestModel.findByIdAndUpdate(
    leaveRequestId,
    { status: payload.status },
    { new: true, runValidators: true },
  ).populate('createdBy', '-password');

  if (!leaveRequest) {
    throw new AppError('Leave request not found', 404);
  }

  return leaveRequest;
}

export async function deleteLeaveRequest(leaveRequestId: string) {
  const deletedLeaveRequest = await LeaveRequestModel.findByIdAndDelete(leaveRequestId);

  if (!deletedLeaveRequest) {
    throw new AppError('Leave request not found', 404);
  }
}
