'use client';

import { useSyncExternalStore } from 'react';
import { readSession, subscribeToSession } from '@/lib/auth';

export function useSession() {
  return useSyncExternalStore(subscribeToSession, readSession, () => null);
}
