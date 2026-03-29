'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LuExternalLink,
  LuFile,
  LuFileArchive,
  LuFileImage,
  LuFileSpreadsheet,
  LuFolder,
  LuFolderPlus,
  LuSearch,
  LuTrash2,
  LuUpload,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { useSession } from '@/hooks/use-session';
import {
  apiRequest,
  describeError,
  formatBytes,
  formatDate,
  getBackendOrigin,
  type FileEntryKind,
  type FileEntryRecord,
  type FileEntryType,
} from '@/lib/api-client';

export default function FilesPage() {
  const session = useSession();
  const [entries, setEntries] = useState<FileEntryRecord[]>([]);
  const [folderName, setFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | FileEntryKind>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.token) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadEntries = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await apiRequest<FileEntryRecord[]>('/files', {}, session);

        if (isActive) {
          setEntries(response);
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load file entries right now.'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadEntries();

    return () => {
      isActive = false;
    };
  }, [session]);

  const filteredEntries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return entries.filter((entry) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        entry.name.toLowerCase().includes(normalizedSearch) ||
        entry.extension?.toLowerCase().includes(normalizedSearch);

      const matchesKind = kindFilter === 'all' || entry.kind === kindFilter;
      return matchesSearch && matchesKind;
    });
  }, [entries, kindFilter, searchTerm]);

  const summary = useMemo(() => {
    return entries.reduce(
      (accumulator, entry) => {
        if (entry.kind === 'folder') {
          accumulator.folders += 1;
        } else {
          accumulator.files += 1;
          accumulator.bytes += entry.sizeBytes;
        }

        return accumulator;
      },
      { folders: 0, files: 0, bytes: 0 },
    );
  }, [entries]);

  const handleCreateFolder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.token) {
      setError('Your admin session is missing its backend token. Sign in again from the admin login page.');
      return;
    }

    setIsCreatingFolder(true);
    setError('');

    try {
      const createdFolder = await apiRequest<FileEntryRecord>(
        '/files/folders',
        {
          method: 'POST',
          body: JSON.stringify({
            name: folderName.trim(),
          }),
        },
        session,
      );

      setEntries((current) => [createdFolder, ...current]);
      setFolderName('');
    } catch (creationError) {
      setError(describeError(creationError, 'Unable to create this folder right now.'));
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.token) {
      setError('Your admin session is missing its backend token. Sign in again from the admin login page.');
      return;
    }

    if (!selectedFile) {
      setError('Choose a file to upload first.');
      return;
    }

    const body = new FormData();
    body.append('file', selectedFile);

    setIsUploading(true);
    setError('');

    try {
      const uploadedFile = await apiRequest<FileEntryRecord>(
        '/files/upload',
        {
          method: 'POST',
          body,
        },
        session,
      );

      setEntries((current) => [uploadedFile, ...current]);
      setSelectedFile(null);
      const fileInput = document.getElementById('file-upload-input') as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = '';
      }
    } catch (uploadError) {
      setError(describeError(uploadError, 'Unable to upload this file right now.'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!session?.token) {
      return;
    }

    const confirmed = window.confirm('Delete this file entry?');

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest<null>(
        `/files/${entryId}`,
        {
          method: 'DELETE',
        },
        session,
      );

      setEntries((current) => current.filter((entry) => entry._id !== entryId));
    } catch (deleteError) {
      setError(describeError(deleteError, 'Unable to delete this file entry right now.'));
    }
  };

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="File entries now load from MongoDB. Sign in again through the admin portal to manage uploads and folders."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
            <LuFileArchive className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Files</h1>
            <p className="mt-1 text-sm text-slate-500">
              Upload documents, create folders, and keep admin records organized in one workspace.
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="space-y-6">
          <form onSubmit={handleCreateFolder} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <LuFolderPlus className="h-5 w-5 text-cyan-600" />
              <h2 className="text-xl font-semibold text-slate-950">Create folder</h2>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 text-sm font-medium text-slate-700">Folder name</span>
                <input
                  type="text"
                  value={folderName}
                  onChange={(event) => setFolderName(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  placeholder="Patient reports, HR docs, vendor bills"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={isCreatingFolder}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <LuFolderPlus className="h-4 w-4" />
                {isCreatingFolder ? 'Creating folder...' : 'Create folder'}
              </button>
            </div>
          </form>

          <form onSubmit={handleUpload} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <LuUpload className="h-5 w-5 text-cyan-600" />
              <h2 className="text-xl font-semibold text-slate-950">Upload file</h2>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 text-sm font-medium text-slate-700">Choose file</span>
                <input
                  id="file-upload-input"
                  type="file"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                  className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-50 file:px-4 file:py-2 file:font-semibold file:text-cyan-700"
                  required
                />
              </label>

              {selectedFile ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {selectedFile.name} · {formatBytes(selectedFile.size)}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isUploading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <LuUpload className="h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Upload file'}
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard label="Folders" value={String(summary.folders)} />
            <SummaryCard label="Files" value={String(summary.files)} />
            <SummaryCard label="Storage used" value={formatBytes(summary.bytes)} />
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <LuSearch className="h-4 w-4 text-slate-400" />
                  Search files
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  placeholder="Name or extension"
                />
              </label>

              <label className="block">
                <span className="mb-2 text-sm font-medium text-slate-700">Kind filter</span>
                <select
                  value={kindFilter}
                  onChange={(event) => setKindFilter(event.target.value as 'all' | FileEntryKind)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                >
                  <option value="all">All entries</option>
                  <option value="folder">Folders</option>
                  <option value="file">Files</option>
                </select>
              </label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {isLoading ? (
              <div className="rounded-[1.75rem] border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm md:col-span-2">
                Loading files...
              </div>
            ) : filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <article
                  key={entry._id}
                  className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-50 text-slate-700">
                        {renderIcon(entry.kind, entry.fileType)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950">{entry.name}</h3>
                        <p className="text-sm text-slate-500">
                          {entry.kind === 'folder' ? 'Folder' : toLabel(entry.fileType)}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {entry.kind === 'folder' ? 'Folder' : formatBytes(entry.sizeBytes)}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p>Created on {formatDate(entry.createdAt)}</p>
                    <p>{entry.extension ? `.${entry.extension}` : 'No extension'}</p>
                    <p>{entry.mimeType || 'Folder or unknown file type'}</p>
                  </div>

                  <div className="mt-5 flex items-center justify-end gap-2">
                    {entry.kind === 'file' && entry.publicUrl ? (
                      <a
                        href={`${getBackendOrigin()}${entry.publicUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <LuExternalLink className="h-3.5 w-3.5" />
                        Open
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void handleDelete(entry._id)}
                      className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                    >
                      <LuTrash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm md:col-span-2">
                No files found for the current filters.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function renderIcon(kind: FileEntryKind, fileType: FileEntryType) {
  if (kind === 'folder') {
    return <LuFolder className="h-6 w-6" />;
  }

  if (fileType === 'pdf') {
    return <LuFileArchive className="h-6 w-6" />;
  }

  if (fileType === 'image') {
    return <LuFileImage className="h-6 w-6" />;
  }

  if (fileType === 'doc') {
    return <LuFileSpreadsheet className="h-6 w-6" />;
  }

  return <LuFile className="h-6 w-6" />;
}

function toLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
