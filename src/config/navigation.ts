import type { ElementType } from 'react';
import {
  LuActivity,
  LuBellRing,
  LuBedDouble,
  LuCalendarCheck2,
  LuClipboardList,
  LuContact,
  LuCreditCard,
  LuFileArchive,
  LuFileClock,
  LuFilePlus2,
  LuFolderKanban,
  LuHeartPulse,
  LuLayoutDashboard,
  LuReceiptText,
  LuSettings2,
  LuShieldCheck,
  LuStethoscope,
  LuUserCog,
  LuUserRoundPlus,
  LuUsers,
  LuWallet,
} from 'react-icons/lu';
import type { UserRole } from '@/lib/auth';

export type NavigationItem = {
  label: string;
  href: string;
  icon: ElementType;
  children?: {
    label: string;
    href: string;
    icon: ElementType;
  }[];
};

export type NavigationSection = {
  title: string;
  items: NavigationItem[];
};

export const adminNavigation: NavigationSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LuLayoutDashboard },
      { label: 'Analytics', href: '/analytics', icon: LuActivity },
    ],
  },
  {
    title: 'Clinical',
    items: [
      { label: 'Appointments', href: '/appointment', icon: LuCalendarCheck2 },
      {
        label: 'Doctors',
        href: '/doctor',
        icon: LuStethoscope,
        children: [
          { label: 'Doctor List', href: '/doctor/list', icon: LuUsers },
          { label: 'Add Doctor', href: '/doctor/add', icon: LuUserRoundPlus },
        ],
      },
      {
        label: 'Patients',
        href: '/patient',
        icon: LuHeartPulse,
        children: [
          { label: 'Patient List', href: '/patient/list', icon: LuUsers },
          { label: 'Add Patient', href: '/patient/add', icon: LuUserRoundPlus },
          { label: 'IPD Patients', href: '/patient/ipd', icon: LuBedDouble },
          { label: 'OPD Patients', href: '/patient/opd', icon: LuClipboardList },
        ],
      },
      { label: 'Departments', href: '/departments', icon: LuFileArchive },
      { label: 'Rooms', href: '/rooms', icon: LuBedDouble },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        label: 'Billing',
        href: '/billing',
        icon: LuWallet,
        children: [
          { label: 'Create Invoice', href: '/billing/create', icon: LuFilePlus2 },
          { label: 'All Invoices', href: '/billing/all-invoices', icon: LuReceiptText },
        ],
      },
      { label: 'Payments', href: '/payment', icon: LuCreditCard },
      { label: 'Payroll', href: '/payroll', icon: LuWallet },
      { label: 'Expenses', href: '/expenses', icon: LuReceiptText },
      { label: 'Contacts', href: '/contacts', icon: LuContact },
      { label: 'Notice Board', href: '/notice', icon: LuBellRing },
    ],
  },
  {
    title: 'Workspace',
    items: [
      {
        label: 'Staff',
        href: '/staff',
        icon: LuUserCog,
        children: [
          { label: 'All Staff', href: '/staff/list', icon: LuUsers },
          { label: 'Add Staff', href: '/staff/add', icon: LuUserRoundPlus },
        ],
      },
      { label: 'Leave Requests', href: '/leave', icon: LuFileClock },
      { label: 'Todo', href: '/todo', icon: LuClipboardList },
      { label: 'Files', href: '/files', icon: LuFolderKanban },
      { label: 'Audit Logs', href: '/audit-logs', icon: LuShieldCheck },
      { label: 'Settings', href: '/settings', icon: LuSettings2 },
    ],
  },
];

export const doctorNavigation: NavigationSection[] = [
  {
    title: 'Doctor Space',
    items: [
      { label: 'Dashboard', href: '/doctor-portal', icon: LuLayoutDashboard },
      { label: 'Appointments', href: '/doctor-portal/appointments', icon: LuCalendarCheck2 },
      { label: 'My Patients', href: '/doctor-portal/patients', icon: LuUsers },
      { label: 'Profile', href: '/doctor-portal/profile', icon: LuUserCog },
    ],
  },
];

export const patientNavigation: NavigationSection[] = [
  {
    title: 'Patient Space',
    items: [
      { label: 'Dashboard', href: '/patientfolder/dashboard', icon: LuLayoutDashboard },
      { label: 'Appointments', href: '/patientfolder/appointments', icon: LuCalendarCheck2 },
      { label: 'Pharmacy', href: '/patientfolder/pharmacy', icon: LuReceiptText },
    ],
  },
];

export function getNavigationForRole(role: UserRole) {
  if (role === 'admin') {
    return adminNavigation;
  }

  if (role === 'doctor') {
    return doctorNavigation;
  }

  return patientNavigation;
}
