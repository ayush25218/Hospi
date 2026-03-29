'use client';

import { useEffect, useState } from 'react';
import { apiRequest, describeError, type AppointmentRecord, type PatientRecord } from '@/lib/api-client';
import { useSession } from '@/hooks/use-session';

export function usePatientWorkspace() {
  const session = useSession();
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [patientProfile, setPatientProfile] = useState<PatientRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.token) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadPatientWorkspace = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [appointmentsResponse, profileResponse] = await Promise.all([
          apiRequest<AppointmentRecord[]>('/appointments', {}, session),
          apiRequest<PatientRecord>('/patients/me', {}, session),
        ]);

        if (isActive) {
          setAppointments(appointmentsResponse);
          setPatientProfile(profileResponse);
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load your patient workspace right now.'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadPatientWorkspace();

    return () => {
      isActive = false;
    };
  }, [session]);

  return {
    session,
    appointments,
    patientProfile,
    isLoading,
    error,
  };
}
