import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { getAppSettingsHandler, updateAppSettingsHandler } from './app-setting.controller.js';
import { updateAppSettingSchema } from './app-setting.validation.js';

const router = Router();

router.get('/', auth('admin'), getAppSettingsHandler);
router.put('/', auth('admin'), validateRequest(updateAppSettingSchema), updateAppSettingsHandler);

export const appSettingRoutes = router;
