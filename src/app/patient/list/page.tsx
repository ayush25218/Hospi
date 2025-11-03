'use client'; // State aur buttons ke liye zaroori hai

import { useState } from 'react';
import Link from 'next/link';
import {
  LuUserPlus,
  LuPrinter,
  LuSearch,
  LuCalendarDays,
  LuPencil,
  LuTrash2,
  LuUsers,
} from 'react-icons/lu';

// Dummy Patient Data (Aap isse database se fetch karenge)
const allPatients = [
  {
    id: 1,
    patientId: 'PAT-001',
    name: 'Aarav Sharma',
    age: 34,
    phone: '+91 98765 43210',
    registrationDate: new Date(), // Aaj
    imageUrl: 'https://via.placeholder.com/150/007BFF/FFFFFF?text=AS',
  },
  {
    id: 2,
    patientId: 'PAT-002',
    name: 'Riya Singh',
    age: 28,
    phone: '+91 98765 43211',
    registrationDate: new Date(new Date().setDate(new Date().getDate() - 1)), // Kal
    imageUrl: 'https://via.placeholder.com/150/28A745/FFFFFF?text=RS',
  },
  {
    id: 3,
    patientId: 'PAT-003',
    name: 'Vikram Mehra',
    age: 45,
    phone: '+91 98765 43212',
    registrationDate: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Pichhle mahine
    imageUrl: 'https://via.placeholder.com/150/FFC107/FFFFFF?text=VM',
  },
  {
    id: 4,
    patientId: 'PAT-004',
    name: 'Priya Joshi',
    age: 52,
    phone: '+91 98765 43213',
    registrationDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)), // Pichhle saal
    imageUrl: 'https://via.placeholder.com/150/DC3545/FFFFFF?text=PJ',
  },
];

type TimeRange = 'all' | 'daily' | 'monthly' | 'quarterly' | 'yearly';

const filterButtons: { label: string; range: TimeRange }[] = [
  { label: 'All Time', range: 'all' },
  { label: 'Daily', range: 'daily' },
  { label: 'Monthly', range: 'monthly' },
  { label: 'Quarterly', range: 'quarterly' },
  { label: 'Yearly', range: 'yearly' },
];

export default function PatientsListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  // Filter logic
  const filteredPatients = allPatients.filter((patient) => {
    const today = new Date();
    const regDate = new Date(patient.registrationDate);

    // 1. Search Filter
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm);

    // 2. Time Range Filter
    let matchesTime = false;
    switch (timeRange) {
      case 'daily':
        matchesTime = regDate.toDateString() === today.toDateString();
        break;
      case 'monthly':
        matchesTime =
          regDate.getMonth() === today.getMonth() &&
          regDate.getFullYear() === today.getFullYear();
        break;
      case 'quarterly':
        const currentQuarter = Math.floor(today.getMonth() / 3);
        const patientQuarter = Math.floor(regDate.getMonth() / 3);
        matchesTime =
          patientQuarter === currentQuarter &&
          regDate.getFullYear() === today.getFullYear();
        break;
      case 'yearly':
        matchesTime = regDate.getFullYear() === today.getFullYear();
        break;
      case 'all':
      default:
        matchesTime = true;
        break;
    }

    return matchesSearch && matchesTime;
  });

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 non-printable">
        <div className="flex items-center gap-3">
          <LuUsers className="h-8 w-8 text-indigo-700" />
          <h1 className="text-3xl font-bold text-gray-900">Manage Patients</h1>
        </div>

        {/* --- Action Buttons --- */}
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
            href="/patient/add"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg
                       hover:bg-indigo-700 transition-colors"
          >
            <LuUserPlus className="w-5 h-5" />
            Add New Patient
          </Link>
        </div>
      </div>

      {/* --- Search and Filters --- */}
      <div className="bg-white p-4 rounded-xl shadow-md space-y-4 non-printable">
        {/* Search Bar */}
        <div className="relative">
          <span className="absolute left-3 top-3.5 text-gray-400">
            <LuSearch className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Search by name, patient ID, or phone..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Time Filters */}
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

      {/* --- Patient List Table --- */}
      <div id="printable-patient-list" className="printable-area bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full text-left">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Patient Name</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Patient ID</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Age</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Phone</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Registration Date</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 non-printable">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
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
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{patient.patientId}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{patient.age}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{patient.phone}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {patient.registrationDate.toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 non-printable">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-indigo-600 hover:text-indigo-800">
                        <LuPencil className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:text-red-800">
                        <LuTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPatients.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No patients found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}