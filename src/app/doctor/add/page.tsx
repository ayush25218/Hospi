'use client'; // Form hai, isliye 'use client' zaroori hai

import { useState } from 'react';
import {
  LuUser,
  LuMail,
  LuPhone,
  LuBuilding2,
  LuStethoscope,
  LuSave,
  LuCalendar,
  LuUpload,
  LuUserPlus,
} from 'react-icons/lu';

// Main Add Doctor Page
export default function AddDoctorPage() {
  // Form ke data ko store karne ke liye state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    specialization: '',
    dob: '',
    bio: '',
  });

  // Input change ko handle karne ke liye function
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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
    console.log('New Doctor Data:', formData);
    alert('New doctor added successfully! (Check console for data)');
    // Asli app mein, aap yahaan API call karke data database mein save karte
  };

  return (
    <div className="space-y-8">
      {/* --- Header --- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LuUserPlus className="h-8 w-8 text-indigo-700" />
          <h1 className="text-3xl font-bold text-gray-900">Add New Doctor</h1>
        </div>
      </div>

      {/* --- Form --- */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="col-span-1">
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
                placeholder="Dr. John Doe"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="col-span-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-3.5 text-gray-400">
                <LuMail className="w-5 h-5" />
              </span>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="john.doe@example.com"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="col-span-1">
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
                placeholder="+1 234 567 890"
              />
            </div>
          </div>

          {/* Department */}
          <div className="col-span-1">
            <label
              htmlFor="department"
              className="block text-sm font-medium text-gray-700"
            >
              Department
            </label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-3.5 text-gray-400">
                <LuBuilding2 className="w-5 h-5" />
              </span>
              <select
                name="department"
                id="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg appearance-none
                           focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Department</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Surgery">Surgery</option>
              </select>
            </div>
          </div>

          {/* Specialization */}
          <div className="md:col-span-2">
            <label
              htmlFor="specialization"
              className="block text-sm font-medium text-gray-700"
            >
              Specialization
            </label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-3.5 text-gray-400">
                <LuStethoscope className="w-5 h-5" />
              </span>
              <input
                type="text"
                name="specialization"
                id="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Heart Surgeon"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="col-span-1">
            <label
              htmlFor="dob"
              className="block text-sm font-medium text-gray-700"
            >
              Date of Birth
            </label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-3.5 text-gray-400">
                <LuCalendar className="w-5 h-5" />
              </span>
              <input
                type="date"
                name="dob"
                id="dob"
                value={formData.dob}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Profile Picture Upload */}
          <div className="col-span-1">
            <label
              htmlFor="profilePicture"
              className="block text-sm font-medium text-gray-700"
            >
              Profile Picture
            </label>
            <div className="relative mt-2">
              <label
                htmlFor="profilePicture"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                           flex items-center cursor-pointer text-gray-500
                           focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <span className="absolute left-3 top-3.5 text-gray-400">
                  <LuUpload className="w-5 h-5" />
                </span>
                Choose File
              </label>
              <input
                type="file"
                name="profilePicture"
                id="profilePicture"
                accept="image/*"
                className="sr-only" // Input ko chupa dein, label se trigger hoga
              />
            </div>
          </div>

          {/* Doctor Bio */}
          <div className="md:col-span-2">
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700"
            >
              Doctor&apos;s Bio
            </label>
            <div className="relative mt-2">
              <textarea
                name="bio"
                id="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Write a brief description about the doctor..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* --- Submit Button --- */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="flex items-center justify-center py-3 px-6 font-semibold text-white 
                       bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none 
                       focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            <LuSave className="w-5 h-5 mr-2" />
            Save Doctor
          </button>
        </div>
      </form>
    </div>
  );
}






