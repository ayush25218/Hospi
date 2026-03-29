import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendResponse } from '../../utils/api-response.js';
import { createFolder, deleteFileEntry, getFileEntries, uploadFile } from './file-entry.service.js';

export const createFolderHandler = asyncHandler(async (req: Request, res: Response) => {
  const folder = await createFolder(req.body, req.user!.id);

  sendResponse({
    res,
    statusCode: 201,
    message: 'Folder created successfully',
    data: folder,
  });
});

export const uploadFileHandler = asyncHandler(async (req: Request, res: Response) => {
  const fileEntry = await uploadFile(req.file!, req.user!.id);

  sendResponse({
    res,
    statusCode: 201,
    message: 'File uploaded successfully',
    data: fileEntry,
  });
});

export const getFileEntriesHandler = asyncHandler(async (_req: Request, res: Response) => {
  const fileEntries = await getFileEntries();

  sendResponse({
    res,
    message: 'Files fetched successfully',
    data: fileEntries,
  });
});

export const deleteFileEntryHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await deleteFileEntry(req.params.id);

  sendResponse({
    res,
    message: 'File entry deleted successfully',
  });
});
