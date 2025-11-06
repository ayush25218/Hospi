'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LuLayoutDashboard,
  LuStethoscope,
  LuUsers,
  LuCalendarCheck,
  LuListTodo,
  LuUser,
  LuBedDouble,
  LuBuilding2,
  LuMails,
  LuMessageCircle,
  LuContact,
  LuFileCog,
  LuMapPin,
  LuChevronDown,
  LuPlus,
  LuList,
  LuX,
  LuSettings,
  LuHospital,
  LuBanknote,
  LuReceipt,
  LuCalendarOff,
  LuMegaphone,
  LuBed,
  LuShieldCheck,
  LuFileText,
  LuFilePlus,
  LuWallet,
} from 'react-icons/lu';
import { SiPaypal } from 'react-icons/si';

// --- Type Definitions ---
type SubMenuItem = {
  name: string;
  path: string;
  icon: React.ElementType;
};

type MenuItem = {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
  submenu?: SubMenuItem[];
};

// --- Naya, Behtar Menu Data ---

const mainMenu: MenuItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LuLayoutDashboard },
];

const clinicalMenu: MenuItem[] = [
  {
    name: 'Doctors',
    path: '/doctors',
    icon: LuStethoscope,
    submenu: [
      { name: 'Doctor List', path: '/doctor/list', icon: LuList },
      { name: 'Add Doctor', path: '/doctor/add', icon: LuPlus },
    ],
  },
  {
    name: 'Patients',
    path: '/patients',
    icon: LuUser,
    submenu: [
      { name: 'Patient List', path: '/patient/list', icon: LuList },
      { name: 'Add Patient', path: '/patient/add', icon: LuPlus },
      { name: 'IPD Patients', path: '/patient/ipd', icon: LuBed },
      { name: 'OPD Patients', path: '/patient/opd', icon: LuStethoscope },

    ],
  },
  { name: 'Appointments', path: '/appointment', icon: LuCalendarCheck },
  { name: 'Departments', path: '/departments', icon: LuBuilding2 },
  { name: 'Room Allotment', path: '/rooms', icon: LuBedDouble },
];

const hrMenu: MenuItem[] = [
  {
    name: 'Staff',
    path: '/staff',
    icon: LuUsers,
    submenu: [
      { name: 'All Staff', path: '/staff/list', icon: LuList },
      { name: 'Add Staff', path: '/staff/add', icon: LuPlus },
      { name: 'Roles & Permissions', path: '/staff/roles', icon: LuShieldCheck },
    ],
  },
  { name: 'Leave Requests', path: '/leave', icon: LuCalendarOff },
  { name: 'Todo List', path: '/todo', icon: LuListTodo },
];

const financeMenu: MenuItem[] = [
  {
    name: 'Billing',
    path: '/billing',
    icon: LuWallet,
    submenu: [
      { name: 'Create Invoice', path: '/Billing/create', icon: LuFilePlus },
      { name: 'All Invoices', path: '/Billing/allInvoice', icon: LuFileText },
    ],
  },
  { name: 'Payments', path: '/payment', icon: SiPaypal },
  { name: 'Payroll', path: '/payroll', icon: LuBanknote },
  { name: 'Expenses', path: '/expenses', icon: LuReceipt },
];

const commsMenu: MenuItem[] = [
  // { name: 'Email', path: '/email', icon: LuMails, badge: 12 },
  // { name: 'Chat', path: '/chat', icon: LuMessageCircle },
  { name: 'Notice Board', path: '/notice', icon: LuMegaphone },
  { name: 'Contacts', path: '/contacts', icon: LuContact },
];

const systemMenu: MenuItem[] = [
  { name: 'Analytics', path: '/analytics', icon: LuFileCog },
  // { name: 'Hospital Centres', path: '/centres', icon: LuMapPin },
  { name: 'File Manager', path: '/files', icon: LuFileCog },
  { name: 'Settings', path: '/settings', icon: LuSettings },
];

// --- Props for Sidebar ---
type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Responsive Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72
                    bg-linear-to-b from-indigo-900 to-gray-900 text-white shadow-xl
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:sticky lg:translate-x-0 lg:shadow-none lg:z-auto`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Header */}
          <div className="flex h-20 items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <LuHospital className="h-8 w-8 text-indigo-300" />
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Hospi!
              </h1>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-indigo-200 hover:bg-indigo-800 lg:hidden"
              aria-label="Close sidebar"
            >
              <LuX className="h-6 w-6" />
            </button>
          </div>

          {/* Menu Sections */}
          <nav className="flex-1 px-4 space-y-6 pb-6">
            <SidebarMenu title="Main" items={mainMenu} />
            <SidebarMenu title="Clinical" items={clinicalMenu} />
            <SidebarMenu title="Human Resources" items={hrMenu} />
            <SidebarMenu title="Finance" items={financeMenu} />
            <SidebarMenu title="Communication" items={commsMenu} />
            <SidebarMenu title="System" items={systemMenu} />
          </nav>
        </div>
      </aside>
    </>
  );
}

// --- SidebarMenu Component (Helper) ---
function SidebarMenu({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <div className="space-y-2">
      <h2 className="px-4 text-xs font-semibold text-indigo-300 uppercase tracking-wider">
        {title}
      </h2>
      <ul className="space-y-1">
        {items.map((item) => (
          <SidebarMenuItem key={item.name} item={item} />
        ))}
      </ul>
    </div>
  );
}

// --- SidebarMenuItem Component (Helper for links and submenus) ---
function SidebarMenuItem({ item }: { item: MenuItem }) {
  const pathname = usePathname();
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(
    item.submenu ? pathname.startsWith(item.path) : false
  );

  const isActive = pathname === item.path;

  // --- Handler for Submenu Toggle ---
  const toggleSubmenu = () => {
    setIsSubmenuOpen((prev) => !prev);
  };

  // --- Component for Submenu ---
  if (item.submenu) {
    return (
      <li>
        <button
          onClick={toggleSubmenu}
          className={`flex items-center justify-between w-full px-4 py-3 rounded-lg
                      transition-colors duration-200
                      ${
                        isSubmenuOpen
                          ? 'text-white'
                          : 'text-gray-300 hover:text-white hover:bg-indigo-800'
                      }`}
        >
          <div className="flex items-center gap-3">
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.name}</span>
          </div>
          <LuChevronDown
            className={`h-4 w-4 transition-transform ${
              isSubmenuOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        <AnimatePresence>
          {isSubmenuOpen && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="ml-4 pl-4 border-l border-indigo-700 overflow-hidden"
            >
              {item.submenu.map((subItem) => {
                const isSubActive = pathname === subItem.path;
                return (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg
                                  transition-colors duration-200 text-sm
                                  ${
                                    isSubActive
                                      ? 'text-white font-medium'
                                      : 'text-gray-400 hover:text-white'
                                  }`}
                    >
                      <subItem.icon className="h-4 w-4" />
                      <span>{subItem.name}</span>
                    </Link>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </li>
    );
  }

  // --- Component for Regular Link ---
  return (
    <li>
      <Link
        href={item.path}
        className={`flex items-center justify-between px-4 py-3 rounded-lg
                    transition-colors duration-200
                    ${
                      isActive
                        ? 'bg-indigo-700 bg-opacity-75 text-white shadow-inner'
                        : 'text-gray-300 hover:text-white hover:bg-indigo-800'
                    }`}
      >
        <div className="flex items-center gap-3">
          <item.icon className="h-5 w-5" />
          <span className="font-medium">{item.name}</span>
        </div>
        {item.badge && (
          <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  );
}


