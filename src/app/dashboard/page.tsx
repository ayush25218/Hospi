import {
  LuUsers,
  LuStethoscope,
  LuCalendarCheck,
  LuBedDouble,
  LuPlus,
} from 'react-icons/lu';

// Helper component for the stat cards
const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
    <div className={`p-3 rounded-full ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

// Main Dashboard Page
export default function DashboardPage() {
  // Dummy data for the table
  const recentAppointments = [
    {
      id: 1,
      name: 'Aarav Sharma',
      doctor: 'Dr. Priya Gupta',
      time: '10:30 AM',
      status: 'Completed',
    },
    {
      id: 2,
      name: 'Riya Singh',
      doctor: 'Dr. Rohan Joshi',
      time: '11:00 AM',
      status: 'Pending',
    },
    {
      id: 3,
      name: 'Vikram Mehra',
      doctor: 'Dr. Anjali Rao',
      time: '11:30 AM',
      status: 'Cancelled',
    },
  ];

  return (
    <div className="space-y-8">
      {/* --- Header --- */}
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* --- Stat Cards Grid --- */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value="1,204"
          icon={LuUsers}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Doctors"
          value="78"
          icon={LuStethoscope}
          color="bg-green-500"
        />
        <StatCard
          title="Appointments Today"
          value="32"
          icon={LuCalendarCheck}
          color="bg-yellow-500"
        />
        <StatCard
          title="Beds Occupied"
          value="85%"
          icon={LuBedDouble}
          color="bg-red-500"
        />
      </div>

      {/* --- Main Content Area --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* --- Chart Placeholder --- */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Appointments This Week
          </h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">[Chart Placeholder]</p>
          </div>
        </div>

        {/* --- Quick Actions --- */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h3>
          <ul className="space-y-3">
            <li>
              <a
                href="#"
                className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium transition-colors"
              >
                <LuPlus className="w-5 h-5 mr-3" />
                Add New Patient
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-medium transition-colors"
              >
                <LuPlus className="w-5 h-5 mr-3" />
                Add New Doctor
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-yellow-700 font-medium transition-colors"
              >
                <LuPlus className="w-5 h-5 mr-3" />
                Schedule Appointment
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* --- Recent Appointments Table --- */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Appointments
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-full text-left">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">
                  Patient Name
                </th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">
                  Doctor
                </th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">
                  Time
                </th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentAppointments.map((appt) => (
                <tr key={appt.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">{appt.name}</td>
                  <td className="py-3 px-4">{appt.doctor}</td>
                  <td className="py-3 px-4">{appt.time}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium
                        ${
                          appt.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : appt.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {appt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



