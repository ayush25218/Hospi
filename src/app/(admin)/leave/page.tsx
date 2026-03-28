"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  LuUser,
  LuCalendar,
  LuFileText,
  LuMail,
  LuBuilding2,
  LuSend,
} from "react-icons/lu";

export default function LeaveRequestPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Leave Request Submitted:", formData);
    alert("Leave Request Submitted Successfully!");
    setFormData({
      name: "",
      email: "",
      department: "",
      leaveType: "",
      fromDate: "",
      toDate: "",
      reason: "",
    });
  };

  return (
    <motion.div
      className="max-w-3xl mx-auto mt-10 bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
        Leave Request Form
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Full Name
          </label>
          <div className="flex items-center border rounded-xl px-3 py-2">
            <LuUser className="text-gray-500 mr-2" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your name"
              className="w-full outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Email Address
          </label>
          <div className="flex items-center border rounded-xl px-3 py-2">
            <LuMail className="text-gray-500 mr-2" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="w-full outline-none"
            />
          </div>
        </div>

        {/* Department */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Department
          </label>
          <div className="flex items-center border rounded-xl px-3 py-2">
            <LuBuilding2 className="text-gray-500 mr-2" />
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              placeholder="Enter your department"
              className="w-full outline-none"
            />
          </div>
        </div>

        {/* Leave Type */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Leave Type
          </label>
          <select
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
            required
            className="w-full border rounded-xl px-3 py-2 outline-none"
          >
            <option value="">Select Leave Type</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Earned Leave">Earned Leave</option>
            <option value="Maternity Leave">Maternity Leave</option>
            <option value="Paternity Leave">Paternity Leave</option>
          </select>
        </div>

        {/* From and To Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              From Date
            </label>
            <div className="flex items-center border rounded-xl px-3 py-2">
              <LuCalendar className="text-gray-500 mr-2" />
              <input
                type="date"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleChange}
                required
                className="w-full outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              To Date
            </label>
            <div className="flex items-center border rounded-xl px-3 py-2">
              <LuCalendar className="text-gray-500 mr-2" />
              <input
                type="date"
                name="toDate"
                value={formData.toDate}
                onChange={handleChange}
                required
                className="w-full outline-none"
              />
            </div>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Reason for Leave
          </label>
          <div className="flex items-start border rounded-xl px-3 py-2">
            <LuFileText className="text-gray-500 mr-2 mt-1" />
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              placeholder="Write reason for leave..."
              className="w-full outline-none resize-none"
              rows={3}
            ></textarea>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-linear-to-r from-blue-500 to-indigo-600 text-blue-800 px-6 py-3 rounded-xl font-semibold flex items-center justify-center mx-auto shadow-md hover:shadow-lg"
          >
            <LuSend className="mr-2" />
            Submit Request
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
