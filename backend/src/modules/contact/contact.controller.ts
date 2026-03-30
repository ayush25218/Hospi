import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendResponse } from '../../utils/api-response.js';
import { recordAuditEvent } from '../audit-log/audit-log.service.js';
import { createContact, deleteContact, getContacts, updateContact } from './contact.service.js';

export const createContactHandler = asyncHandler(async (req: Request, res: Response) => {
  const contact = await createContact(req.body, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'contact.created',
    entityType: 'contact',
    entityId: contact.id,
    summary: `Created contact ${contact.name}`,
  });

  sendResponse({
    res,
    statusCode: 201,
    message: 'Contact created successfully',
    data: contact,
  });
});

export const getContactsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const contacts = await getContacts(_req.user!);

  sendResponse({
    res,
    message: 'Contacts fetched successfully',
    data: contacts,
  });
});

export const updateContactHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const contact = await updateContact(req.params.id, req.body, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'contact.updated',
    entityType: 'contact',
    entityId: contact.id,
    summary: `Updated contact ${contact.name}`,
  });

  sendResponse({
    res,
    message: 'Contact updated successfully',
    data: contact,
  });
});

export const deleteContactHandler = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await deleteContact(req.params.id, req.user!);

  await recordAuditEvent({
    req,
    actor: req.user,
    action: 'contact.deleted',
    entityType: 'contact',
    entityId: req.params.id,
    summary: 'Deleted contact entry',
  });

  sendResponse({
    res,
    message: 'Contact deleted successfully',
  });
});
