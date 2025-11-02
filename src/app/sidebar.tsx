'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LuLayoutDashboard,
  LuStethoscope,
  LuCalendarCheck,
  LuListTodo,
  LuUser,
  LuBedDouble,
  LuBuilding2,
  LuMails,
  LuMessageCircle,
  LuUsers,
  LuContact,
  LuFileCog,
  LuMapPin,
  LuChevronDown,
  LuPlus,
  LuPencil,
  LuList,
  LuX,
  LuFileChartPie,
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

// --- Menu Data ---
const hospitalMenu: MenuItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LuLayoutDashboard },
  {
    name: 'Doctors',
    path: '/doctors',
    icon: LuStethoscope,
    submenu: [
      { name: 'List', path: '/doctors', icon: LuList },
      { name: 'Add', path: '/doctors/add', icon: LuPlus },
      { name: 'Edit', path: '/doctors/edit', icon: LuPencil },
      { name: 'Report', path: '/doctors/report', icon: LuFileChartPie },
    ],
  },
  { name: 'Appointment', path: '/appointment', icon: LuCalendarCheck },
  { name: 'Todo List', path: '/todo', icon: LuListTodo },
  {
    name: 'Patients',
    path: '/patients',
    icon: LuUser,
    submenu: [
      { name: 'List', path: '/patients', icon: LuList },
      { name: 'Add', path: '/patients/add', icon: LuPlus },
      { name: 'Edit', path: '/patients/edit', icon: LuPencil },
      { name: 'Report', path: '/patients/report', icon: LuFileChartPie },
    ],
  },
  { name: 'Room Allotment', path: '/rooms', icon: LuBedDouble },
  { name: 'Departments', path: '/departments', icon: LuBuilding2 },
  { name: 'Payments', path: '/payments', icon: SiPaypal },
];

const adminMenu: MenuItem[] = [
  { name: 'Email', path: '/email', icon: LuMails, badge: 12 },
  { name: 'Chat', path: '/chat', icon: LuMessageCircle },
  { name: 'Our Staffs', path: '/staff', icon: LuUsers },
  { name: 'Contacts', path: '/contacts', icon: LuContact },
  { name: 'File Manager', path: '/files', icon: LuFileCog },
  { name: 'Our Centres', path: '/centres', icon: LuMapPin },
];

// --- Props for Sidebar ---
type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Responsive Sidebar Container
        - Mobile: 'fixed' with slide-in/out transition
        - Desktop: 'sticky' and always visible
      */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72 bg-white shadow-xl
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:sticky lg:translate-x-0 lg:shadow-none lg:z-auto`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Header */}
          <div className="flex h-20 items-center justify-between p-6">
            <h1 className="text-xl font-bold text-gray-400 uppercase">
              Hospital
            </h1>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 lg:hidden"
              aria-label="Close sidebar"
            >
              <LuX className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Menu Sections */}
          <nav className="flex-1 px-4 space-y-6">
            <SidebarMenu title="Hospital" items={hospitalMenu} />
            <SidebarMenu title="Admin" items={adminMenu} />
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
      <h2 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
          className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg
                      transition-colors duration-200
                      ${
                        isSubmenuOpen
                          ? 'text-green-600'
                          : 'text-gray-700 hover:bg-gray-100'
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
              className="ml-4 pl-4 border-l border-gray-200 overflow-hidden"
            >
              {item.submenu.map((subItem) => {
                const isSubActive = pathname === subItem.path;
                return (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg
                                  transition-colors duration-200
                                  ${
                                    isSubActive
                                      ? 'text-green-600'
                                      : 'text-gray-600 hover:bg-gray-100'
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
        className={`flex items-center justify-between px-4 py-2.5 rounded-lg
                    transition-colors duration-200
                    ${
                      isActive
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
      >
        <div className="flex items-center gap-3">
          <item.icon className="h-5 w-5" />
          <span className="font-medium">{item.name}</span>
        </div>
        {item.badge && (
          <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-600 rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  );
}