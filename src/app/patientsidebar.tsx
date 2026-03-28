'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaTachometerAlt,
  FaCalendarCheck,
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

const menuItems = [
  { name: 'Dashboard', path: '/patientfolder/dashboard', icon: <FaTachometerAlt /> },
  { name: 'Appointments', path: '/patientfolder/appointments', icon: <FaCalendarCheck /> },
  { name: 'Pharmacy', path: '/patientfolder/pharmacy', icon: <FaPrescriptionBottleAlt /> },
  { name: 'Pathology', path: '/pathology', icon: <FaFlask /> },
  { name: 'Radiology', path: '/radiology', icon: <FaXRay /> },
  { name: 'Blood Bank', path: '/blood-bank', icon: <FaTint /> },
  { name: 'Download Center', path: '/downloads', icon: <FaDownload /> },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-5 left-5 z-50 p-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-500 lg:hidden transition"
      >
        {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 h-screen w-72 
            bg-gradient-to-b from-indigo-900 via-indigo-800 to-gray-900
            text-white shadow-2xl flex flex-col z-40 
            border-r border-white/10 backdrop-blur-lg"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-6 border-b border-white/10">
              <div className="p-2 bg-indigo-500/20 rounded-xl">
                <FaHospitalAlt className="text-indigo-300 text-2xl" />
              </div>
              <h1 className="text-xl font-semibold tracking-wide">
                Hospi7
              </h1>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;

                return (
                  <Link href={item.path} key={item.name}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
                      
                      ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`p-2 rounded-lg transition
                        ${
                          isActive
                            ? 'bg-white/20'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {item.icon}
                      </div>

                      {/* Text */}
                      <span className="text-sm font-medium tracking-wide">
                        {item.name}
                      </span>

                      {/* Active Dot */}
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-white rounded-full" />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 text-center text-xs text-gray-400">
              © 2026 Hospi7
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}