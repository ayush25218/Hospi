import type { z } from 'zod';
import type { AuthenticatedUser } from '../../types/authenticated-user.js';
import { AppError } from '../../utils/app-error.js';
import { getOrganizationUserIds } from '../../utils/organization-scope.js';
import { ContactModel } from './contact.model.js';
import type { createContactSchema, updateContactSchema } from './contact.validation.js';

type CreateContactPayload = z.infer<typeof createContactSchema>['body'];
type UpdateContactPayload = z.infer<typeof updateContactSchema>['body'];

export async function createContact(payload: CreateContactPayload, actor: AuthenticatedUser) {
  return ContactModel.create({
    ...payload,
    createdBy: actor.id,
  });
}

export async function getContacts(actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  return ContactModel.find({ createdBy: { $in: organizationUserIds } }).populate('createdBy', '-password').sort({ createdAt: -1 });
}

export async function updateContact(contactId: string, payload: UpdateContactPayload, actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  const contact = await ContactModel.findOneAndUpdate(
    { _id: contactId, createdBy: { $in: organizationUserIds } },
    payload,
    {
      new: true,
      runValidators: true,
    },
  ).populate('createdBy', '-password');

  if (!contact) {
    throw new AppError('Contact not found', 404);
  }

  return contact;
}

export async function deleteContact(contactId: string, actor: AuthenticatedUser) {
  const organizationUserIds = await getOrganizationUserIds(actor.organizationId);
  const deletedContact = await ContactModel.findOneAndDelete({
    _id: contactId,
    createdBy: { $in: organizationUserIds },
  });

  if (!deletedContact) {
    throw new AppError('Contact not found', 404);
  }
}
