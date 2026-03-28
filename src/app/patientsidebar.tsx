'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaTachometerAlt,
  FaCalendarCheck,
  FaUserMd,
  FaUserInjured,
  FaPrescriptionBottleAlt,
  FaFlask,
  FaXRay,
  FaTint,
  FaDownload,
  FaBars,
  FaTimes,
  FaHospitalAlt,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Sidebar Data
const menuItems = [
  { name: 'Dashboard', path: '/patientfolder/dashboard', icon: <FaTachometerAlt /> },
  { name: 'Appointments', path: '/patientfolder/appointments', icon: <FaCalendarCheck /> },
  { name: 'Pharmacy', path: '/patientfolder/pharmacy', icon: <FaPrescriptionBottleAlt /> },
  { name: 'Pathology', path: '/pathology', icon: <FaFlask /> },
  { name: 'Radiology', path: '/radiology', icon: <FaXRay /> },
  { name: 'Blood Bank', path: '/blood-bank', icon: <FaTint /> },
  { name: 'Download Center', path: '/downloads', icon: <FaDownload /> },
];

// Sidebar Component
export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  return (
    <>
      {/* Toggle button for mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-5 left-5 z-50 p-2 bg-indigo-700 text-white rounded-lg shadow-lg hover:bg-indigo-600 lg:hidden"
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className="fixed top-0 left-0 h-screen w-72 bg-linear-to-b from-indigo-900 to-gray-900 text-white shadow-xl flex flex-col z-40 lg:sticky lg:translate-x-0"
          >
            {/* Header */}
            <div className="flex items-center justify-center gap-3 p-6 border-b border-indigo-800">
              <FaHospitalAlt className="text-indigo-300 text-3xl" />
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Hospi7
              </h1>
            </div>

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-700 scrollbar-track-gray-900 px-3 py-4 space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    href={item.path}
                    key={item.name}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
                    ${
                      isActive
                        ? 'bg-indigo-700 text-white shadow-inner'
                        : 'text-gray-300 hover:text-white hover:bg-indigo-800'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-indigo-800 text-center text-xs text-indigo-300">
              Hospi7
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
