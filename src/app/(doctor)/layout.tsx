import { AppShell } from '@/components/layout/app-shell';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="doctor">
      <AppShell role="doctor">
        {children}
      </AppShell>
    </ProtectedRoute>
  );
}
