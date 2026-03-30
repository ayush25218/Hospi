import type { SessionUser, UserRole } from '@/lib/auth';

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type BackendUser = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DoctorRecord = {
  _id: string;
  user: BackendUser;
  department: string;
  specialization: string;
  yearsOfExperience: number;
  consultationFee: number;
  bio?: string;
  availability: string[];
  createdAt: string;
  updatedAt: string;
};

export type PatientRecord = {
  _id: string;
  user: BackendUser;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory: string[];
  createdAt: string;
  updatedAt: string;
};

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled';

export type AppointmentRecord = {
  _id: string;
  patient: PatientRecord;
  doctor: DoctorRecord;
  scheduledAt: string;
  reason: string;
  notes?: string;
  status: AppointmentStatus;
  createdBy: BackendUser;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceRecipientType = 'patient' | 'doctor' | 'staff';
export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'cancelled';
export type InvoicePaystubType = 'patient-bill' | 'salary' | 'expense' | 'bonus';

export type InvoiceLineItem = {
  description: string;
  quantity: number;
  price: number;
};

export type InvoiceRecord = {
  _id: string;
  invoiceNumber: string;
  recipientType: InvoiceRecipientType;
  recipientName: string;
  recipientEmail?: string;
  patient?: PatientRecord | null;
  doctor?: DoctorRecord | null;
  paystubType: InvoicePaystubType;
  issueDate: string;
  periodStart?: string;
  periodEnd?: string;
  lineItems: InvoiceLineItem[];
  taxRate: number;
  discount: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  notes?: string;
  createdBy: BackendUser;
  createdAt: string;
  updatedAt: string;
};

export type ContactType = 'doctor' | 'staff' | 'vendor' | 'support';

export type ContactRecord = {
  _id: string;
  name: string;
  contactType: ContactType;
  role: string;
  department?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  createdBy: BackendUser;
  createdAt: string;
  updatedAt: string;
};

export type DepartmentRecord = {
  _id: string;
  name: string;
  description?: string;
  headDoctor?: DoctorRecord | null;
  staffCount: number;
  doctorCount: number;
  createdBy: BackendUser;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseStatus = 'approved' | 'pending';

export type ExpenseRecord = {
  _id: string;
  category: string;
  amount: number;
  description: string;
  expenseDate: string;
  status: ExpenseStatus;
  createdBy: BackendUser;
  createdAt: string;
  updatedAt: string;
};

export type FileEntryKind = 'folder' | 'file';
export type FileEntryType = 'pdf' | 'image' | 'doc' | 'other';
export type FileEntryVisibility = 'admin' | 'doctor' | 'patient' | 'clinical' | 'authenticated';

export type FileEntryRecord = {
  _id: string;
  kind: FileEntryKind;
  name: string;
  fileType: FileEntryType;
  visibility: FileEntryVisibility;
  sizeBytes: number;
  mimeType?: string;
  extension?: string;
  storagePath?: string;
  publicUrl?: string;
  createdBy: BackendUser;
  createdAt: string;
  updatedAt: string;
};

export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected';

export type LeaveRequestRecord = {
  _id: string;
  name: string;
  email: string;
  department: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveRequestStatus;
  createdBy: BackendUser;
  createdAt: string;
  updatedAt: string;
};

export type NoticeCategory = 'urgent' | 'hr' | 'clinical' | 'events' | 'general';
export type NoticeAudience = 'all-staff' | 'doctors-only' | 'nurses-only' | 'admin';

export type NoticeRecord = {
  _id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  author: string;
  audience: NoticeAudience;
  isPinned: boolean;
  createdBy: BackendUser;
  createdAt: string;
  updatedAt: string;
};

export type StaffMemberStatus = 'active' | 'on-leave' | 'inactive';

export type StaffMemberRecord = {
  _id: string;
  staffId: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  role: string;
  status: StaffMemberStatus;
  joinedAt: string;
  photoUrl?: string;
  notes?: string;
  createdBy: BackendUser;
  createdAt: string;
  updatedAt: string;
};

export type PaymentMethod = 'cash' | 'upi' | 'credit-card' | 'debit-card' | 'net-banking';
export type PaymentStatus = 'success' | 'pending' | 'failed' | 'refunded';

export type PaymentRecord = {
  _id: string;
  paymentNumber: string;
  payerName: string;
  payerEmail?: string;
  patient?: PatientRecord | null;
  invoice?: InvoiceRecord | null;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  status: PaymentStatus;
  notes?: string;
  createdBy: BackendUser;
  createdAt: string;
  updatedAt: string;
};

export type PayrollStatus = 'paid' | 'pending';

export type PayrollRecord = {
  _id: string;
  payrollNumber: string;
  staffMember?: StaffMemberRecord | null;
  employeeName: string;
  employeeId: string;
  department: string;
  designation: string;
  salary: number;
  month: string;
  paymentDate: string;
  status: PayrollStatus;
  notes?: string;
  createdBy: BackendUser;
  createdAt: string;
  updatedAt: string;
};

export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance';

export type RoomRecord = {
  _id: string;
  roomNumber: string;
  floor: string;
  roomType: string;
  bedLabel?: string;
  status: RoomStatus;
  patient?: PatientRecord | null;
  doctor?: DoctorRecord | null;
  admittedAt?: string;
  notes?: string;
  createdBy: BackendUser;
  createdAt: string;
  updatedAt: string;
};

export type OperationStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export type OperationRecord = {
  _id: string;
  doctor?: DoctorRecord | null;
  patient?: PatientRecord | null;
  doctorName: string;
  patientName: string;
  operationName: string;
  scheduledAt: string;
  status: OperationStatus;
  roomNumber?: string;
  notes?: string;
  createdBy: BackendUser;
  createdAt: string;
  updatedAt: string;
};

export type AppSettingRecord = {
  _id: string;
  singletonKey: string;
  appTitle: string;
  address: string;
  email: string;
  phone: string;
  footerText: string;
  themeColor: string;
  sidebarColor: string;
  pageBgColor: string;
  language: string;
  timeZone: string;
  currency: string;
  logoUrl?: string;
  faviconUrl?: string;
  updatedBy?: BackendUser | null;
  createdAt: string;
  updatedAt: string;
};

export type AuditLogRecord = {
  _id: string;
  action: string;
  entityType: string;
  entityId?: string;
  summary: string;
  metadata?: Record<string, unknown>;
  actor?: {
    userId?: string;
    role?: string;
    email?: string;
    name?: string;
  };
  requestContext?: {
    ipAddress?: string;
    userAgent?: string;
    method?: string;
    path?: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  token: string;
  user: BackendUser;
};

const DEFAULT_API_BASE_URL = 'http://localhost:5000/api/v1';

export class ApiError extends Error {
  statusCode: number;
  details: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details ?? null;
  }
}

export function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, '');
}

export function getBackendOrigin() {
  return getApiBaseUrl().replace(/\/api\/v1$/, '');
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  session?: SessionUser | null
) {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!isFormData && options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (session?.token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${session.token}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${normalizedPath}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  const contentType = response.headers.get('content-type') ?? '';
  let payload: ApiEnvelope<T> | { message?: string } | null = null;

  if (contentType.includes('application/json')) {
    payload = (await response.json()) as ApiEnvelope<T>;
  } else {
    const text = await response.text();
    payload = text ? { message: text } : null;
  }

  if (!response.ok) {
    throw new ApiError(resolvePayloadMessage(payload, response.status), response.status, payload);
  }

  return (payload as ApiEnvelope<T>).data;
}

export function describeError(error: unknown, fallback = 'Something went wrong.') {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    if (error.message.toLowerCase().includes('fetch')) {
      return 'Unable to reach the backend. Start the Express server on http://localhost:5000 and try again.';
    }

    return error.message;
  }

  return fallback;
}

export function formatRecordId(prefix: string, id: string) {
  return `${prefix}-${id.slice(-6).toUpperCase()}`;
}

export function getInitials(name: string) {
  const parts = name
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return 'NA';
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join('');
}

export function calculateAge(dateOfBirth: string) {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

export function formatDate(date: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(date));
}

export function formatDateTime(date: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatBytes(value: number) {
  if (value <= 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const unitIndex = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const normalizedValue = value / 1024 ** unitIndex;
  const formattedValue = normalizedValue >= 100 || unitIndex === 0 ? normalizedValue.toFixed(0) : normalizedValue.toFixed(1);
  return `${formattedValue} ${units[unitIndex]}`;
}

function resolvePayloadMessage(payload: { message?: string } | null, statusCode: number) {
  if (payload?.message) {
    return payload.message;
  }

  return `Request failed with status ${statusCode}.`;
}
