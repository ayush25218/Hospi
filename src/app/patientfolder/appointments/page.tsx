'use client';

import { useState } from 'react';
import { FaPrint, FaListUl, FaTrash, FaPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function PatientProfile() {
  const [search, setSearch] = useState('');

  const patient = {
    id: 1,
    name: 'Olivier Thomas',
    email: 'olivier@gmail.com',
    phone: '7896541230',
    gender: 'Male',
    maritalStatus: 'Married',
    age: '41 Year, 6 Month, 4 Day',
    address: '482 Kingsway, Brooklyn West, CA',
    guardian: 'Edward Thomas',
  };

  const appointments = [
    {
      no: 'APPN07498',
      date: '11/10/2025 05:46 PM',
      priority: 'Normal',
      specialist: 'Cardiologists',
      doctor: 'Sonia Bush (9002)',
      status: 'Approved',
      message: 'Urgent Appointment',
    },
    {
      no: 'APPN07497',
      date: '11/05/2025 12:00 PM',
      priority: 'Normal',
      specialist: 'Cardiologists, Gastroenterologists',
      doctor: 'Amit Singh (9009)',
      status: 'Approved',
      message: 'Urgent Appointment',
    },
    {
      no: 'APPN07434',
      date: '10/05/2025 11:00 AM',
      priority: 'Normal',
      specialist: 'Cardiologists',
      doctor: 'Sonia Bush (9002)',
      status: 'Approved',
      message: 'Urgent Appointment - TBK',
    },
    {
      no: 'Pending',
      date: '10/01/2025 04:19 PM',
      priority: 'Normal',
      specialist: 'Cardiologists, Gastroenterologists',
      doctor: 'Amit Singh (9009)',
      status: 'Pending',
      message: 'Urgent Appointment',
    },
    {
      no: 'APPN07432',
      date: '09/30/2025 11:45 AM',
      priority: 'Normal',
      specialist: 'Cardiologists',
      doctor: 'Sonia Bush (9002)',
      status: 'Approved',
      message: 'Urgent Appointment',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Patient Header */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6 p-6 items-center md:items-start">
          {/* Avatar */}
          <img
            src="https://via.placeholder.com/120"
            alt="Patient"
            className="w-28 h-28 rounded-full border-4 border-indigo-100 object-cover"
          />

          {/* Patient Info */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {patient.name}
              </h2>
              <p className="text-gray-600 mt-1">
                <strong>Patient Id:</strong> {patient.id}
              </p>
            </div>

            <div>
              <p><strong>Marital Status:</strong> {patient.maritalStatus}</p>
              <p><strong>Email:</strong> {patient.email}</p>
            </div>

            <div>
              <p><strong>Age:</strong> {patient.age}</p>
              <p><strong>Gender:</strong> {patient.gender}</p>
            </div>

            <div>
              <p><strong>Phone:</strong> {patient.phone}</p>
              <p><strong>Address:</strong> {patient.address}</p>
            </div>

            <div>
              <p><strong>Guardian Name:</strong> {patient.guardian}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments */}
      <div className="mt-6 bg-white rounded-lg shadow border border-gray-200">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">My Appointments</h3>

          <button className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-3 py-2 rounded hover:bg-indigo-700 transition">
            <FaPlus size={13} /> Add Appointment
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full md:w-1/3 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b">
              <tr>
                <th className="px-4 py-3">Appointment No</th>
                <th className="px-4 py-3">Appointment Date</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Specialist</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {appointments.map((a, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{a.no}</td>
                  <td className="px-4 py-3">{a.date}</td>
                  <td className="px-4 py-3">{a.priority}</td>
                  <td className="px-4 py-3">{a.specialist}</td>
                  <td className="px-4 py-3">{a.doctor}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        a.status === 'Approved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{a.message}</td>
                  <td className="px-4 py-3 flex gap-3 text-gray-600">
                    <FaPrint className="cursor-pointer hover:text-indigo-600" />
                    <FaListUl className="cursor-pointer hover:text-indigo-600" />
                    <FaTrash className="cursor-pointer hover:text-red-600" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
