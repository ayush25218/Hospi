import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { createNoticeHandler, deleteNoticeHandler, getNoticesHandler, updateNoticeHandler } from './notice.controller.js';
import { createNoticeSchema, updateNoticeSchema } from './notice.validation.js';

const router = Router();

router.get('/', auth('admin'), getNoticesHandler);
router.post('/', auth('admin'), validateRequest(createNoticeSchema), createNoticeHandler);
router.patch('/:id', auth('admin'), validateRequest(updateNoticeSchema), updateNoticeHandler);
router.delete('/:id', auth('admin'), deleteNoticeHandler);

export const noticeRoutes = router;
