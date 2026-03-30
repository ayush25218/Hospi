import type { z } from 'zod';
import { AppError } from '../../utils/app-error.js';
import type {
  createStaffMemberSchema,
  updateStaffMemberSchema,
} from './staff-member.validation.js';
import { StaffMemberModel } from './staff-member.model.js';

type CreateStaffMemberPayload = z.infer<typeof createStaffMemberSchema>['body'];
type UpdateStaffMemberPayload = z.infer<typeof updateStaffMemberSchema>['body'];

export async function createStaffMember(payload: CreateStaffMemberPayload, createdBy: string) {
  const staffMember = await StaffMemberModel.create({
    staffId: payload.staffId ?? buildStaffId(),
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    department: payload.department,
    role: payload.role,
    status: payload.status ?? 'active',
    joinedAt: payload.joinedAt ? new Date(payload.joinedAt) : new Date(),
    photoUrl: payload.photoUrl,
    notes: payload.notes,
    createdBy,
  });

  return getStaffMemberById(staffMember.id);
}

export async function getStaffMembers() {
  return StaffMemberModel.find().populate('createdBy', '-password').sort({ createdAt: -1 });
}

export async function updateStaffMember(staffMemberId: string, payload: UpdateStaffMemberPayload) {
  const staffMember = await StaffMemberModel.findByIdAndUpdate(
    staffMemberId,
    {
      ...(payload.staffId ? { staffId: payload.staffId } : {}),
      ...(payload.name ? { name: payload.name } : {}),
      ...(payload.email ? { email: payload.email } : {}),
      ...(payload.phone ? { phone: payload.phone } : {}),
      ...(payload.department ? { department: payload.department } : {}),
      ...(payload.role ? { role: payload.role } : {}),
      ...(payload.status ? { status: payload.status } : {}),
      ...(payload.joinedAt ? { joinedAt: new Date(payload.joinedAt) } : {}),
      ...(payload.photoUrl !== undefined ? { photoUrl: payload.photoUrl || undefined } : {}),
      ...(payload.notes !== undefined ? { notes: payload.notes || undefined } : {}),
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate('createdBy', '-password');

  if (!staffMember) {
    throw new AppError('Staff member not found', 404);
  }

  return staffMember;
}

export async function deleteStaffMember(staffMemberId: string) {
  const deletedStaffMember = await StaffMemberModel.findByIdAndDelete(staffMemberId);

  if (!deletedStaffMember) {
    throw new AppError('Staff member not found', 404);
  }
}

async function getStaffMemberById(staffMemberId: string) {
  const staffMember = await StaffMemberModel.findById(staffMemberId).populate('createdBy', '-password');

  if (!staffMember) {
    throw new AppError('Staff member not found', 404);
  }

  return staffMember;
}

function buildStaffId() {
  const randomPart = Math.floor(Math.random() * 900 + 100);
  return `STF-${Date.now().toString().slice(-6)}-${randomPart}`;
}
