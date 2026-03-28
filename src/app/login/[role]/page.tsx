import { notFound } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { normalizeRoleSlug } from '@/lib/auth';

export default async function RoleLoginPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role: roleSlug } = await params;
  const role = normalizeRoleSlug(roleSlug);

  if (!role) {
    notFound();
  }

  return <LoginForm role={role} />;
}
