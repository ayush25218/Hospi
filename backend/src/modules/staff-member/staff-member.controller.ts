import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendResponse } from '../../utils/api-response.js';
import { recordAuditEvent } from '../audit-log/audit-log.service.js';
import {
  createStaffMember,
  deleteStaffMember,
  getStaffMembers,
  updateStaffMember,
} from './staff-member.service.js';

export const createStaffMemberHandler = asyncHandler(async (req: Request, res: Response) => {
  const staffMember = await createStaffMember(req.body, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'staff-member.created',
    entityType: 'staff-member',
    entityId: staffMember.id,
    summary: `Created staff member ${staffMember.name}`,
  });

  sendResponse({
    res,
    statusCode: 201,
    message: 'Staff member created successfully',
    data: staffMember,
  });
});

export const getStaffMembersHandler = asyncHandler(async (_req: Request, res: Response) => {
  const staffMembers = await getStaffMembers(_req.user!);

  sendResponse({
    res,
    message: 'Staff members fetched successfully',
    data: staffMembers,
  });
});

export const updateStaffMemberHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const staffMember = await updateStaffMember(req.params.id, req.body, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'staff-member.updated',
    entityType: 'staff-member',
    entityId: staffMember.id,
    summary: `Updated staff member ${staffMember.name}`,
  });

  sendResponse({
    res,
    message: 'Staff member updated successfully',
    data: staffMember,
  });
});

export const deleteStaffMemberHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await deleteStaffMember(req.params.id, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'staff-member.deleted',
    entityType: 'staff-member',
    entityId: req.params.id,
    summary: 'Deleted staff member entry',
  });

  sendResponse({
    res,
    message: 'Staff member deleted successfully',
  });
});
