import type { ReactNode } from 'react';
import { LayoutWrapper } from '../layout/LayoutWrapper';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <LayoutWrapper>{children}</LayoutWrapper>;
}
