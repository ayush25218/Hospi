import { AppShell } from '@/components/layout/app-shell';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="admin">
      <AppShell role="admin">
        {children}
      </AppShell>
    </ProtectedRoute>
  );
}
