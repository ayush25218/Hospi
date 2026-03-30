import crypto from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.js';
import type { AuthenticatedUser } from '../../types/authenticated-user.js';
import { AppError } from '../../utils/app-error.js';
import { sendPasswordResetEmail } from '../../utils/email.js';
import { getOrCreateDefaultOrganization, resolveOrganizationBySlug } from '../organization/organization.service.js';
import { UserModel, type UserRole } from '../user/user.model.js';
import type { z } from 'zod';
import type {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from './auth.validation.js';

type RegisterPayload = z.infer<typeof registerSchema>['body'];
type LoginPayload = z.infer<typeof loginSchema>['body'];
type ForgotPasswordPayload = z.infer<typeof forgotPasswordSchema>['body'];
type ResetPasswordPayload = z.infer<typeof resetPasswordSchema>['body'];

export async function registerUser(payload: RegisterPayload, actor: AuthenticatedUser) {
  const existingUser = await UserModel.findOne({
    email: payload.email,
    organization: actor.organizationId,
  });

  if (existingUser) {
    throw new AppError('User already exists with this email', 409);
  }

  const user = await UserModel.create({
    ...payload,
    organization: actor.organizationId,
  });

  const organization = await resolveOrganizationBySlug(actor.organizationSlug);
  const token = signToken(
    user.id,
    user.role as UserRole,
    String(user.email),
    String(user.name),
    String(organization._id),
    String(organization.slug),
    String(organization.name),
  );

  return {
    token,
    user,
    organization: serializeOrganization(organization),
  };
}

export async function loginUser(payload: LoginPayload) {
  const organization = payload.organizationSlug
    ? await resolveOrganizationBySlug(payload.organizationSlug)
    : await getOrCreateDefaultOrganization();

  const user = await UserModel.findOne({
    email: payload.email,
    organization: organization._id,
  })
    .populate('organization')
    .select('+password');

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const passwordMatches = await user.comparePassword(payload.password);

  if (!passwordMatches) {
    throw new AppError('Invalid email or password', 401);
  }

  const resolvedOrganization = isResolvedOrganization(user.organization) ? user.organization : organization;

  const token = signToken(
    user.id,
    user.role as UserRole,
    String(user.email),
    String(user.name),
    String(resolvedOrganization._id),
    String(resolvedOrganization.slug),
    String(resolvedOrganization.name),
  );
  const sanitizedUser = user.toJSON();

  return {
    token,
    user: sanitizedUser,
    organization: serializeOrganization(resolvedOrganization),
  };
}

export async function getCurrentUser(actor: AuthenticatedUser) {
  const user = await UserModel.findOne({
    _id: actor.id,
    organization: actor.organizationId,
  }).populate('organization');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}

export async function requestPasswordReset(payload: ForgotPasswordPayload) {
  const organization = payload.organizationSlug
    ? await resolveOrganizationBySlug(payload.organizationSlug)
    : await getOrCreateDefaultOrganization();

  const user = await UserModel.findOne({
    email: payload.email,
    organization: organization._id,
  })
    .select('+passwordResetTokenHash +passwordResetExpiresAt')
    .populate('organization');

  if (!user || !user.isActive) {
    return {
      requested: true,
    };
  }

  const token = crypto.randomBytes(24).toString('hex');
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000);
  const resetUrl = `${env.APP_BASE_URL.replace(/\/$/, '')}/reset-password?token=${token}&workspace=${organization.slug}`;

  user.passwordResetTokenHash = tokenHash;
  user.passwordResetExpiresAt = expiresAt;
  await user.save();

  await sendPasswordResetEmail({
    to: String(user.email),
    recipientName: String(user.name),
    organizationName: String(organization.name),
    resetUrl,
    expiresAtIso: expiresAt.toISOString(),
  });

  return {
    requested: true,
    expiresAt: expiresAt.toISOString(),
    resetUrl: env.NODE_ENV === 'production' ? undefined : resetUrl,
    resetToken: env.NODE_ENV === 'production' ? undefined : token,
    delivery:
      env.EMAIL_PROVIDER === 'console' && env.NODE_ENV !== 'production' ? 'screen-preview' : 'email',
    organization: serializeOrganization(organization),
  };
}

export async function resetPasswordWithToken(payload: ResetPasswordPayload) {
  const tokenHash = hashResetToken(payload.token);
  const user = await UserModel.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  })
    .select('+password +passwordResetTokenHash +passwordResetExpiresAt')
    .populate('organization');

  if (!user || !user.isActive) {
    throw new AppError('Password reset token is invalid or has expired', 400);
  }

  user.password = payload.password;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();

  const organization = isResolvedOrganization(user.organization)
    ? user.organization
    : await getOrCreateDefaultOrganization();

  const token = signToken(
    user.id,
    user.role as UserRole,
    String(user.email),
    String(user.name),
    String(organization._id),
    String(organization.slug),
    String(organization.name),
  );
  const sanitizedUser = user.toJSON();

  return {
    token,
    user: sanitizedUser,
    organization: serializeOrganization(organization),
  };
}

function signToken(
  userId: string,
  role: UserRole,
  email: string,
  name: string,
  organizationId: string,
  organizationSlug: string,
  organizationName: string,
) {
  return jwt.sign(
    { userId, role, email, name, organizationId, organizationSlug, organizationName },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as NonNullable<SignOptions['expiresIn']> },
  );
}

function hashResetToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function serializeOrganization(organization: {
  _id?: unknown;
  id?: unknown;
  name?: unknown;
  slug?: unknown;
}) {
  return {
    _id: String(organization._id ?? organization.id),
    name: String(organization.name ?? ''),
    slug: String(organization.slug ?? ''),
  };
}

function isResolvedOrganization(
  value: unknown,
): value is { _id: unknown; slug: string; name: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_id' in value &&
    'slug' in value &&
    typeof (value as { slug?: unknown }).slug === 'string' &&
    'name' in value &&
    typeof (value as { name?: unknown }).name === 'string'
  );
}
