'use client'; // Filters aur state ke liye zaroori hai

import { useState } from 'react';
import {
  LuContact,
  LuSearch,
  LuUser,
  LuStethoscope,
  LuUsers,
  LuBuilding,
  LuMail,
  LuPhone,
  LuMapPin,
  LuMessageCircle,
} from 'react-icons/lu';

// --- Dummy Data ---
// (Asli app mein, yeh data API se aayega)
const allContacts = [
  {
    id: 'doc-1',
    name: 'Dr. Priya Gupta',
    role: 'Doctor',
    department: 'Cardiology',
    phone: '+91 98765 43210',
    email: 'priya.gupta@hospi.com',
    address: 'Room 101, 1st Floor, Heart Wing',
    imageUrl: 'https://via.placeholder.com/150/007BFF/FFFFFF?text=PG',
  },
  {
    id: 'staff-1',
    name: 'Rohan Verma',
    role: 'Nurse',
    department: 'Surgery',
    phone: '+91 98765 11111',
    email: 'rohan.verma@hospi.com',
    address: 'Surgical Ward, 2nd Floor',
    imageUrl: 'https://via.placeholder.com/150/28A745/FFFFFF?text=RV',
  },
  {
    id: 'doc-2',
    name: 'Dr. Rohan Joshi',
    role: 'Doctor',
    department: 'Neurology',
    phone: '+91 98765 43211',
    email: 'rohan.joshi@hospi.com',
    address: 'Room 205, 2nd Floor, Neuro Wing',
    imageUrl: 'https://via.placeholder.com/150/FFC107/FFFFFF?text=RJ',
  },
  {
    id: 'staff-2',
    name: 'Aisha Khan',
    role: 'Receptionist',
    department: 'Administration',
    phone: '+91 98765 22222',
    email: 'aisha.khan@hospi.com',
    address: 'Main Lobby, Ground Floor',
    imageUrl: 'https://via.placeholder.com/150/DC3545/FFFFFF?text=AK',
  },
  {
    id: 'staff-3',
    name: 'Sunil Pawar',
    role: 'Pharmacist',
    department: 'Pharmacy',
    phone: '+91 98765 33333',
    email: 'sunil.pawar@hospi.com',
    address: 'Pharmacy, Ground Floor',
    imageUrl: 'https://via.placeholder.com/150/6F42C1/FFFFFF?text=SP',
  },
];

type RoleFilter = 'all' | 'doctors' | 'staff';
const departments = ['All Departments', 'Cardiology', 'Neurology', 'Surgery', 'Administration', 'Pharmacy'];

/**
 * ==========================================
 * Main Contacts Page Component
 * ==========================================
 */
export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [deptFilter, setDeptFilter] = useState('All Departments');

  // Filter logic
  const filteredContacts = allContacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm);

    const matchesRole =
      roleFilter === 'all' ||
      (roleFilter === 'doctors' && contact.role === 'Doctor') ||
      (roleFilter === 'staff' && contact.role !== 'Doctor');
    
    const matchesDept =
      deptFilter === 'All Departments' || contact.department === deptFilter;

    return matchesSearch && matchesRole && matchesDept;
  });

  return (
    <div className="space-y-8">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LuContact className="h-8 w-8 text-indigo-700" />
          <h1 className="text-3xl font-bold text-gray-900">Contacts Directory</h1>
        </div>
      </div>

      {/* --- Filters Bar --- */}
      <div className="bg-white p-4 rounded-xl shadow-md space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <span className="absolute left-3 top-3.5 text-gray-400"><LuSearch className="w-5 h-5" /></span>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Role & Dept Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Role Tabs */}
          <div className="p-1 bg-gray-100 rounded-lg flex items-center justify-between">
            <FilterButton
              label="All Contacts"
              icon={LuUsers}
              isActive={roleFilter === 'all'}
              onClick={() => setRoleFilter('all')}
            />
            <FilterButton
              label="Doctors"
              icon={LuStethoscope}
              isActive={roleFilter === 'doctors'}
              onClick={() => setRoleFilter('doctors')}
            />
            <FilterButton
              label="Staff"
              icon={LuUser}
              isActive={roleFilter === 'staff'}
              onClick={() => setRoleFilter('staff')}
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
      </div>

      {/* --- Contacts Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center">
            No contacts found matching your criteria.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * ==========================================
 * Helper Components
 * ==========================================
 */

// --- Filter Tab Button ---
const FilterButton = ({
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors
      ${
        isActive
          ? 'bg-white text-indigo-700 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      }`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </button>
);

// --- Contact Card ---
const ContactCard = ({ contact }: { contact: (typeof allContacts)[0] }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:scale-[1.02]">
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <img
              src={contact.imageUrl}
              alt={contact.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{contact.name}</h2>
              <p className={`font-medium ${contact.role === 'Doctor' ? 'text-indigo-600' : 'text-gray-600'}`}>
                {contact.role}
              </p>
            </div>
          </div>
        </div>
        
        {/* Contact Details */}
        <div className="mt-6 space-y-3 border-t pt-4">
          <div className="flex items-center gap-3 text-sm">
            <LuBuilding className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span className="text-gray-700">{contact.department}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <LuPhone className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <a href={`tel:${contact.phone}`} className="text-indigo-600 hover:underline">
              {contact.phone}
            </a>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <LuMail className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <a href={`mailto:${contact.email}`} className="text-indigo-600 hover:underline truncate">
              {contact.email}
            </a>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <LuMapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">{contact.address}</span>
          </div>
        </div>
      </div>
      
      {/* Card Footer Actions */}
      <div className="bg-gray-50 px-6 py-3 flex items-center justify-end gap-2">
        <a 
          href={`mailto:${contact.email}`}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-full
                     hover:bg-indigo-200 transition-colors"
        >
          <LuMail className="w-4 h-4" />
          Email
        </a>
        <a 
          href={`sms:${contact.phone}`}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 rounded-full
                     hover:bg-gray-300 transition-colors"
        >
          <LuMessageCircle className="w-4 h-4" />
          Chat
        </a>
      </div>
    </div>
  );
};