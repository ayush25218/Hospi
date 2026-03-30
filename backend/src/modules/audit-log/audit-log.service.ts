import type { Request } from 'express';
import { AuditLogModel } from './audit-log.model.js';

type AuditActorInput =
  | {
      id?: unknown;
      _id?: unknown;
      role?: unknown;
      email?: unknown;
      name?: unknown;
    }
  | null
  | undefined;

type RecordAuditEventOptions = {
  req?: Request | undefined;
  actor?: AuditActorInput;
  action: string;
  entityType: string;
  entityId?: unknown;
  summary: string;
  metadata?: Record<string, unknown> | null | undefined;
};

export async function recordAuditEvent(options: RecordAuditEventOptions) {
  try {
    const actor = normalizeActor(options.actor);

    await AuditLogModel.create({
      action: options.action,
      entityType: options.entityType,
      entityId: normalizeString(options.entityId),
      summary: options.summary,
      metadata: options.metadata ?? undefined,
      actor,
      requestContext: options.req
        ? {
          ipAddress: options.req.ip,
            userAgent: options.req.get('user-agent'),
            method: options.req.method,
            path: options.req.originalUrl,
          }
        : undefined,
    });
  } catch {
    // Audit logging should never block a user workflow.
  }
}

export async function getAuditLogs() {
  return AuditLogModel.find().sort({ createdAt: -1 }).limit(500);
}

function normalizeActor(actor: AuditActorInput) {
  if (!actor) {
    return undefined;
  }

  const normalizedActor = {
    userId: normalizeString(actor.id ?? actor._id),
    role: normalizeString(actor.role),
    email: normalizeString(actor.email)?.toLowerCase(),
    name: normalizeString(actor.name),
  };

  return Object.values(normalizedActor).some(Boolean) ? normalizedActor : undefined;
}

function normalizeString(value: unknown) {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : undefined;
  }

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }

  if (typeof value === 'object' && 'toString' in value && typeof value.toString === 'function') {
    const serializedValue = String(value);
    return serializedValue && serializedValue !== '[object Object]' ? serializedValue : undefined;
  }

  return undefined;
}
