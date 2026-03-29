'use client';

import { useEffect, useState } from 'react';
import { apiRequest, describeError, type AppointmentRecord, type DoctorRecord } from '@/lib/api-client';
import { useSession } from '@/hooks/use-session';

export function useDoctorWorkspace() {
  const session = useSession();
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [doctorProfile, setDoctorProfile] = useState<DoctorRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.token) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadDoctorWorkspace = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [appointmentsResponse, profileResponse] = await Promise.all([
          apiRequest<AppointmentRecord[]>('/appointments', {}, session),
          apiRequest<DoctorRecord>('/doctors/me', {}, session),
        ]);

        if (isActive) {
          setAppointments(appointmentsResponse);
          setDoctorProfile(profileResponse);
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load your doctor workspace right now.'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadDoctorWorkspace();

    return () => {
      isActive = false;
    };
  }, [session]);

  return {
    session,
    appointments,
    doctorProfile,
    isLoading,
    error,
  };
}
