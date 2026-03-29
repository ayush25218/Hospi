import { Router } from 'express';
import { auth } from '../../middlewares/auth.js';
import { upload } from '../../middlewares/upload.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import {
  createFolderHandler,
  deleteFileEntryHandler,
  getFileEntriesHandler,
  uploadFileHandler,
} from './file-entry.controller.js';
import { createFolderSchema } from './file-entry.validation.js';

const router = Router();

router.get('/', auth('admin'), getFileEntriesHandler);
router.post('/folders', auth('admin'), validateRequest(createFolderSchema), createFolderHandler);
router.post('/upload', auth('admin'), upload.single('file'), uploadFileHandler);
router.delete('/:id', auth('admin'), deleteFileEntryHandler);

export const fileEntryRoutes = router;
