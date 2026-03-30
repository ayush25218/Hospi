import type { z } from 'zod';
import type { AuthenticatedUser } from '../../types/authenticated-user.js';
import { AppSettingModel } from './app-setting.model.js';
import type { updateAppSettingSchema } from './app-setting.validation.js';

type UpdateAppSettingPayload = z.infer<typeof updateAppSettingSchema>['body'];

export async function getAppSettings(actor: AuthenticatedUser) {
  return findOrCreateDefaultSettings(actor.organizationId);
}

export async function updateAppSettings(payload: UpdateAppSettingPayload, actor: AuthenticatedUser) {
  const settings = await AppSettingModel.findOneAndUpdate(
    { singletonKey: 'default', organization: actor.organizationId },
    {
      ...payload,
      organization: actor.organizationId,
      updatedBy: actor.id,
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  ).populate('updatedBy', '-password');

  return settings;
}

async function findOrCreateDefaultSettings(organizationId: string) {
  const existingSettings = await AppSettingModel.findOne({
    singletonKey: 'default',
    organization: organizationId,
  }).populate('updatedBy', '-password');

  if (existingSettings) {
    return existingSettings;
  }

  return AppSettingModel.create({
    singletonKey: 'default',
    organization: organizationId,
  });
}
