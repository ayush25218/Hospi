'use client'; // Filters aur state ke liye zaroori hai

import { useState } from 'react';
import Link from 'next/link';
import {
  LuCalendarCheck,
  LuCalendarPlus,
  LuPrinter,
  LuSearch,
  LuCalendarDays,
  LuFilter,
  LuPencil,
  
  LuHourglass,
} from 'react-icons/lu';

// Dummy Appointment Data
// (Asli app mein, yeh data ek alag file ya API se aayega)
const allAppointments = [
  {
    id: 1,
    patientName: 'Aarav Sharma',
    doctorName: 'Dr. Priya Gupta',
    department: 'Cardiology',
    dateTime: new Date(new Date().setHours(10, 30)), // Aaj
    status: 'Pending',
  },
  {
    id: 2,
    patientName: 'Riya Singh',
    doctorName: 'Dr. Rohan Joshi',
    department: 'Neurology',
    dateTime: new Date(new Date().setHours(11, 0)), // Aaj
    status: 'Completed',
  },
  {
    id: 3,
    patientName: 'Vikram Mehra',
    doctorName: 'Dr. Anjali Rao',
    department: 'Pediatrics',
    dateTime: new Date(new Date().setDate(new Date().getDate() - 30)), // Pichhle mahine
    status: 'Pending',
  },
  {
    id: 4,
    patientName: 'Priya Joshi',
    doctorName: 'Dr. Priya Gupta',
    department: 'Cardiology',
    dateTime: new Date(new Date().setDate(new Date().getDate() - 400)), // Pichhle saal
    status: 'Cancelled',
  },
];

type AppointmentStatus = 'All' | 'Pending' | 'Completed' | 'Cancelled';
type TimeRange = 'all' | 'daily' | 'monthly' | 'quarterly' | 'yearly';

const statuses: AppointmentStatus[] = [
  'All',
  'Pending',
  'Completed',
  'Cancelled',
];
const filterButtons: { label: string; range: TimeRange }[] = [
  { label: 'All Time', range: 'all' },
  { label: 'Daily', range: 'daily' },
  { label: 'Monthly', range: 'monthly' },
  { label: 'Quarterly', range: 'quarterly' },
  { label: 'Yearly', range: 'yearly' },
];

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [statusFilter, setStatusFilter] =
    useState<AppointmentStatus>('All');

  // Filter logic
  const filteredAppointments = allAppointments.filter((appt) => {
    const today = new Date();
    const apptDate = new Date(appt.dateTime);

    // 1. Search Filter
    const matchesSearch =
      appt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appt.doctorName.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Status Filter
    const matchesStatus =
      statusFilter === 'All' || appt.status === statusFilter;

    // 3. Time Range Filter (NAYA)
    let matchesTime = false;
    switch (timeRange) {
      case 'daily':
        matchesTime = apptDate.toDateString() === today.toDateString();
        break;
      case 'monthly':
        matchesTime =
          apptDate.getMonth() === today.getMonth() &&
          apptDate.getFullYear() === today.getFullYear();
        break;
      case 'quarterly':
        const currentQuarter = Math.floor(today.getMonth() / 3);
        const apptQuarter = Math.floor(apptDate.getMonth() / 3);
        matchesTime =
          apptQuarter === currentQuarter &&
          apptDate.getFullYear() === today.getFullYear();
        break;
      case 'yearly':
        matchesTime = apptDate.getFullYear() === today.getFullYear();
        break;
      case 'all':
      default:
        matchesTime = true;
        break;
    }

    return matchesSearch && matchesStatus && matchesTime;
  });

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Status ke liye color aur icon chunein
  const getStatusProps = (status: string) => {
    switch (status) {
      case 'Completed':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <div className="w-4 h-4" />,
        };
      case 'Pending':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <LuHourglass className="w-4 h-4" />,
        };
      case 'Cancelled':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <div className="w-4 h-4" />,
        };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: null };
    }
  };

  return (
    <div className="space-y-8">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 non-printable">
        <div className="flex items-center gap-3">
          <LuCalendarCheck className="h-8 w-8 text-indigo-700" />
          <h1 className="text-3xl font-bold text-gray-900">
            Manage Appointments
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg
                       hover:bg-gray-700 transition-colors"
          >
            <LuPrinter className="w-5 h-5" />
            Print List
          </button>
          <Link
            href="/appointments/add"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg
                       hover:bg-indigo-700 transition-colors"
          >
            <LuCalendarPlus className="w-5 h-5" />
            New Appointment
          </Link>
        </div>
      </div>

      {/* --- Search and Filters (UPDATED) --- */}
      <div className="bg-white p-4 rounded-xl shadow-md space-y-4 non-printable">
        {/* Search & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <span className="absolute left-3 top-3.5 text-gray-400">
              <LuSearch className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Search Patient or Doctor..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-3.5 text-gray-400">
              <LuFilter className="w-5 h-5" />
            </span>
            <select
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                         appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus)}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Time Filters (NAYA) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-600 flex items-center">
            <LuCalendarDays className="w-4 h-4 mr-2" />
            Filter by Date:
          </span>
          {filterButtons.map((btn) => (
            <button
              key={btn.range}
              onClick={() => setTimeRange(btn.range)}
              className={`px-3 py-1 text-sm font-medium rounded-full transition-colors
                ${
                  timeRange === btn.range
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- Appointments List Table --- */}
      <div id="printable-appointment-list" className="printable-area bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full text-left">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Patient</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Doctor</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Date & Time</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 non-printable">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appt) => {
                  const statusProps = getStatusProps(appt.status);
                  return (
                    <tr key={appt.id} className="border-b border-gray-100 hover:bg-gray-50">
                      {/* ... other cells ... */}
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{appt.patientName}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-700">{appt.doctorName}</p>
                        <p className="text-xs text-gray-500">{appt.department}</p>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {appt.dateTime.toLocaleDateString()} - {appt.dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full 
                                      text-xs font-medium ${statusProps.color}`}
                        >
                          {statusProps.icon}
                          {appt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 non-printable">
                        <div className="flex items-center gap-2">
                          {/* --- EDIT BUTTON (UPDATED) --- */}
                          <Link 
                            href={`/appointments/edit/${appt.id}`}
                            className="p-2 text-indigo-600 hover:text-indigo-800" 
                            title="Edit"
                          >
                            <LuPencil className="w-4 h-4" />
                          </Link>
                          {appt.status === 'Pending' && (
                            <button className="p-2 text-red-600 hover:text-red-800" title="Cancel">
                              <div className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    No appointments found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}