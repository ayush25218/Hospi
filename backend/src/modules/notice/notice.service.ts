import type { z } from 'zod';
import { AppError } from '../../utils/app-error.js';
import { NoticeModel } from './notice.model.js';
import type { createNoticeSchema, updateNoticeSchema } from './notice.validation.js';

type CreateNoticePayload = z.infer<typeof createNoticeSchema>['body'];
type UpdateNoticePayload = z.infer<typeof updateNoticeSchema>['body'];

export async function createNotice(payload: CreateNoticePayload, createdBy: string) {
  return NoticeModel.create({
    title: payload.title,
    content: payload.content,
    category: payload.category ?? 'general',
    author: payload.author ?? 'Admin',
    audience: payload.audience ?? 'all-staff',
    isPinned: payload.isPinned ?? false,
    createdBy,
  });
}

export async function getNotices() {
  return NoticeModel.find().populate('createdBy', '-password').sort({ isPinned: -1, createdAt: -1 });
}

export async function updateNotice(noticeId: string, payload: UpdateNoticePayload) {
  const notice = await NoticeModel.findByIdAndUpdate(noticeId, payload, {
    new: true,
    runValidators: true,
  }).populate('createdBy', '-password');

  if (!notice) {
    throw new AppError('Notice not found', 404);
  }

  return notice;
}

export async function deleteNotice(noticeId: string) {
  const deletedNotice = await NoticeModel.findByIdAndDelete(noticeId);

  if (!deletedNotice) {
    throw new AppError('Notice not found', 404);
  }
}
