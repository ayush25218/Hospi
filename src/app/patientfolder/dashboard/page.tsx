'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FaUserMd,
  FaUserInjured,
  FaPrescriptionBottleAlt,
  FaFlask,
  FaXRay,
  FaTint,
  FaAmbulance,
} from 'react-icons/fa';
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';

/* -------------------------
   Premium-looking Patient Dashboard (Sidebar Removed)
   ------------------------- */

const stats = [
 
  { key: 'Pharmacy', count: 14, color: '#10b981', icon: <FaPrescriptionBottleAlt className="w-5 h-5" /> },
  { key: 'Pathology', count: 13, color: '#ef4444', icon: <FaFlask className="w-5 h-5" /> },
  { key: 'Radiology', count: 14, color: '#2563eb', icon: <FaXRay className="w-5 h-5" /> },
  { key: 'Blood Bank', count: 25, color: '#f59e0b', icon: <FaTint className="w-5 h-5" /> },
  { key: 'Ambulance', count: 9, color: '#f97316', icon: <FaAmbulance className="w-5 h-5" /> },
];

const lineData = [
  { year: '2023', OPD: 2, IPD: 1, Pharmacy: 1, Pathology: 0, Radiology: 0, BloodBank: 0, Ambulance: 0 },
  { year: '2024', OPD: 6, IPD: 3, Pharmacy: 5, Pathology: 7, Radiology: 2, BloodBank: 4, Ambulance: 3 },
  { year: '2025', OPD: 13, IPD: 3, Pharmacy: 14, Pathology: 25, Radiology: 14, BloodBank: 25, Ambulance: 9 },
];

const barData = [
  { name: 'Finding A', value: 40 },
  { name: 'Finding B', value: 30 },
  { name: 'Finding C', value: 28 },
  { name: 'Finding D', value: 24 },
  { name: 'Finding E', value: 18 },
];

const pieData = [
  { name: 'Thirst', value: 30 },
  { name: 'Feeling sad', value: 20 },
  { name: 'Eczema', value: 18 },
  { name: 'Cramps', value: 12 },
  { name: 'Asthma', value: 20 },
];

const PIE_COLORS = ['#059669', '#0ea5e9', '#fb923c', '#8b5cf6', '#f97316'];

export default function PatientDashboardPremium(): React.ReactElement {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 text-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Patient Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of departments, activity & trending metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:scale-[1.02] transition">Export</button>
          <button className="text-sm px-3 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition">New Appointment</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
        {stats.map((s) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-lg transition"
          >
            <div style={{ background: `${s.color}20` }} className="w-12 h-12 rounded-lg grid place-items-center">
              <div style={{ color: s.color }} className="text-lg">{s.icon}</div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500">{s.key}</div>
              <div className="text-xl font-bold text-gray-900">{s.count}</div>
            </div>
            <div className="text-xs text-green-500 font-medium">+{Math.floor(Math.random() * 10)}%</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Medical History</h3>
            <div className="text-xs text-gray-500">Yearly trend</div>
          </div>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 10, right: 24, left: -8, bottom: 6 }}>
                <CartesianGrid strokeDasharray="5 5" stroke="#f3f4f6" />
                <XAxis dataKey="year" tick={{ fill: '#6b7280' }} />
                <YAxis tick={{ fill: '#6b7280' }} />
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: 8 }} />
                <Line type="monotone" dataKey="OPD" stroke="#06b6d4" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="IPD" stroke="#7c3aed" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Pharmacy" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Pathology" stroke="#ef4444" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Radiology" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="BloodBank" stroke="#f59e0b" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Ambulance" stroke="#f97316" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar + Pie Charts */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-800">Top Findings</h4>
              <div className="text-xs text-gray-500">Most frequent</div>
            </div>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 8, right: 0, left: -10, bottom: 6 }}>
                  <CartesianGrid stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                  <YAxis tick={{ fill: '#6b7280' }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-800">Top Symptoms</h4>
              <div className="text-xs text-gray-500">Distribution</div>
            </div>
            <div style={{ height: 180 }} className="flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    innerRadius={28}
                    paddingAngle={4}
                    labelLine={false}
                    label={({ name }) => name}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs text-gray-500">Recent Activity</div>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            <li>• OPD Registration — Aarav Sharma</li>
            <li>• Lab Report Uploaded — Riya Singh</li>
            <li>• Discharged — Patient #EMP-102</li>
          </ul>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs text-gray-500">Quick Actions</div>
          <div className="mt-3 flex flex-col gap-2">
            <button className="text-left px-3 py-2 rounded-md bg-indigo-50 text-indigo-700">Create Appointment</button>
            <button className="text-left px-3 py-2 rounded-md bg-green-50 text-green-700">Upload Report</button>
            <button className="text-left px-3 py-2 rounded-md bg-yellow-50 text-yellow-700">Generate Invoice</button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs text-gray-500">Summary</div>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <div>Total Patients: <span className="font-semibold">320</span></div>
            <div>Open Bills: <span className="font-semibold">12</span></div>
            <div>Upcoming Appointments: <span className="font-semibold">8</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
