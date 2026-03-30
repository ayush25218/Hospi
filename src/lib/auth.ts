export type UserRole = 'admin' | 'doctor' | 'patient';

export type SessionUser = {
  id?: string;
  role: UserRole;
  email: string;
  name: string;
  token?: string;
  source?: 'backend' | 'demo';
};

type RoleMeta = {
  label: string;
  shortLabel: string;
  summary: string;
  loginPath: string;
  redirectPath: string;
  credentials: {
    email: string;
    password: string;
  };
};

export const SESSION_STORAGE_KEY = 'hospi.session';
const SESSION_CHANGE_EVENT = 'hospi-auth-change';
let cachedSessionRaw: string | null | undefined;
let cachedSession: SessionUser | null = null;

export const ROLE_META: Record<UserRole, RoleMeta> = {
  admin: {
    label: 'Administrator',
    shortLabel: 'Admin',
    summary: 'Monitor operations, finance, staff, and hospital-wide workflows.',
    loginPath: '/login/adminlogin',
    redirectPath: '/dashboard',
    credentials: {
      email: 'admin@hospi.com',
      password: 'Admin@12345',
    },
  },
  doctor: {
    label: 'Doctor',
    shortLabel: 'Doctor',
    summary: 'Review appointments, patient updates, and your daily care schedule.',
    loginPath: '/login/doctorlogin',
    redirectPath: '/doctor-portal',
    credentials: {
      email: '',
      password: '',
    },
  },
  patient: {
    label: 'Patient',
    shortLabel: 'Patient',
    summary: 'Track appointments, prescriptions, and your care history in one place.',
    loginPath: '/login/patientlogin',
    redirectPath: '/patientfolder/dashboard',
    credentials: {
      email: '',
      password: '',
    },
  },
};

const ROLE_ALIASES: Record<string, UserRole> = {
  admin: 'admin',
  adminlogin: 'admin',
  doctor: 'doctor',
  doctorlogin: 'doctor',
  patient: 'patient',
  patientlogin: 'patient',
};

export function normalizeRoleSlug(value?: string): UserRole | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase().replace(/[^a-z]/g, '');
  return ROLE_ALIASES[normalized] ?? null;
}

export function getRoleMeta(role: UserRole) {
  return ROLE_META[role];
}

export function readSession(): SessionUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return readSessionSnapshot(window.localStorage.getItem(SESSION_STORAGE_KEY));
}

function readSessionSnapshot(rawValue: string | null): SessionUser | null {
  if (rawValue === cachedSessionRaw) {
    return cachedSession;
  }

  cachedSessionRaw = rawValue;
  cachedSession = parseSession(rawValue);
  return cachedSession;
}

function parseSession(rawValue: string | null): SessionUser | null {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<SessionUser> | null;

    if (
      !parsed ||
      typeof parsed.role !== 'string' ||
      typeof parsed.email !== 'string' ||
      typeof parsed.name !== 'string'
    ) {
      return null;
    }

    return {
      id: typeof parsed.id === 'string' ? parsed.id : undefined,
      role: parsed.role as UserRole,
      email: parsed.email,
      name: parsed.name,
      token: typeof parsed.token === 'string' ? parsed.token : undefined,
      source: parsed.source === 'backend' || parsed.source === 'demo' ? parsed.source : undefined,
    };
  } catch {
    return null;
  }
}

export function writeSession(session: SessionUser) {
  if (typeof window === 'undefined') {
    return;
  }

  const rawValue = JSON.stringify(session);
  cachedSessionRaw = rawValue;
  cachedSession = session;
  window.localStorage.setItem(SESSION_STORAGE_KEY, rawValue);
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}

export function clearSession() {
  if (typeof window === 'undefined') {
    return;
  }

  cachedSessionRaw = null;
  cachedSession = null;
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}

export function buildSessionName(email: string, role: UserRole) {
  const prefix = email.split('@')[0]?.replace(/[._-]/g, ' ') ?? '';
  const words = prefix
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));

  if (words.length === 0) {
    return getRoleMeta(role).label;
  }

  return words.join(' ');
}

export function subscribeToSession(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === SESSION_STORAGE_KEY) {
      readSessionSnapshot(event.newValue);
      onStoreChange();
    }
  };

  const handleSessionChange = () => {
    onStoreChange();
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(SESSION_CHANGE_EVENT, handleSessionChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(SESSION_CHANGE_EVENT, handleSessionChange);
  };
}
