'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ElementType } from 'react';
import {
  LuActivity,
  LuArrowRight,
  LuBadgeIndianRupee,
  LuBedDouble,
  LuCalendarCheck2,
  LuCommand,
  LuPlus,
  LuShieldCheck,
  LuStethoscope,
  LuUsers,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { useSession } from '@/hooks/use-session';
import {
  apiRequest,
  describeError,
  formatCurrency,
  formatDateTime,
  formatRecordId,
  type AppointmentRecord,
  type DoctorRecord,
  type InvoiceRecord,
  type OperationRecord,
  type PatientRecord,
  type RoomRecord,
} from '@/lib/api-client';

const quickActions = [
  { label: 'Add patient', href: '/patient/add' },
  { label: 'Add doctor', href: '/doctor/add' },
  { label: 'Create appointment', href: '/appointment/add' },
  { label: 'Create invoice', href: '/billing/create' },
];

type DashboardState = {
  patients: PatientRecord[];
  doctors: DoctorRecord[];
  appointments: AppointmentRecord[];
  rooms: RoomRecord[];
  invoices: InvoiceRecord[];
  operations: OperationRecord[];
};

const initialDashboardState: DashboardState = {
  patients: [],
  doctors: [],
  appointments: [],
  rooms: [],
  invoices: [],
  operations: [],
};

export default function DashboardPage() {
  const session = useSession();
  const [dashboardState, setDashboardState] = useState<DashboardState>(initialDashboardState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.token) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [patients, doctors, appointments, rooms, invoices, operations] = await Promise.all([
          apiRequest<PatientRecord[]>('/patients', {}, session),
          apiRequest<DoctorRecord[]>('/doctors', {}, session),
          apiRequest<AppointmentRecord[]>('/appointments', {}, session),
          apiRequest<RoomRecord[]>('/rooms', {}, session),
          apiRequest<InvoiceRecord[]>('/invoices', {}, session),
          apiRequest<OperationRecord[]>('/operations', {}, session),
        ]);

        if (isActive) {
          setDashboardState({
            patients,
            doctors,
            appointments,
            rooms,
            invoices,
            operations,
          });
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load dashboard data right now.'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isActive = false;
    };
  }, [session]);

  const metrics = useMemo(() => {
    const todayAppointments = dashboardState.appointments.filter((appointment) =>
      isSameDay(appointment.scheduledAt, new Date()),
    );
    const patientBillsThisWeek = dashboardState.invoices.filter(
      (invoice) =>
        invoice.recipientType === 'patient' &&
        invoice.status === 'paid' &&
        isWithinCurrentWeek(invoice.issueDate),
    );
    const scheduledAppointments = dashboardState.appointments.filter(
      (appointment) => appointment.status === 'scheduled',
    ).length;

    return [
      {
        label: 'Patients registered',
        value: dashboardState.patients.length.toLocaleString('en-IN'),
        change: `${countThisMonth(dashboardState.patients)} new this month`,
        icon: LuUsers,
        tone: 'from-cyan-400/16 to-cyan-400/5 text-cyan-700',
      },
      {
        label: 'Doctors onboarded',
        value: dashboardState.doctors.length.toLocaleString('en-IN'),
        change: `${countThisMonth(dashboardState.doctors)} added this month`,
        icon: LuStethoscope,
        tone: 'from-emerald-400/16 to-emerald-400/5 text-emerald-700',
      },
      {
        label: 'Appointments today',
        value: todayAppointments.length.toLocaleString('en-IN'),
        change: `${scheduledAppointments} still scheduled`,
        icon: LuCalendarCheck2,
        tone: 'from-amber-300/20 to-amber-300/6 text-amber-700',
      },
      {
        label: 'Revenue this week',
        value: formatCurrency(
          patientBillsThisWeek.reduce((total, invoice) => total + invoice.totalAmount, 0),
        ),
        change: `${patientBillsThisWeek.length} paid patient invoices`,
        icon: LuBadgeIndianRupee,
        tone: 'from-violet-400/16 to-violet-400/5 text-violet-700',
      },
    ];
  }, [dashboardState]);

  const systemCards = useMemo(() => {
    const totalRooms = dashboardState.rooms.length;
    const occupiedRooms = dashboardState.rooms.filter((room) => room.status === 'occupied').length;
    const occupancyPercentage = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
    const operationsToday = dashboardState.operations.filter((operation) =>
      isSameDay(operation.scheduledAt, new Date()),
    );
    const activeOperations = operationsToday.filter(
      (operation) => operation.status === 'pending' || operation.status === 'in-progress',
    ).length;

    return [
      {
        title: 'Ward occupancy',
        value: totalRooms > 0 ? `${occupancyPercentage}%` : 'No rooms',
        description:
          totalRooms > 0
            ? `${occupiedRooms} of ${totalRooms} live rooms are currently occupied.`
            : 'Create rooms to start tracking live IPD occupancy.',
        icon: LuBedDouble,
      },
      {
        title: 'Operations pulse',
        value: operationsToday.length > 0 ? `${operationsToday.length} today` : 'No cases',
        description:
          operationsToday.length > 0
            ? `${activeOperations} theatre cases still active in today’s schedule.`
            : 'No operations are scheduled for today yet.',
        icon: LuActivity,
      },
    ];
  }, [dashboardState.operations, dashboardState.rooms]);

  const recentAppointments = useMemo(() => {
    return [...dashboardState.appointments]
      .sort((left, right) => new Date(right.scheduledAt).getTime() - new Date(left.scheduledAt).getTime())
      .slice(0, 5);
  }, [dashboardState.appointments]);

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Dashboard metrics now load from MongoDB. Sign in again through the admin portal to see live counts and recent activity."
      />
    );
  }

  return (
    <div className="space-y-8 pt-1 sm:pt-2">
      <section className="hospi-panel overflow-hidden rounded-[2.2rem] px-6 py-8 text-white shadow-[0_28px_90px_rgba(5,12,24,0.42)] sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">
              <LuShieldCheck className="h-4 w-4" />
              Admin control room
            </div>

            <div>
              <h1 className="text-4xl font-semibold leading-[0.95] text-white sm:text-5xl">
                Hospital operations, elevated into one futuristic command deck.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/66 sm:text-base">
                Every key stat on this board now comes from your live workspace, so the dashboard reflects
                actual patients, appointments, rooms, invoices, and operations.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/appointment/add"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Create appointment
                <LuArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/billing/create"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.09]"
              >
                Create invoice
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.8rem] border border-white/10 bg-white/[0.05] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white/74">Today&apos;s focus</p>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
                Live
              </span>
            </div>
            <div className="space-y-4">
              {isLoading
                ? Array.from({ length: 2 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4"
                    >
                      <div className="h-24 animate-pulse rounded-[1.2rem] bg-white/10" />
                    </div>
                  ))
                : systemCards.map((card) => (
                    <div key={card.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-100">
                          <card.icon className="h-5 w-5" />
                        </div>
                        <span className="text-2xl font-semibold tracking-[-0.04em] text-white">{card.value}</span>
                      </div>
                      <p className="mt-4 text-base font-semibold text-white">{card.title}</p>
                      <p className="mt-1 text-sm text-white/62">{card.description}</p>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => <MetricCardSkeleton key={index} />)
          : metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="hospi-light-panel rounded-[1.9rem] p-6 text-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Quick actions</h2>
              <p className="mt-1 text-sm text-slate-500">The highest-frequency admin tasks are surfaced first.</p>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-cyan-100">
              <LuCommand className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
              >
                {action.label}
              </Link>
            ))}
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-950/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              <LuPlus className="h-4 w-4 text-cyan-600" />
              Operator note
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Use this area as your launch rail for urgent admin work instead of bouncing through multiple menus.
            </p>
          </div>
        </div>

        <div className="hospi-light-panel rounded-[1.9rem] p-6 text-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Recent appointments</h2>
              <p className="mt-1 text-sm text-slate-500">Latest bookings from your actual workspace data.</p>
            </div>
            <Link
              href="/appointment"
              className="text-sm font-semibold text-cyan-700 transition hover:text-cyan-600"
            >
              Open list
            </Link>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Patient</th>
                  <th className="px-4 py-3 font-semibold">Doctor</th>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index} className="border-t border-slate-100">
                      <td className="px-4 py-4" colSpan={4}>
                        <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                      </td>
                    </tr>
                  ))
                ) : recentAppointments.length > 0 ? (
                  recentAppointments.map((appointment) => (
                    <tr key={appointment._id} className="border-t border-slate-100">
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-950">{appointment.patient.user.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatRecordId('APT', appointment._id)}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{appointment.doctor.user.name}</td>
                      <td className="px-4 py-4 text-slate-600">{formatDateTime(appointment.scheduledAt)}</td>
                      <td className="px-4 py-4">
                        <span className={statusClassName(appointment.status)}>{toStatusLabel(appointment.status)}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                      No live appointments available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  change,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  change: string;
  icon: ElementType;
  tone: string;
}) {
  return (
    <div className="hospi-light-panel rounded-[1.75rem] p-5 text-slate-950">
      <div className="flex items-center justify-between gap-3">
        <div className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{change}</span>
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-slate-950">{value}</p>
      <p className="mt-2 text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}

function MetricCardSkeleton() {
  return (
    <div className="hospi-light-panel rounded-[1.75rem] p-5 text-slate-950">
      <div className="flex items-center justify-between gap-3">
        <div className="h-11 w-11 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
      </div>
      <div className="mt-5 h-9 w-24 animate-pulse rounded-xl bg-slate-100" />
      <div className="mt-3 h-4 w-36 animate-pulse rounded-full bg-slate-100" />
    </div>
  );
}

function statusClassName(status: AppointmentRecord['status']) {
  if (status === 'completed') {
    return 'inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700';
  }

  if (status === 'confirmed') {
    return 'inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700';
  }

  if (status === 'scheduled') {
    return 'inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700';
  }

  return 'inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700';
}

function toStatusLabel(status: AppointmentRecord['status']) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function countThisMonth(records: Array<{ createdAt: string }>) {
  const today = new Date();
  return records.filter((record) => {
    const createdAt = new Date(record.createdAt);
    return createdAt.getMonth() === today.getMonth() && createdAt.getFullYear() === today.getFullYear();
  }).length;
}

function isSameDay(dateValue: string, comparisonDate: Date) {
  const date = new Date(dateValue);
  return (
    date.getDate() === comparisonDate.getDate() &&
    date.getMonth() === comparisonDate.getMonth() &&
    date.getFullYear() === comparisonDate.getFullYear()
  );
}

function isWithinCurrentWeek(dateValue: string) {
  const date = new Date(dateValue);
  const today = new Date();
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const startOfWeek = new Date(today);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(today.getDate() + mondayOffset);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return date >= startOfWeek && date < endOfWeek;
}
