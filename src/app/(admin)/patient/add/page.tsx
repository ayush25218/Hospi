'use client'; // Form hai, isliye 'use client' zaroori hai

import { useState } from 'react';
import {
  LuUser,
  LuPhone,
  
  LuSave,
  LuUserPlus,
  LuCalendar, // Age ke liye icon
} from 'react-icons/lu';

// Main Add Patient Page (Fast Entry)
export default function AddPatientPage() {
  // Form ke data ko store karne ke liye state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    age: '',
    address: '',
  });

  // Input change ko handle karne ke liye function
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Form submit ko handle karne ke liye
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Abhi ke liye, hum data ko console mein log karenge
    console.log('New Patient Data (Quick Add):', formData);
    alert('New patient added successfully! (Check console for data)');
    
    // Form ko reset kar dein taaki agla patient add kar sakein
    setFormData({
      fullName: '',
      phone: '',
      age: '',
      address: '',
    });
  };

  return (
    <div className="space-y-8">
      {/* --- Header --- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LuUserPlus className="h-8 w-8 text-indigo-700" />
          <h1 className="text-3xl font-bold text-gray-900">Add New Patient (Fast Entry)</h1>
        </div>
      </div>

      {/* --- Form --- */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto"
      >
        <div className="space-y-6">
          
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-3.5 text-gray-400">
                <LuUser className="w-5 h-5" />
              </span>
              <input
                type="text"
                name="fullName"
                id="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Patient's Full Name"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-3.5 text-gray-400">
                <LuPhone className="w-5 h-5" />
              </span>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Patient's Phone Number"
              />
            </div>
          </div>
          
          {/* Age */}
          <div>
            <label
              htmlFor="age"
              className="block text-sm font-medium text-gray-700"
            >
              Age
            </label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-3.5 text-gray-400">
                <LuCalendar className="w-5 h-5" />
              </span>
              <input
                type="number"
                name="age"
                id="age"
                value={formData.age}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Patient's Age (e.g., 35)"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-3.5 text-gray-400">
                <div  className="w-5 h-5" />
              </span>
              <textarea
                name="address"
                id="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="123, Main Street, City"
              ></textarea>
            </div>
          </div>
        </div>

        {/* --- Submit Button --- */}
        <div className="flex justify-end pt-8">
          <button
            type="submit"
            className="flex items-center justify-center py-3 px-6 font-semibold text-white 
                       bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none 
                       focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            <LuSave className="w-5 h-5 mr-2" />
            Save Patient
          </button>
        </div>
      </form>
    </div>
  );
}