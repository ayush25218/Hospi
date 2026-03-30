import type { z } from 'zod';
import type { AuthenticatedUser } from '../../types/authenticated-user.js';
import { AppError } from '../../utils/app-error.js';
import { getOrganizationUserIds } from '../../utils/organization-scope.js';
import { NoticeModel } from './notice.model.js';
import type { createNoticeSchema, updateNoticeSchema } from './notice.validation.js';

type CreateNoticePayload = z.infer<typeof createNoticeSchema>['body'];
type UpdateNoticePayload = z.infer<typeof updateNoticeSchema>['body'];

export async function createNotice(payload: CreateNoticePayload, actor: AuthenticatedUser) {
  return NoticeModel.create({
    title: payload.title,
    content: payload.content,
    category: payload.category ?? 'general',
    author: payload.author ?? 'Admin',
    audience: payload.audience ?? 'all-staff',
    isPinned: payload.isPinned ?? false,
    createdBy: actor.id,
  });
}

export async function getNotices(actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  return NoticeModel.find({ createdBy: { $in: organizationUserIds } }).populate('createdBy', '-password').sort({ isPinned: -1, createdAt: -1 });
}

export async function updateNotice(noticeId: string, payload: UpdateNoticePayload, actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  const notice = await NoticeModel.findOneAndUpdate(
    { _id: noticeId, createdBy: { $in: organizationUserIds } },
    payload,
    {
      new: true,
      runValidators: true,
    },
  ).populate('createdBy', '-password');

  if (!notice) {
    throw new AppError('Notice not found', 404);
  }

  return notice;
}

export async function deleteNotice(noticeId: string, actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  const deletedNotice = await NoticeModel.findOneAndDelete({
    _id: noticeId,
    createdBy: { $in: organizationUserIds },
  });

  if (!deletedNotice) {
    throw new AppError('Notice not found', 404);
  }
}
