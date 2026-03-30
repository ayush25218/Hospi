import fs from 'node:fs/promises';
import path from 'node:path';
import type { z } from 'zod';
import { AppError } from '../../utils/app-error.js';
import { FileEntryModel } from './file-entry.model.js';
import type { createFolderSchema } from './file-entry.validation.js';

type CreateFolderPayload = z.infer<typeof createFolderSchema>['body'];

export async function createFolder(payload: CreateFolderPayload, createdBy: string) {
  return FileEntryModel.create({
    kind: 'folder',
    name: payload.name,
    visibility: payload.visibility ?? 'admin',
    createdBy,
  });
}

export async function uploadFile(
  file: Express.Multer.File,
  createdBy: string,
  visibility: 'admin' | 'doctor' | 'patient' | 'clinical' | 'authenticated' = 'admin',
) {
  if (!file) {
    throw new AppError('File is required', 400);
  }

  return FileEntryModel.create({
    kind: 'file',
    name: file.originalname,
    fileType: resolveFileType(file.mimetype, file.originalname),
    sizeBytes: file.size,
    mimeType: file.mimetype,
    extension: path.extname(file.originalname).replace('.', '').toLowerCase(),
    storagePath: file.path,
    visibility,
    createdBy,
  });
}

export async function getFileEntries(
  actorRole: 'admin' | 'doctor' | 'patient',
) {
  const query =
    actorRole === 'admin'
      ? {}
      : {
          visibility: {
            $in:
              actorRole === 'doctor'
                ? ['doctor', 'clinical', 'authenticated']
                : ['patient', 'authenticated'],
          },
        };

  return FileEntryModel.find(query).populate('createdBy', '-password').sort({ kind: 1, createdAt: -1 });
}

export async function getFileEntryContent(fileEntryId: string, actorRole: 'admin' | 'doctor' | 'patient') {
  const fileEntry = await FileEntryModel.findById(fileEntryId);

  if (!fileEntry || fileEntry.kind !== 'file' || !fileEntry.storagePath) {
    throw new AppError('File not found', 404);
  }

  if (!canAccessFileEntry(fileEntry.visibility ?? 'admin', actorRole)) {
    throw new AppError('You are not allowed to access this file', 403);
  }

  return fileEntry;
}

export async function deleteFileEntry(fileEntryId: string) {
  const deletedFileEntry = await FileEntryModel.findByIdAndDelete(fileEntryId);

  if (!deletedFileEntry) {
    throw new AppError('File entry not found', 404);
  }

  if (deletedFileEntry.kind === 'file' && deletedFileEntry.storagePath) {
    try {
      await fs.unlink(deletedFileEntry.storagePath);
    } catch {
      // Ignore missing files on disk to keep metadata deletion resilient.
    }
  }
}

function resolveFileType(mimeType: string, fileName: string) {
  const extension = path.extname(fileName).toLowerCase();

  if (mimeType.includes('pdf') || extension === '.pdf') {
    return 'pdf';
  }

  if (mimeType.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension)) {
    return 'image';
  }

  if (
    ['.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt'].includes(extension) ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('word')
  ) {
    return 'doc';
  }

  return 'other';
}

function canAccessFileEntry(
  visibility: 'admin' | 'doctor' | 'patient' | 'clinical' | 'authenticated',
  actorRole: 'admin' | 'doctor' | 'patient',
) {
  if (actorRole === 'admin') {
    return true;
  }

  if (visibility === 'authenticated') {
    return true;
  }

  if (visibility === 'clinical') {
    return actorRole === 'doctor';
  }

  return visibility === actorRole;
}
