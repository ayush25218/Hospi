import { AppShell } from '@/components/layout/app-shell';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="patient">
      <AppShell role="patient">
        {children}
      </AppShell>
    </ProtectedRoute>
  );
}
