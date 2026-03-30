import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendResponse } from '../../utils/api-response.js';
import { getAppSettings, updateAppSettings } from './app-setting.service.js';

export const getAppSettingsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await getAppSettings();

  sendResponse({
    res,
    message: 'Application settings fetched successfully',
    data: settings,
  });
});

export const updateAppSettingsHandler = asyncHandler(async (req: Request, res: Response) => {
  const settings = await updateAppSettings(req.body, req.user!.id);

  sendResponse({
    res,
    message: 'Application settings updated successfully',
    data: settings,
  });
});
