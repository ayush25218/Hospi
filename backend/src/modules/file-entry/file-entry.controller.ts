import fs from 'node:fs/promises';
import path from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { AppError } from '../../utils/app-error.js';
import { sendResponse } from '../../utils/api-response.js';
import { recordAuditEvent } from '../audit-log/audit-log.service.js';
import {
  createFolder,
  deleteFileEntry,
  getFileEntries,
  getFileEntryContent,
  uploadFile,
} from './file-entry.service.js';

export const createFolderHandler = asyncHandler(async (req: Request, res: Response) => {
  const folder = await createFolder(req.body, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'file.folder.created',
    entityType: 'file-entry',
    entityId: folder.id,
    summary: `Created folder ${folder.name}`,
    metadata: {
      visibility: folder.visibility,
    },
  });

  sendResponse({
    res,
    statusCode: 201,
    message: 'Folder created successfully',
    data: folder,
  });
});

export const uploadFileHandler = asyncHandler(async (req: Request, res: Response) => {
  const visibility = req.body.visibility as
    | 'admin'
    | 'doctor'
    | 'patient'
    | 'clinical'
    | 'authenticated'
    | undefined;
  const fileEntry = await uploadFile(req.file!, req.user!, visibility ?? 'admin');

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'file.uploaded',
    entityType: 'file-entry',
    entityId: fileEntry.id,
    summary: `Uploaded file ${fileEntry.name}`,
    metadata: {
      visibility: fileEntry.visibility,
    },
  });

  sendResponse({
    res,
    statusCode: 201,
    message: 'File uploaded successfully',
    data: fileEntry,
  });
});

export const getFileEntriesHandler = asyncHandler(async (_req: Request, res: Response) => {
  const fileEntries = await getFileEntries(_req.user!);

  sendResponse({
    res,
    message: 'Files fetched successfully',
    data: fileEntries,
  });
});

export const getFileContentHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  const fileEntry = await getFileEntryContent(req.params.id, req.user!);
  const resolvedPath = path.resolve(fileEntry.storagePath!);

  try {
    await fs.access(resolvedPath);
  } catch {
    throw new AppError('Stored file is missing on disk', 404);
  }

  if (fileEntry.mimeType) {
    res.setHeader('Content-Type', fileEntry.mimeType);
  }

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'file.opened',
    entityType: 'file-entry',
    entityId: fileEntry.id,
    summary: `Opened file ${fileEntry.name}`,
  });

  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileEntry.name)}"`);
  res.sendFile(resolvedPath, (error) => {
    if (error) {
      next(error);
    }
  });
});

export const deleteFileEntryHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await deleteFileEntry(req.params.id, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'file.deleted',
    entityType: 'file-entry',
    entityId: req.params.id,
    summary: 'Deleted file entry',
  });

  sendResponse({
    res,
    message: 'File entry deleted successfully',
  });
});
