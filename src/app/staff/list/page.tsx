'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LuUserPlus,
  LuSearch,
  LuBuilding2,
  LuPencil,
  LuTrash2,
  LuUserCog,
  LuUsers,
} from 'react-icons/lu';

// Dummy staff data
const staffMembers = [
  {
    id: 1,
    name: 'Amit Sharma',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    staffId: 'STF-001',
    department: 'Front Desk',
    role: 'Receptionist',
    phone: '+91 98765 43210',
    email: 'amit.sharma@hospital.com',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Priya Singh',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/2922/2922561.png',
    staffId: 'STF-002',
    department: 'Pharmacy',
    role: 'Pharmacist',
    phone: '+91 98123 45678',
    email: 'priya.singh@hospital.com',
    status: 'On Leave',
  },
  {
    id: 3,
    name: 'Ravi Kumar',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/1999/1999625.png',
    staffId: 'STF-003',
    department: 'Pathology',
    role: 'Lab Technician',
    phone: '+91 91234 56789',
    email: 'ravi.kumar@hospital.com',
    status: 'Inactive',
  },
];

// Department filter list
const departments = ['Front Desk', 'Pharmacy', 'Pathology', 'Emergency', 'Billing'];

export default function StaffListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Filter logic
  const filteredStaff = staffMembers.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.staffId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      departmentFilter === '' || staff.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="space-y-8">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LuUsers className="h-8 w-8 text-indigo-700" />
          <h1 className="text-3xl font-bold text-gray-900">Manage Staff</h1>
        </div>

        <Link
          href="/staff/add"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg
                    hover:bg-indigo-700 transition-colors"
        >
          <LuUserPlus className="w-5 h-5" />
          Add New Staff
        </Link>
      </div>

      {/* --- Search & Filter --- */}
      <div className="bg-white p-4 rounded-xl shadow-md space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
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

      {/* --- Staff List Table --- */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full text-left">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Staff ID</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Department</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Role</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Phone</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStaff.map((staff) => (
                <tr
                  key={staff.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={staff.imageUrl}
                        alt={staff.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{staff.name}</p>
                        <p className="text-sm text-gray-500">{staff.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{staff.staffId}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{staff.department}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 flex items-center gap-2">
                    <LuUserCog className="text-gray-400" /> {staff.role}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{staff.phone}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium
                        ${
                          staff.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : staff.status === 'On Leave'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {staff.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
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

          {filteredStaff.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No staff found matching your criteria.
            </div>
          )}
        </div>
      </div>

      {/* --- Footer Summary --- */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium">{filteredStaff.length}</span> results
        </p>
      </div>
    </div>
  );
}
