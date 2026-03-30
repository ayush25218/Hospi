import type { z } from 'zod';
import type { AuthenticatedUser } from '../../types/authenticated-user.js';
import { AppError } from '../../utils/app-error.js';
import { getOrganizationUserIds } from '../../utils/organization-scope.js';
import { LeaveRequestModel } from './leave-request.model.js';
import type {
  createLeaveRequestSchema,
  updateLeaveRequestStatusSchema,
} from './leave-request.validation.js';

type CreateLeaveRequestPayload = z.infer<typeof createLeaveRequestSchema>['body'];
type UpdateLeaveRequestStatusPayload = z.infer<typeof updateLeaveRequestStatusSchema>['body'];

export async function createLeaveRequest(payload: CreateLeaveRequestPayload, actor: AuthenticatedUser) {
  return LeaveRequestModel.create({
    name: payload.name,
    email: payload.email,
    department: payload.department,
    leaveType: payload.leaveType,
    fromDate: new Date(payload.fromDate),
    toDate: new Date(payload.toDate),
    reason: payload.reason,
    createdBy: actor.id,
  });
}

export async function getLeaveRequests(actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  return LeaveRequestModel.find({ createdBy: { $in: organizationUserIds } }).populate('createdBy', '-password').sort({ createdAt: -1 });
}

export async function updateLeaveRequestStatus(
  leaveRequestId: string,
  payload: UpdateLeaveRequestStatusPayload,
  actor: AuthenticatedUser,
) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  const leaveRequest = await LeaveRequestModel.findOneAndUpdate(
    { _id: leaveRequestId, createdBy: { $in: organizationUserIds } },
    { status: payload.status },
    { new: true, runValidators: true },
  ).populate('createdBy', '-password');

  if (!leaveRequest) {
    throw new AppError('Leave request not found', 404);
  }

  return leaveRequest;
}

export async function deleteLeaveRequest(leaveRequestId: string, actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  const deletedLeaveRequest = await LeaveRequestModel.findOneAndDelete({
    _id: leaveRequestId,
    createdBy: { $in: organizationUserIds },
  });

  if (!deletedLeaveRequest) {
    throw new AppError('Leave request not found', 404);
  }
}
