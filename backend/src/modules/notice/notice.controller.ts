import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendResponse } from '../../utils/api-response.js';
import { createNotice, deleteNotice, getNotices, updateNotice } from './notice.service.js';

export const createNoticeHandler = asyncHandler(async (req: Request, res: Response) => {
  const notice = await createNotice(req.body, req.user!.id);

  sendResponse({
    res,
    statusCode: 201,
    message: 'Notice created successfully',
    data: notice,
  });
});

export const getNoticesHandler = asyncHandler(async (_req: Request, res: Response) => {
  const notices = await getNotices();

  sendResponse({
    res,
    message: 'Notices fetched successfully',
    data: notices,
  });
});

export const updateNoticeHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const notice = await updateNotice(req.params.id, req.body);

  sendResponse({
    res,
    message: 'Notice updated successfully',
    data: notice,
  });
});

export const deleteNoticeHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await deleteNotice(req.params.id);

  sendResponse({
    res,
    message: 'Notice deleted successfully',
  });
});
