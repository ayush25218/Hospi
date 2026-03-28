'use client'; // Modal aur state ke liye zaroori hai

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuBuilding2,
  LuPlus,
  LuPencil,
  LuTrash2,
  LuEye,
  LuHeart,
  LuBrain,
  LuBone,
  LuBaby,
  LuCross,
  LuX,
  LuSave,
  LuUser,
} from 'react-icons/lu';

// --- Dummy Data ---
// (Asli app mein, yeh data API se aayega)

// HOD chunne ke liye dummy doctors list
const dummyDoctors = [
  { id: 1, name: 'Dr. Priya Gupta' },
  { id: 2, name: 'Dr. Rohan Joshi' },
  { id: 3, name: 'Dr. Anjali Rao' },
];

// Departments ki list
const dummyDepartments = [
  {
    id: 1,
    name: 'Cardiology',
    hod: 'Dr. Priya Gupta',
    staffCount: 25,
    doctorCount: 15,
    description: 'Specializes in heart-related diseases and treatments.',
    icon: LuHeart,
    color: 'text-red-500',
  },
  {
    id: 2,
    name: 'Neurology',
    hod: 'Dr. Rohan Joshi',
    staffCount: 18,
    doctorCount: 10,
    description: 'Focuses on the nervous system, including the brain and spinal cord.',
    icon: LuBrain,
    color: 'text-blue-500',
  },
  {
    id: 3,
    name: 'Pediatrics',
    hod: 'Dr. Anjali Rao',
    staffCount: 30,
    doctorCount: 12,
    description: 'Dedicated to the health and medical care of infants and children.',
    icon: LuBaby,
    color: 'text-pink-500',
  },
  {
    id: 4,
    name: 'Orthopedics',
    hod: 'Dr. Vikram Mehra',
    staffCount: 22,
    doctorCount: 14,
    description: 'Focuses on the musculoskeletal system, including bones and joints.',
    icon: LuBone,
    color: 'text-gray-600',
  },
  {
    id: 5,
    name: 'Surgery',
    hod: 'Dr. Suresh Verma',
    staffCount: 40,
    doctorCount: 20,
    description: 'General and specialized surgical procedures.',
    icon: LuCross, // (Represents surgery/health)
    color: 'text-green-500',
  },
];
// --------------------

/**
 * Main Departments Page Component
 */
export default function DepartmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LuBuilding2 className="h-8 w-8 text-indigo-700" />
          <h1 className="text-3xl font-bold text-gray-900">
            Manage Departments
          </h1>
        </div>
        
        {/* --- Action Button --- */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg
                     hover:bg-indigo-700 transition-colors"
        >
          <LuPlus className="w-5 h-5" />
          Add New Department
        </button>
      </div>

      {/* --- Department Cards Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyDepartments.map((dept) => (
          <DepartmentCard key={dept.id} department={dept} />
        ))}
      </div>

      {/* --- Add New Department Modal --- */}
      <AddDepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        doctors={dummyDoctors}
      />
    </div>
  );
}

/**
 * Helper Component: Department Card
 */
function DepartmentCard({ department }: { department: (typeof dummyDepartments)[0] }) {
  const Icon = department.icon;
  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between transition-all hover:shadow-lg">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <Icon className={`w-10 h-10 ${department.color}`} />
          <div className="text-right">
            <h3 className="text-lg font-bold text-gray-500">HOD</h3>
            <p className="font-medium text-gray-800">{department.hod}</p>
          </div>
        </div>
        
        {/* Card Body */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{department.name}</h2>
        <p className="text-sm text-gray-600 mb-4 h-16">{department.description}</p>
        
        {/* Card Stats */}
        <div className="flex justify-around items-center py-3 bg-gray-50 rounded-lg mb-4">
          <div className="text-center">
            <p className="text-xl font-bold text-indigo-600">{department.doctorCount}</p>
            <p className="text-xs font-medium text-gray-500">Doctors</p>
          </div>
          <div className="border-l h-10 border-gray-200"></div>
          <div className="text-center">
            <p className="text-xl font-bold text-indigo-600">{department.staffCount}</p>
            <p className="text-xs font-medium text-gray-500">Total Staff</p>
          </div>
        </div>
      </div>
      
      {/* Card Footer (Actions) */}
      <div className="flex items-center justify-end gap-2">
        <button className="p-2 text-gray-500 hover:text-gray-800" title="View Details">
          <LuEye className="w-5 h-5" />
        </button>
        <button className="p-2 text-indigo-600 hover:text-indigo-800" title="Edit">
          <LuPencil className="w-5 h-5" />
        </button>
        <button className="p-2 text-red-600 hover:text-red-800" title="Delete">
          <LuTrash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Helper Component: Add Department Modal
 */
function AddDepartmentModal({ isOpen, onClose, doctors }: { isOpen: boolean, onClose: () => void, doctors: {id: number, name: string}[] }) {
  
  const [formData, setFormData] = useState({
    name: '',
    hod: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New Department Data:", formData);
    alert('Department Added! (Check console for data)');
    onClose(); // Modal band karein
    setFormData({ name: '', hod: '', description: '' }); // Form reset karein
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-lg p-6 rounded-xl shadow-2xl relative"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Department</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"
              >
                <LuX className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Department Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Department Name</label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-3.5 text-gray-400"><LuBuilding2 className="w-5 h-5" /></span>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Cardiology"
                  />
                </div>
              </div>
              
              {/* Head of Department (HOD) */}
              <div>
                <label htmlFor="hod" className="block text-sm font-medium text-gray-700">Head of Department (HOD)</label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-3.5 text-gray-400"><LuUser className="w-5 h-5" /></span>
                  <select
                    name="hod"
                    id="hod"
                    value={formData.hod}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a Doctor</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.name}>{doc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <div className="relative mt-2">
                  <textarea
                    name="description"
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="What does this department do?"
                  ></textarea>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
                >
                  <LuSave className="w-5 h-5" />
                  Save Department
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}