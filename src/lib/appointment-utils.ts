import type { AppointmentRecord } from '@/lib/api-client';

export function compareAppointmentsByRelevance(a: AppointmentRecord, b: AppointmentRecord) {
  const now = Date.now();
  const aTime = new Date(a.scheduledAt).getTime();
  const bTime = new Date(b.scheduledAt).getTime();
  const aFuture = aTime >= now;
  const bFuture = bTime >= now;

  if (aFuture && !bFuture) {
    return -1;
  }

  if (!aFuture && bFuture) {
    return 1;
  }

  if (aFuture && bFuture) {
    return aTime - bTime;
  }

  return bTime - aTime;
}

export function getRelevantAppointments(appointments: AppointmentRecord[]) {
  return [...appointments].sort(compareAppointmentsByRelevance);
}

export function getLatestAppointment(appointments: AppointmentRecord[]) {
  return [...appointments].sort((a, b) => {
    return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
  })[0] ?? null;
}
