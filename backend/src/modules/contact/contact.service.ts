import type { z } from 'zod';
import { AppError } from '../../utils/app-error.js';
import { ContactModel } from './contact.model.js';
import type { createContactSchema, updateContactSchema } from './contact.validation.js';

type CreateContactPayload = z.infer<typeof createContactSchema>['body'];
type UpdateContactPayload = z.infer<typeof updateContactSchema>['body'];

export async function createContact(payload: CreateContactPayload, createdBy: string) {
  return ContactModel.create({
    ...payload,
    createdBy,
  });
}

export async function getContacts() {
  return ContactModel.find().populate('createdBy', '-password').sort({ createdAt: -1 });
}

export async function updateContact(contactId: string, payload: UpdateContactPayload) {
  const contact = await ContactModel.findByIdAndUpdate(contactId, payload, {
    new: true,
    runValidators: true,
  }).populate('createdBy', '-password');

  if (!contact) {
    throw new AppError('Contact not found', 404);
  }

  return contact;
}

export async function deleteContact(contactId: string) {
  const deletedContact = await ContactModel.findByIdAndDelete(contactId);

  if (!deletedContact) {
    throw new AppError('Contact not found', 404);
  }
}
