import { env } from '../config/env.js';
import { AppError } from './app-error.js';

type PasswordResetEmailOptions = {
  to: string;
  recipientName: string;
  organizationName: string;
  resetUrl: string;
  expiresAtIso: string;
};

export async function sendPasswordResetEmail(options: PasswordResetEmailOptions) {
  if (env.EMAIL_PROVIDER === 'console') {
    console.info(
      `[password-reset] ${options.to} -> ${options.resetUrl} (expires ${options.expiresAtIso})`,
    );
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [options.to],
      subject: `Reset your ${options.organizationName} password`,
      html: buildPasswordResetHtml(options),
      text: buildPasswordResetText(options),
    }),
  });

  if (!response.ok) {
    const failureBody = await response.text();
    throw new AppError(
      failureBody || 'Unable to deliver the password reset email right now',
      502,
    );
  }
}

function buildPasswordResetHtml(options: PasswordResetEmailOptions) {
  return `
    <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;">
      <h1 style="margin:0 0 16px;font-size:24px;">Reset your password</h1>
      <p style="margin:0 0 12px;">Hi ${escapeHtml(options.recipientName)},</p>
      <p style="margin:0 0 12px;">
        A password reset was requested for your ${escapeHtml(options.organizationName)} account.
      </p>
      <p style="margin:24px 0;">
        <a href="${options.resetUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:600;">
          Reset password
        </a>
      </p>
      <p style="margin:0 0 12px;font-size:14px;color:#475569;">
        This link expires at ${new Date(options.expiresAtIso).toLocaleString('en-IN')}.
      </p>
      <p style="margin:0;font-size:13px;color:#64748b;">
        If you did not request this, you can ignore this email.
      </p>
    </div>
  `.trim();
}

function buildPasswordResetText(options: PasswordResetEmailOptions) {
  return [
    `Hi ${options.recipientName},`,
    '',
    `A password reset was requested for your ${options.organizationName} account.`,
    `Reset password: ${options.resetUrl}`,
    `Expires at: ${new Date(options.expiresAtIso).toLocaleString('en-IN')}`,
    '',
    'If you did not request this, you can ignore this email.',
  ].join('\n');
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
