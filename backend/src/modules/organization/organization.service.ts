import { env } from '../../config/env.js';
import { AppError } from '../../utils/app-error.js';
import { AppSettingModel } from '../app-setting/app-setting.model.js';
import { AuditLogModel } from '../audit-log/audit-log.model.js';
import { UserModel } from '../user/user.model.js';
import { OrganizationModel } from './organization.model.js';

export async function getOrCreateDefaultOrganization() {
  const slug = normalizeOrganizationSlug(env.DEFAULT_ORGANIZATION_SLUG);
  const existingOrganization = await OrganizationModel.findOne({ slug });

  if (existingOrganization) {
    return existingOrganization;
  }

  return OrganizationModel.create({
    name: env.DEFAULT_ORGANIZATION_NAME.trim(),
    slug,
    isActive: true,
  });
}

export async function resolveOrganizationBySlug(slug?: string | null) {
  const normalizedSlug = normalizeOrganizationSlug(slug || env.DEFAULT_ORGANIZATION_SLUG);
  const organization = await OrganizationModel.findOne({ slug: normalizedSlug, isActive: true });

  if (!organization) {
    throw new AppError('Hospital workspace was not found', 404);
  }

  return organization;
}

export async function ensureOrganizationBackfill() {
  const defaultOrganization = await getOrCreateDefaultOrganization();

  await Promise.all([
    UserModel.updateMany(
      {
        $or: [{ organization: { $exists: false } }, { organization: null }],
      },
      {
        $set: { organization: defaultOrganization._id },
      },
    ),
    AppSettingModel.updateMany(
      {
        $or: [{ organization: { $exists: false } }, { organization: null }],
      },
      {
        $set: { organization: defaultOrganization._id },
      },
    ),
    AuditLogModel.updateMany(
      {
        $or: [{ organization: { $exists: false } }, { organization: null }],
      },
      {
        $set: { organization: defaultOrganization._id },
      },
    ),
  ]);

  return defaultOrganization;
}

export function normalizeOrganizationSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'default-workspace';
}
