'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LuActivity,
  LuBadgeIndianRupee,
  LuBedDouble,
  LuBuilding2,
  LuCalendarDays,
  LuSearch,
  LuStethoscope,
  LuTrendingUp,
  LuUsers,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { useSession } from '@/hooks/use-session';
import {
  apiRequest,
  describeError,
  formatCurrency,
  type AppointmentRecord,
  type DepartmentRecord,
  type DoctorRecord,
  type ExpenseRecord,
  type PatientRecord,
  type PaymentRecord,
  type RoomRecord,
  type StaffMemberRecord,
} from '@/lib/api-client';

type DateRange = '7d' | '30d' | '90d' | 'year' | 'all';

export default function AnalyticsPage() {
  const session = useSession();
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [data, setData] = useState<{
    departments: DepartmentRecord[];
    doctors: DoctorRecord[];
    patients: PatientRecord[];
    appointments: AppointmentRecord[];
    expenses: ExpenseRecord[];
    rooms: RoomRecord[];
    staffMembers: StaffMemberRecord[];
    payments: PaymentRecord[];
  }>({
    departments: [],
    doctors: [],
    patients: [],
    appointments: [],
    expenses: [],
    rooms: [],
    staffMembers: [],
    payments: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.token) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadAnalytics = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [
          departments,
          doctors,
          patients,
          appointments,
          expenses,
          rooms,
          staffMembers,
          payments,
        ] = await Promise.all([
          apiRequest<DepartmentRecord[]>('/departments', {}, session),
          apiRequest<DoctorRecord[]>('/doctors', {}, session),
          apiRequest<PatientRecord[]>('/patients', {}, session),
          apiRequest<AppointmentRecord[]>('/appointments', {}, session),
          apiRequest<ExpenseRecord[]>('/expenses', {}, session),
          apiRequest<RoomRecord[]>('/rooms', {}, session),
          apiRequest<StaffMemberRecord[]>('/staff-members', {}, session),
          apiRequest<PaymentRecord[]>('/payments', {}, session),
        ]);

        if (isActive) {
          setData({
            departments,
            doctors,
            patients,
            appointments,
            expenses,
            rooms,
            staffMembers,
            payments,
          });
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load analytics right now.'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadAnalytics();

    return () => {
      isActive = false;
    };
  }, [session]);

  const filteredAppointments = useMemo(() => {
    return data.appointments.filter((appointment) => {
      const inRange = isDateInRange(appointment.scheduledAt, dateRange);
      const matchesDepartment =
        departmentFilter === 'all' || appointment.doctor.department === departmentFilter;
      return inRange && matchesDepartment;
    });
  }, [data.appointments, dateRange, departmentFilter]);

  const filteredPayments = useMemo(() => {
    return data.payments.filter((payment) => isDateInRange(payment.paymentDate, dateRange));
  }, [data.payments, dateRange]);

  const filteredExpenses = useMemo(() => {
    return data.expenses.filter((expense) => isDateInRange(expense.expenseDate, dateRange));
  }, [data.expenses, dateRange]);

  const filteredPatients = useMemo(() => {
    return data.patients.filter((patient) => isDateInRange(patient.createdAt, dateRange));
  }, [data.patients, dateRange]);

  const summary = useMemo(() => {
    const revenue = filteredPayments
      .filter((payment) => payment.status === 'success')
      .reduce((total, payment) => total + payment.amount, 0);
    const expenses = filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
    const occupiedRooms = data.rooms.filter((room) => room.status === 'occupied').length;

    return {
      revenue,
      expenses,
      net: revenue - expenses,
      occupiedRooms,
      newPatients: filteredPatients.length,
      opdVisits: filteredAppointments.length,
      activeDoctors: data.doctors.length,
      activeStaff: data.staffMembers.filter((member) => member.status === 'active').length,
    };
  }, [data.doctors.length, data.rooms, data.staffMembers, filteredAppointments.length, filteredExpenses, filteredPatients.length, filteredPayments]);

  const departmentBreakdown = useMemo(() => {
    const map = new Map<string, { visits: number; admissions: number }>();

    data.departments.forEach((department) => {
      map.set(department.name, { visits: 0, admissions: 0 });
    });

    filteredAppointments.forEach((appointment) => {
      const current = map.get(appointment.doctor.department) ?? { visits: 0, admissions: 0 };
      current.visits += 1;
      map.set(appointment.doctor.department, current);
    });

    data.rooms
      .filter((room) => room.status === 'occupied' && room.doctor)
      .forEach((room) => {
        const departmentName = room.doctor?.department ?? 'Unassigned';
        const current = map.get(departmentName) ?? { visits: 0, admissions: 0 };
        current.admissions += 1;
        map.set(departmentName, current);
      });

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, ...value }))
      .sort((left, right) => right.visits + right.admissions - (left.visits + left.admissions));
  }, [data.departments, data.rooms, filteredAppointments]);

  const topDoctors = useMemo(() => {
    const counter = new Map<string, { name: string; specialization: string; count: number }>();

    filteredAppointments.forEach((appointment) => {
      const current = counter.get(appointment.doctor._id) ?? {
        name: appointment.doctor.user.name,
        specialization: appointment.doctor.specialization,
        count: 0,
      };
      current.count += 1;
      counter.set(appointment.doctor._id, current);
    });

    return Array.from(counter.values()).sort((left, right) => right.count - left.count).slice(0, 5);
  }, [filteredAppointments]);

  const monthlyFinance = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('en-IN', { month: 'short' });
    const buckets = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: formatter.format(date),
        revenue: 0,
        expenses: 0,
      };
    });

    filteredPayments.forEach((payment) => {
      if (payment.status !== 'success') {
        return;
      }

      const date = new Date(payment.paymentDate);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const bucket = buckets.find((item) => item.key === key);

      if (bucket) {
        bucket.revenue += payment.amount;
      }
    });

    filteredExpenses.forEach((expense) => {
      const date = new Date(expense.expenseDate);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const bucket = buckets.find((item) => item.key === key);

      if (bucket) {
        bucket.expenses += expense.amount;
      }
    });

    return buckets;
  }, [filteredExpenses, filteredPayments]);

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Analytics now runs on live MongoDB data. Sign in again through the admin portal to open the real performance dashboard."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
            <LuActivity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Analytics & Reports</h1>
            <p className="mt-1 text-sm text-slate-500">
              Live admin insights powered by appointments, rooms, payments, expenses, and team data.
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[220px_240px]">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <LuCalendarDays className="h-4 w-4 text-slate-400" />
              Date range
            </span>
            <select
              value={dateRange}
              onChange={(event) => setDateRange(event.target.value as DateRange)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="year">This year</option>
              <option value="all">All time</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <LuBuilding2 className="h-4 w-4 text-slate-400" />
              Department
            </span>
            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
            >
              <option value="all">All departments</option>
              {data.departments.map((department) => (
                <option key={department._id} value={department.name}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Revenue" value={formatCurrency(summary.revenue)} icon={LuBadgeIndianRupee} />
        <MetricCard label="Expenses" value={formatCurrency(summary.expenses)} icon={LuTrendingUp} />
        <MetricCard label="OPD Visits" value={String(summary.opdVisits)} icon={LuCalendarDays} />
        <MetricCard label="Occupied Beds" value={String(summary.occupiedRooms)} icon={LuBedDouble} />
        <MetricCard label="New Patients" value={String(summary.newPatients)} icon={LuUsers} />
        <MetricCard label="Active Doctors" value={String(summary.activeDoctors)} icon={LuStethoscope} />
        <MetricCard label="Active Staff" value={String(summary.activeStaff)} icon={LuUsers} />
        <MetricCard label="Net Result" value={formatCurrency(summary.net)} icon={LuSearch} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Department load</h2>
          <div className="mt-5 space-y-4">
            {isLoading ? (
              <p className="text-sm text-slate-500">Loading department breakdown...</p>
            ) : departmentBreakdown.length > 0 ? (
              departmentBreakdown.slice(0, 6).map((department) => (
                <div key={department.name} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{department.name}</p>
                    <p className="text-sm text-slate-500">
                      {department.visits} visits · {department.admissions} admissions
                    </p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <div
                      className="h-2 rounded-full bg-cyan-500"
                      style={{ width: `${Math.max(department.visits * 12, 8)}px` }}
                    />
                    <div
                      className="h-2 rounded-full bg-slate-300"
                      style={{ width: `${Math.max(department.admissions * 12, 8)}px` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No department activity found for the selected range.</p>
            )}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Top doctors</h2>
          <div className="mt-5 space-y-4">
            {isLoading ? (
              <p className="text-sm text-slate-500">Loading doctor performance...</p>
            ) : topDoctors.length > 0 ? (
              topDoctors.map((doctor, index) => (
                <div key={`${doctor.name}-${index}`} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{doctor.name}</p>
                      <p className="text-sm text-slate-500">{doctor.specialization}</p>
                    </div>
                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                      {doctor.count} visits
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No doctor activity found for the selected range.</p>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Six-month finance trend</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {monthlyFinance.map((bucket) => (
            <div key={bucket.key} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-900">{bucket.label}</p>
                <span className="text-xs text-slate-500">{formatCurrency(bucket.revenue - bucket.expenses)}</span>
              </div>
              <div className="mt-4 space-y-2">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Revenue</span>
                    <span>{formatCurrency(bucket.revenue)}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-cyan-500"
                      style={{ width: `${bucket.revenue > 0 ? Math.min(bucket.revenue / 2000, 100) : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Expenses</span>
                    <span>{formatCurrency(bucket.expenses)}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-slate-400"
                      style={{ width: `${bucket.expenses > 0 ? Math.min(bucket.expenses / 2000, 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-2xl font-semibold text-slate-950">{value}</p>
    </article>
  );
}

function isDateInRange(dateValue: string, range: DateRange) {
  if (range === 'all') {
    return true;
  }

  const targetDate = new Date(dateValue);
  const now = new Date();

  if (range === 'year') {
    return targetDate.getFullYear() === now.getFullYear();
  }

  const dayWindow = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const start = new Date();
  start.setDate(now.getDate() - (dayWindow - 1));
  start.setHours(0, 0, 0, 0);

  return targetDate >= start && targetDate <= now;
}
