'use client'; // We need client components for search, filter, and print

import { useState } from 'react';
import Link from 'next/link';
import {
  LuUserPlus,
  LuPrinter,
  LuSearch,
  LuBuilding2,
  LuPencil,
  LuTrash2,
  LuStethoscope,
} from 'react-icons/lu';

// Dummy data for the doctor list
const doctors = [
  {
    id: 1,
    name: 'Dr. Priya Gupta',
    imageUrl: 'https://via.placeholder.com/150/007BFF/FFFFFF?text=PG',
    doctorId: 'DOC-001',
    department: 'Cardiology',
    specialization: 'Heart Surgeon',
    phone: '+91 98765 43210',
    email: 'priya.gupta@hospi.com',
    status: 'On Duty',
  },
  {
    id: 2,
    name: 'Dr. Rohan Joshi',
    imageUrl: 'https://via.placeholder.com/150/28A745/FFFFFF?text=RJ',
    doctorId: 'DOC-002',
    department: 'Neurology',
    specialization: 'Neurosurgeon',
    phone: '+91 98765 43211',
    email: 'rohan.joshi@hospi.com',
    status: 'Offline',
  },
  {
    id: 3,
    name: 'Dr. Anjali Rao',
    imageUrl: 'https://via.placeholder.com/150/FFC107/FFFFFF?text=AR',
    doctorId: 'DOC-003',
    department: 'Pediatrics',
    specialization: 'Pediatrician',
    phone: '+91 98765 43212',
    email: 'anjali.rao@hospi.com',
    status: 'On Leave',
  },
  // Add more dummy doctors as needed
];

// Department list for the filter
const departments = [
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Surgery',
];

export default function DoctorsListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Filter logic
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.doctorId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      departmentFilter === '' || doctor.department === departmentFilter;

    return matchesSearch && matchesDepartment;
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
          <LuStethoscope className="h-8 w-8 text-indigo-700" />
          <h1 className="text-3xl font-bold text-gray-900">Manage Doctors</h1>
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
            href="/doctor/add"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg
                       hover:bg-indigo-700 transition-colors"
          >
            <LuUserPlus className="w-5 h-5" />
            Add New Doctor
          </Link>
        </div>
      </div>

      {/* --- Search and Filters --- */}
      <div className="bg-white p-4 rounded-xl shadow-md space-y-4 md:space-y-0 md:flex md:items-center md:gap-4 non-printable">
        <div className="relative flex-1">
          <span className="absolute left-3 top-3.5 text-gray-400">
            <LuSearch className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative flex-1">
          <span className="absolute left-3 top-3.5 text-gray-400">
            <LuBuilding2 className="w-5 h-5" />
          </span>
          <select
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                       appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Doctor List Table --- */}
      <div id="printable-doctor-list" className="printable-area bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full text-left">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Doctor ID</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Department</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Phone</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 non-printable">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doctor) => (
                <tr key={doctor.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={doctor.imageUrl}
                        alt={doctor.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{doctor.name}</p>
                        <p className="text-sm text-gray-500">{doctor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{doctor.doctorId}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{doctor.specialization}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{doctor.phone}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium
                        ${
                          doctor.status === 'On Duty'
                            ? 'bg-green-100 text-green-800'
                            : doctor.status === 'Offline'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                    >
                      {doctor.status}
                    </span>
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
          {filteredDoctors.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No doctors found matching your criteria.
            </div>
          )}
        </div>
      </div>
      
      {/* --- Pagination Placeholder --- */}
      <div className="flex items-center justify-between non-printable">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium">{filteredDoctors.length}</span> results
        </p>
        {/* Yahaan aap ek poora pagination component add kar sakte hain */}
      </div>
    </div>
  );
}