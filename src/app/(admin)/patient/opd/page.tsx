'use client'; // Filters, state, aur actions ke liye zaroori hai

import { useState } from 'react';
import Link from 'next/link';
import {
  LuUsers,
  LuUserPlus,
  LuSearch,
  LuBuilding,
  LuPencil,
  LuFileText,
  LuKey,
  LuCopy,
  LuCalendarDays,
  LuFilter,
  LuClock,
  LuCircleCheck,    // Changed from LuCheckCircle
  LuCircleX,
} from 'react-icons/lu';

// --- Dummy Data ---
// (Asli app mein, yeh data API se aayega)
const dummyOpdPatients = [
  {
    id: 1,
    patientId: 'PID-2025-00123',
    reportAccessCode: '882194',
    name: 'Aarav Sharma',
    age: 34,
    phone: '+91 98765 43210',
    appointmentTime: new Date(new Date().setHours(10, 30)), // Aaj
    doctorName: 'Dr. Priya Gupta',
    department: 'Cardiology',
    status: 'Consulted',
  },
  {
    id: 2,
    patientId: 'PID-2025-00126',
    reportAccessCode: '456123',
    name: 'Sneha Patil',
    age: 22,
    phone: '+91 98765 43214',
    appointmentTime: new Date(new Date().setHours(10, 45)), // Aaj
    doctorName: 'Dr. Anjali Rao',
    department: 'Pediatrics',
    status: 'Waiting',
  },
  {
    id: 3,
    patientId: 'PID-2025-00125',
    reportAccessCode: '739021',
    name: 'Vikram Mehra',
    age: 45,
    phone: '+91 98765 43212',
    appointmentTime: new Date(new Date().setDate(new Date().getDate() - 1)), // Kal
    doctorName: 'Dr. Anjali Rao',
    department: 'Pediatrics',
    status: 'Consulted',
  },
  {
    id: 4,
    patientId: 'PID-2025-00127',
    reportAccessCode: '987654',
    name: 'Mohit Desai',
    age: 58,
    phone: '+91 98765 43215',
    appointmentTime: new Date(new Date().setHours(9, 30)), // Aaj
    doctorName: 'Dr. Rohan Joshi',
    department: 'Neurology',
    status: 'Cancelled',
  },
];

type OpdStatus = 'All' | 'Waiting' | 'Consulted' | 'Cancelled';
type TimeRange = 'daily' | 'monthly' | 'yearly' | 'all';
const departments = ['All Departments', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Surgery'];

/**
 * ==========================================
 * Main OPD Page Component
 * ==========================================
 */
export default function OPDPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState<OpdStatus>('All');
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');

  // Filter logic
  const filteredPatients = dummyOpdPatients.filter((patient) => {
    const today = new Date();
    const apptDate = new Date(patient.appointmentTime);

    // Search
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm);
    
    // Department
    const matchesDept =
      deptFilter === 'All Departments' || patient.department === deptFilter;

    // Status
    const matchesStatus =
      statusFilter === 'All' || patient.status === statusFilter;

    // Time Range
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
      case 'yearly':
        matchesTime = apptDate.getFullYear() === today.getFullYear();
        break;
      case 'all':
      default:
        matchesTime = true;
        break;
    }

    return matchesSearch && matchesDept && matchesStatus && matchesTime;
  });

  // Copy helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied to clipboard: ${text}`);
  };

  // Status Badge helper
  const getStatusProps = (status: OpdStatus) => {
    switch (status) {
      case 'Consulted':
        return { color: 'bg-green-100 text-green-800', icon: LuCircleCheck };
      case 'Waiting':
        return { color: 'bg-yellow-100 text-yellow-800', icon: LuClock };
      case 'Cancelled':
        return { color: 'bg-red-100 text-red-800', icon: LuCircleX };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: LuUsers };
    }
  };

  return (
    <div className="space-y-8">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LuUsers className="h-8 w-8 text-indigo-700" />
          <h1 className="text-3xl font-bold text-gray-900">Out-Patient (OPD) Management</h1>
        </div>
        <Link
          href="/patients/add" // Links to the "fast add" patient form
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg
                     hover:bg-indigo-700 transition-colors"
        >
          <LuUserPlus className="w-5 h-5" />
          New Patient Registration
        </Link>
      </div>

      {/* --- Filters Bar --- */}
      <div className="bg-white p-4 rounded-xl shadow-md space-y-4">
        {/* Search & Dept */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <span className="absolute left-3 top-3.5 text-gray-400"><LuSearch className="w-5 h-5" /></span>
            <input
              type="text"
              placeholder="Search by name, Patient ID, or phone..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-3.5 text-gray-400"><LuBuilding className="w-5 h-5" /></span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg appearance-none
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>
        </div>
        {/* Time & Status Filters */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-600"><LuCalendarDays className="w-4 h-4 inline mr-1" />Date:</span>
            {(['daily', 'monthly', 'yearly', 'all'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  timeRange === range ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-600"><LuFilter className="w-4 h-4 inline mr-1" />Status:</span>
            {(['All', 'Waiting', 'Consulted', 'Cancelled'] as OpdStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  statusFilter === status ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- OPD Patient List Table --- */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full text-left">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Patient Details</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Patient ID</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Report Access Code</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Visit Details</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => {
                  const statusProps = getStatusProps(patient.status as OpdStatus);
                  const StatusIcon = statusProps.icon;
                  return (
                    <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-gray-900">{patient.name}</p>
                            <p className="text-sm text-gray-500">{patient.phone}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <code className="text-sm font-medium text-gray-700">{patient.patientId}</code>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <code className="text-lg font-bold text-indigo-600">{patient.reportAccessCode}</code>
                          <button 
                            onClick={() => copyToClipboard(patient.reportAccessCode)}
                            className="p-1 text-gray-500 hover:text-indigo-600"
                            title="Copy Code"
                          >
                            <LuCopy className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-700">{patient.doctorName}</p>
                        <p className="text-xs text-gray-500">{patient.department}</p>
                        <p className="text-xs text-gray-500 mt-1">{patient.appointmentTime.toLocaleString()}</p>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full 
                                      text-xs font-medium ${statusProps.color}`}
                        >
                          <StatusIcon className="w-4 h-4" />
                          {patient.status}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-blue-600 hover:text-blue-800" title="View Reports (Admin)">
                            <LuFileText className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-indigo-600 hover:text-indigo-800" title="Edit Visit">
                            <LuPencil className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    No OPD patients found matching your criteria.
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