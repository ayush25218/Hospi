'use client'; // Filters, charts, aur state ke liye zaroori hai

import { useState } from 'react';
import {
   LuChartBar,
  LuCalendar,
  LuBuilding,
  LuDownload,
  LuDollarSign,
  LuBed,
  LuUsers,
  LuClock,
  LuArrowUp,
  LuArrowDown,
} from 'react-icons/lu';

/**
 * ==========================================
 * Helper Components (Cards aur Placeholders)
 * ==========================================
 */

// Chhote stat cards ke liye
const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  change?: string; // e.g., "+5.2%"
  icon: React.ElementType;
  color: string;
}) => {
  const isPositive = change && change.startsWith('+');
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        {change && (
          <span
            className={`flex items-center text-sm font-medium ${
              isPositive ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {isPositive ? <LuArrowUp size={16} /> : <LuArrowDown size={16} />}
            {change.substring(1)}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-500">{title}</p>
      </div>
    </div>
  );
};

// Bade chart cards ke liye
const ChartCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white p-6 rounded-xl shadow-md">
    <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
    <div className="h-64">{children}</div>
  </div>
);

// Chart ke liye placeholder
const ChartPlaceholder = ({ type = 'Line Chart' }: { type?: string }) => (
  <div className="h-full w-full bg-gray-100 rounded-lg flex items-center justify-center">
    <p className="text-gray-400 font-medium">[{type} Placeholder]</p>
  </div>
);

/**
 * ==========================================
 * Main Analytics Page Component
 * ==========================================
 */
export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('last_30_days');
  const [department, setDepartment] = useState('all');

  return (
    <div className="space-y-8">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          < LuChartBar className="h-8 w-8 text-indigo-700" />
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        </div>
      </div>

      {/* --- Filters Bar --- */}
      <div className="bg-white p-4 rounded-xl shadow-md flex flex-col md:flex-row gap-4">
        {/* Date Range Filter */}
        <div className="flex-1">
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700">
            Date Range
          </label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-2.5 text-gray-400"><LuCalendar className="w-5 h-5" /></span>
            <select
              id="dateRange"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="this_month">This Month</option>
              <option value="last_quarter">Last Quarter</option>
              <option value="this_year">This Year</option>
            </select>
          </div>
        </div>

        {/* Department Filter */}
        <div className="flex-1">
          <label htmlFor="department" className="block text-sm font-medium text-gray-700">
            Department
          </label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-2.5 text-gray-400"><LuBuilding className="w-5 h-5" /></span>
            <select
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Departments</option>
              <option value="cardiology">Cardiology</option>
              <option value="neurology">Neurology</option>
              <option value="pediatrics">Pediatrics</option>
              <option value="orthopedics">Orthopedics</option>
              <option value="surgery">Surgery</option>
            </select>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex-shrink-0 md:self-end">
          <button
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg
                       hover:bg-indigo-700 transition-colors"
          >
            <LuDownload className="w-5 h-5" />
            Export Report (CSV)
          </button>
        </div>
      </div>

      {/* --- Section 1: Key Metrics (Stat Cards) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value="$1.2M"
          change="+15.2%"
          icon={LuDollarSign}
          color="text-green-500"
        />
        <StatCard
          title="Bed Occupancy"
          value="82.5%"
          change="-1.8%"
          icon={LuBed}
          color="text-blue-500"
        />
        <StatCard
          title="New Patients"
          value="1,042"
          change="+8.1%"
          icon={LuUsers}
          color="text-yellow-500"
        />
        <StatCard
          title="Avg. Length of Stay"
          value="4.1 Days"
          change="+0.2"
          icon={LuClock}
          color="text-red-500"
        />
      </div>

      {/* --- Section 2: Financial & Operational Charts --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue vs. Expenses (Last 12 Months)">
          <ChartPlaceholder type="Line Chart" />
        </ChartCard>
        <ChartCard title="Revenue by Department">
          <ChartPlaceholder type="Pie Chart" />
        </ChartCard>
        <ChartCard title="Bed Occupancy Rate Trend">
          <ChartPlaceholder type="Area Chart" />
        </ChartCard>
        <ChartCard title="Admissions vs. Discharges">
          <ChartPlaceholder type="Dual Line Chart" />
        </ChartCard>
      </div>

      {/* --- Section 3: Patient & Doctor Charts --- */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Patient & Doctor Analytics
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Patient Volume (New vs. Re-visit)">
            <ChartPlaceholder type="Line Chart" />
          </ChartCard>
          <ChartCard title="Top 5 Departments (by Patient Count)">
            <ChartPlaceholder type="Bar Chart" />
          </ChartCard>
          <ChartCard title="Top Doctors (by Appointments)">
            <ChartPlaceholder type="List / Table" />
          </ChartCard>
        </div>
      </div>
      
    </div>
  );
}