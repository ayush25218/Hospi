'use client';

import { type ComponentType, useEffect, useMemo, useState } from 'react';
import { LuActivity, LuDatabase, LuSearch, LuShieldCheck, LuUserRound } from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { useSession } from '@/hooks/use-session';
import { apiRequest, describeError, formatDateTime, type AuditLogRecord } from '@/lib/api-client';

export default function AuditLogsPage() {
  const session = useSession();
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.token) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadAuditLogs = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await apiRequest<AuditLogRecord[]>('/audit-logs', {}, session);

        if (isActive) {
          setLogs(response);
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load audit logs right now.'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadAuditLogs();

    return () => {
      isActive = false;
    };
  }, [session]);

  const entityOptions = useMemo(() => {
    return Array.from(new Set(logs.map((log) => log.entityType).filter(Boolean))).sort();
  }, [logs]);

  const actionOptions = useMemo(() => {
    return Array.from(new Set(logs.map((log) => log.action).filter(Boolean))).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesEntity = entityFilter === 'all' || log.entityType === entityFilter;
      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        log.summary.toLowerCase().includes(normalizedSearch) ||
        log.action.toLowerCase().includes(normalizedSearch) ||
        log.entityType.toLowerCase().includes(normalizedSearch) ||
        log.actor?.email?.toLowerCase().includes(normalizedSearch) ||
        log.actor?.name?.toLowerCase().includes(normalizedSearch) ||
        log.requestContext?.path?.toLowerCase().includes(normalizedSearch);

      return matchesEntity && matchesAction && matchesSearch;
    });
  }, [actionFilter, entityFilter, logs, searchTerm]);

  const summary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const uniqueActors = new Set(
      logs
        .map((log) => log.actor?.email ?? log.actor?.userId ?? '')
        .filter(Boolean),
    );

    return {
      total: logs.length,
      authEvents: logs.filter((log) => log.action.startsWith('auth.')).length,
      today: logs.filter((log) => new Date(log.createdAt) >= today).length,
      actors: uniqueActors.size,
    };
  }, [logs]);

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Audit logs are protected and only available after signing in with a live admin account."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
            <LuShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Audit Logs</h1>
            <p className="mt-1 text-sm text-slate-500">
              Review sign-ins, record changes, and operational actions from the live hospital system.
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={LuActivity} label="Total events" value={String(summary.total)} />
        <SummaryCard icon={LuShieldCheck} label="Auth events" value={String(summary.authEvents)} />
        <SummaryCard icon={LuDatabase} label="Today" value={String(summary.today)} />
        <SummaryCard icon={LuUserRound} label="Actors" value={String(summary.actors)} />
      </div>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px_260px]">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <LuSearch className="h-4 w-4 text-slate-400" />
              Search logs
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Action, summary, actor, route"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Entity</span>
            <select
              value={entityFilter}
              onChange={(event) => setEntityFilter(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
            >
              <option value="all">All entities</option>
              {entityOptions.map((entity) => (
                <option key={entity} value={entity}>
                  {toTitleCase(entity)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Action</span>
            <select
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
            >
              <option value="all">All actions</option>
              {actionOptions.map((action) => (
                <option key={action} value={action}>
                  {toActionLabel(action)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-4">
        {isLoading ? (
          <div className="rounded-[1.75rem] border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm">
            Loading audit logs...
          </div>
        ) : filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <article
              key={log._id}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                      {toActionLabel(log.action)}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {toTitleCase(log.entityType)}
                    </span>
                    {log.entityId ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                        {log.entityId.slice(-8).toUpperCase()}
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">{log.summary}</h2>
                    <p className="mt-1 text-sm text-slate-500">{formatDateTime(log.createdAt)}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[24rem]">
                  <InfoChip
                    label="Actor"
                    value={log.actor?.name || log.actor?.email || log.actor?.role || 'System'}
                    subvalue={log.actor?.email}
                  />
                  <InfoChip
                    label="Request"
                    value={log.requestContext?.method || 'Background'}
                    subvalue={log.requestContext?.path}
                  />
                </div>
              </div>

              {log.metadata && Object.keys(log.metadata).length > 0 ? (
                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Metadata
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(log.metadata).map(([key, value]) => (
                      <span
                        key={key}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600"
                      >
                        {key}: {formatMetadataValue(value)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm">
            No audit log entries matched the current filters.
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-2xl font-semibold text-slate-950">{value}</p>
    </article>
  );
}

function InfoChip({
  label,
  value,
  subvalue,
}: {
  label: string;
  value: string;
  subvalue?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
      {subvalue ? <p className="mt-1 text-xs text-slate-500">{subvalue}</p> : null}
    </div>
  );
}

function toActionLabel(value: string) {
  return value
    .split('.')
    .map((part) => toTitleCase(part))
    .join(' / ');
}

function toTitleCase(value: string) {
  return value
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatMetadataValue(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value === null || value === undefined) {
    return 'n/a';
  }

  return JSON.stringify(value);
}
