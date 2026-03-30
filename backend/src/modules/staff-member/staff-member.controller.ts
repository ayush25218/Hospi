import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendResponse } from '../../utils/api-response.js';
import {
  createStaffMember,
  deleteStaffMember,
  getStaffMembers,
  updateStaffMember,
} from './staff-member.service.js';

export const createStaffMemberHandler = asyncHandler(async (req: Request, res: Response) => {
  const staffMember = await createStaffMember(req.body, req.user!.id);

  sendResponse({
    res,
    statusCode: 201,
    message: 'Staff member created successfully',
    data: staffMember,
  });
});

export const getStaffMembersHandler = asyncHandler(async (_req: Request, res: Response) => {
  const staffMembers = await getStaffMembers();

  sendResponse({
    res,
    message: 'Staff members fetched successfully',
    data: staffMembers,
  });
});

export const updateStaffMemberHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const staffMember = await updateStaffMember(req.params.id, req.body);

  sendResponse({
    res,
    message: 'Staff member updated successfully',
    data: staffMember,
  });
});

export const deleteStaffMemberHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await deleteStaffMember(req.params.id);

  sendResponse({
    res,
    message: 'Staff member deleted successfully',
  });
});
