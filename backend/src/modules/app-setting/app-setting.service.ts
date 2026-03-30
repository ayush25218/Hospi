import type { z } from 'zod';
import { AppSettingModel } from './app-setting.model.js';
import type { updateAppSettingSchema } from './app-setting.validation.js';

type UpdateAppSettingPayload = z.infer<typeof updateAppSettingSchema>['body'];

export async function getAppSettings() {
  return findOrCreateDefaultSettings();
}

export async function updateAppSettings(payload: UpdateAppSettingPayload, userId: string) {
  const settings = await AppSettingModel.findOneAndUpdate(
    { singletonKey: 'default' },
    {
      ...payload,
      updatedBy: userId,
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

async function findOrCreateDefaultSettings() {
  const existingSettings = await AppSettingModel.findOne({ singletonKey: 'default' }).populate('updatedBy', '-password');

  if (existingSettings) {
    return existingSettings;
  }

  return AppSettingModel.create({ singletonKey: 'default' });
}
