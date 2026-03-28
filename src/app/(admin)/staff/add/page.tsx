'use client';

import { useState } from 'react';
import {
  LuUserPlus,
  LuMail,
  LuPhone,
  LuBuilding2,
  LuUserCog,
  LuUpload,
  LuSave,
  LuUserCheck,
} from 'react-icons/lu';

export default function AddStaffPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    status: 'Active',
    image: null as File | null,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Staff Data:', formData);
    alert('✅ Staff added successfully!');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-indigo-50 via-white to-indigo-100 py-12 px-4">
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-8 border border-gray-100">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md">
            <LuUserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Staff</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Full Name</label>
            <div className="relative">
              <LuUserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <div className="relative">
                <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                             focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Phone</label>
              <div className="relative">
                <LuPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                             focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Department & Role */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Department</label>
              <div className="relative">
                <LuBuilding2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                             focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                >
                  <option value="">Select Department</option>
                  <option>Emergency</option>
                  <option>Front Desk</option>
                  <option>Pathology</option>
                  <option>Pharmacy</option>
                  <option>Billing</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Role</label>
              <div className="relative">
                <LuUserCog className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                             focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                >
                  <option value="">Select Role</option>
                  <option>Nurse</option>
                  <option>Receptionist</option>
                  <option>Lab Technician</option>
                  <option>Pharmacist</option>
                  <option>Billing Assistant</option>
                </select>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
            >
              <option>Active</option>
              <option>On Leave</option>
              <option>Inactive</option>
            </select>
          </div>

          {/* Upload Image */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Profile Photo</label>
            <div className="flex items-center gap-4">
              <label
                htmlFor="imageUpload"
                className="flex items-center gap-2 px-4 py-3 bg-indigo-50 border border-indigo-200 
                           text-indigo-700 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors"
              >
                <LuUpload className="w-5 h-5" />
                Upload Image
              </label>
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {formData.image && (
                <span className="text-sm text-gray-600">{formData.image.name}</span>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium 
                         rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
            >
              <LuSave className="w-5 h-5" />
              Save Staff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
