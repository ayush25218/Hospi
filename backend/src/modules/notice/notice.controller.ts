import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendResponse } from '../../utils/api-response.js';
import { recordAuditEvent } from '../audit-log/audit-log.service.js';
import { createNotice, deleteNotice, getNotices, updateNotice } from './notice.service.js';

export const createNoticeHandler = asyncHandler(async (req: Request, res: Response) => {
  const notice = await createNotice(req.body, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'notice.created',
    entityType: 'notice',
    entityId: notice.id,
    summary: `Created notice ${notice.title}`,
  });

  sendResponse({
    res,
    statusCode: 201,
    message: 'Notice created successfully',
    data: notice,
  });
});

export const getNoticesHandler = asyncHandler(async (_req: Request, res: Response) => {
  const notices = await getNotices(_req.user!);

  sendResponse({
    res,
    message: 'Notices fetched successfully',
    data: notices,
  });
});

export const updateNoticeHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const notice = await updateNotice(req.params.id, req.body, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'notice.updated',
    entityType: 'notice',
    entityId: notice.id,
    summary: `Updated notice ${notice.title}`,
  });

  sendResponse({
    res,
    message: 'Notice updated successfully',
    data: notice,
  });
});

export const deleteNoticeHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await deleteNotice(req.params.id, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'notice.deleted',
    entityType: 'notice',
    entityId: req.params.id,
    summary: 'Deleted notice entry',
  });

  sendResponse({
    res,
    message: 'Notice deleted successfully',
  });
});
