import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendResponse } from '../../utils/api-response.js';
import { getAuditLogs } from './audit-log.service.js';

export const getAuditLogsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const auditLogs = await getAuditLogs();

  sendResponse({
    res,
    message: 'Audit logs fetched successfully',
    data: auditLogs,
  });
});
