'use client'; // Filters, state, aur actions ke liye zaroori hai

import { useState } from 'react';
import Link from 'next/link';
import {
  LuBedDouble,
  LuUserPlus,
  LuSearch,
  LuBuilding,
  LuPencil,
  LuTrash2,
  LuUsers,
  LuFileText,
  LuKey,
  LuCopy,
} from 'react-icons/lu';

// --- Types ---
interface AdmittedPatient {
  id: number;
  patientId: string;
  reportAccessCode: string;
  name: string;
  age: number;
  phone?: string; // Added optional phone property
  roomNumber: string;
  bedNumber: string;
  admittedDate: string;
  doctorName: string;
  department: string;
  imageUrl: string;
}

// --- Dummy Data ---
const dummyAdmittedPatients: AdmittedPatient[] = [
  {
    id: 1,
    patientId: 'PID-2025-00123',
    reportAccessCode: '882194',
    name: 'Aarav Sharma',
    age: 34,
    phone: '9876543210', // Added phone
    roomNumber: '101-A',
    bedNumber: 'B1',
    admittedDate: '2025-11-05',
    doctorName: 'Dr. Priya Gupta',
    department: 'Cardiology',
    imageUrl: 'https://via.placeholder.com/150/007BFF/FFFFFF?text=AS',
  },
  {
    id: 2,
    patientId: 'PID-2025-00124',
    reportAccessCode: '312755',
    name: 'Riya Singh',
    age: 28,
    phone: '9876543211', // Added phone
    roomNumber: '301-ICU',
    bedNumber: 'ICU-3',
    admittedDate: '2025-11-04',
    doctorName: 'Dr. Rohan Joshi',
    department: 'Neurology',
    imageUrl: 'https://via.placeholder.com/150/28A745/FFFFFF?text=RS',
  },
  {
    id: 3,
    patientId: 'PID-2025-00125',
    reportAccessCode: '739021',
    name: 'Vikram Mehra',
    age: 45,
    phone: '9876543212', // Added phone
    roomNumber: '202-B',
    bedNumber: 'B2',
    admittedDate: '2025-11-05',
    doctorName: 'Dr. Anjali Rao',
    department: 'Pediatrics',
    imageUrl: 'https://via.placeholder.com/150/FFC107/FFFFFF?text=VM',
  },
];

const departments = ['All Departments', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Surgery'];

/**
 * ==========================================
 * Main IPD Page Component
 * ==========================================
 */
export default function IPDPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All Departments');

  // Filter logic
  const filteredPatients = dummyAdmittedPatients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.phone && patient.phone.includes(searchTerm));
    
    const matchesDept =
      deptFilter === 'All Departments' || patient.department === deptFilter;

    return matchesSearch && matchesDept;
  });
  
  // Copy karne ke liye helper function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied to clipboard: ${text}`);
  };

  return (
    <div className="space-y-8">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LuBedDouble className="h-8 w-8 text-indigo-700" />
          <h1 className="text-3xl font-bold text-gray-900">In-Patient (IPD) Management</h1>
        </div>
        <Link
          href="/patients/add"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg
                     hover:bg-indigo-700 transition-colors"
        >
          <LuUserPlus className="w-5 h-5" />
          Admit New Patient
        </Link>
      </div>

      {/* --- Filters Bar --- */}
      <div className="bg-white p-4 rounded-xl shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Bar */}
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
        {/* Department Dropdown */}
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

      {/* --- IPD Patient List Table --- */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full text-left">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Patient Details</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Patient ID</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Report Access Code</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Room / Bed</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Doctor</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={patient.imageUrl}
                          alt={patient.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{patient.name}</p>
                          <p className="text-sm text-gray-500">{patient.age} years old</p>
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
                      <p className="text-sm font-medium text-gray-700">{patient.roomNumber}</p>
                      <p className="text-xs text-gray-500">Bed: {patient.bedNumber}</p>
                    </td>
                    
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-700">{patient.doctorName}</p>
                      <p className="text-xs text-gray-500">{patient.department}</p>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-blue-600 hover:text-blue-800" title="View Reports (Admin)">
                          <LuFileText className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-indigo-600 hover:text-indigo-800" title="Edit Admission">
                          <LuPencil className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    No admitted patients found.
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
