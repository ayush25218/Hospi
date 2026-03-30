import fs from 'node:fs/promises';
import path from 'node:path';
import type { z } from 'zod';
import type { AuthenticatedUser } from '../../types/authenticated-user.js';
import { AppError } from '../../utils/app-error.js';
import { getOrganizationUserIds } from '../../utils/organization-scope.js';
import { FileEntryModel } from './file-entry.model.js';
import type { createFolderSchema } from './file-entry.validation.js';

type CreateFolderPayload = z.infer<typeof createFolderSchema>['body'];

export async function createFolder(payload: CreateFolderPayload, actor: AuthenticatedUser) {
  return FileEntryModel.create({
    kind: 'folder',
    name: payload.name,
    visibility: payload.visibility ?? 'admin',
    createdBy: actor.id,
  });
}

export async function uploadFile(
  file: Express.Multer.File,
  actor: AuthenticatedUser,
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
    createdBy: actor.id,
  });
}

export async function getFileEntries(actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  return FileEntryModel.find({ createdBy: { $in: organizationUserIds } }).populate('createdBy', '-password').sort({ kind: 1, createdAt: -1 });
}

export async function getFileEntryContent(fileEntryId: string, actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  const fileEntry = await FileEntryModel.findOne({
    _id: fileEntryId,
    createdBy: { $in: organizationUserIds },
  });

  if (!fileEntry || fileEntry.kind !== 'file' || !fileEntry.storagePath) {
    throw new AppError('File not found', 404);
  }

  return fileEntry;
}

export async function deleteFileEntry(fileEntryId: string, actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  const deletedFileEntry = await FileEntryModel.findOneAndDelete({
    _id: fileEntryId,
    createdBy: { $in: organizationUserIds },
  });

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
