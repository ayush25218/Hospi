"use client";

import React, { useState } from "react";
import {
  LuPlus,
  LuTrash2,
  LuUser,
  LuCalendar,
  LuClock,
  LuActivity,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";

export default function OperationTodoList() {
  const [showForm, setShowForm] = useState(false);

  const [operations, setOperations] = useState([
    { id: 1, doctor: "Dr. Rohan Sharma", patient: "Amit Kumar", operation: "Appendix Removal", date: "2025-11-05", time: "10:00 AM", status: "Completed" },
    { id: 2, doctor: "Dr. Neha Singh", patient: "Ravi Patel", operation: "Knee Replacement", date: "2025-11-06", time: "12:30 PM", status: "In Progress" },
    { id: 3, doctor: "Dr. Arjun Verma", patient: "Pooja Sinha", operation: "Heart Surgery", date: "2025-11-07", time: "09:00 AM", status: "Pending" },
    { id: 4, doctor: "Dr. Aman Gupta", patient: "Suresh Yadav", operation: "Eye Cataract", date: "2025-11-08", time: "03:00 PM", status: "Completed" },
    { id: 5, doctor: "Dr. Kavita Mishra", patient: "Anjali Devi", operation: "Gallbladder Removal", date: "2025-11-09", time: "11:30 AM", status: "Pending" },
    { id: 6, doctor: "Dr. Rajat Jain", patient: "Rahul Mehta", operation: "Hernia Repair", date: "2025-11-10", time: "02:00 PM", status: "In Progress" },
    { id: 7, doctor: "Dr. Sneha Kapoor", patient: "Meena Kumari", operation: "C-Section Delivery", date: "2025-11-11", time: "08:00 AM", status: "Completed" },
  ]);

  const [formData, setFormData] = useState({
    doctor: "",
    patient: "",
    operation: "",
    date: "",
    time: "",
    status: "Pending",
  });

  // Pagination setup
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(operations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = operations.slice(startIndex, startIndex + itemsPerPage);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addOperation = (e: React.FormEvent) => {
    e.preventDefault();
    setOperations([...operations, { id: Date.now(), ...formData }]);
    setFormData({ doctor: "", patient: "", operation: "", date: "", time: "", status: "Pending" });
    setShowForm(false);
  };

  const deleteOperation = (id: number) => {
    setOperations(operations.filter((op) => op.id !== id));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 to-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-700">🩺 Operation To-Do List</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl shadow hover:bg-indigo-700 transition-all"
          >
            <LuPlus /> Add New Operation
          </button>
        </div>

        {/* Add Operation Form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              onSubmit={addOperation}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border border-indigo-100 shadow-md rounded-2xl p-6 mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-600 mb-1">Doctor Name</label>
                  <input name="doctor" value={formData.doctor} onChange={handleChange} placeholder="Enter doctor name" required
                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="block font-semibold text-gray-600 mb-1">Patient Name</label>
                  <input name="patient" value={formData.patient} onChange={handleChange} placeholder="Enter patient name" required
                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="block font-semibold text-gray-600 mb-1">Operation Type</label>
                  <input name="operation" value={formData.operation} onChange={handleChange} placeholder="Enter operation type" required
                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="block font-semibold text-gray-600 mb-1">Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} required
                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="block font-semibold text-gray-600 mb-1">Time</label>
                  <input type="time" name="time" value={formData.time} onChange={handleChange} required
                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="block font-semibold text-gray-600 mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}
                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition-all"
              >
                Save Operation
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Operation List */}
        <div className="bg-white rounded-2xl shadow-md border border-indigo-100">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-indigo-600 text-white text-left">
                <th className="py-3 px-4 rounded-tl-2xl">Doctor</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Operation</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 rounded-tr-2xl text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((op) => (
                <tr key={op.id} className="border-b hover:bg-indigo-50 transition-all">
                  <td className="py-3 px-4 flex items-center gap-2"><LuUser /> {op.doctor}</td>
                  <td className="py-3 px-4">{op.patient}</td>
                  <td className="py-3 px-4 flex items-center gap-2"><LuActivity /> {op.operation}</td>
                  <td className="py-3 px-4 flex items-center gap-1"><LuCalendar /> {op.date}</td>
                  <td className="py-3 px-4 flex items-center gap-1"><LuClock /> {op.time}</td>
                  <td className={`py-3 px-4 font-medium ${op.status === "Completed"
                      ? "text-green-600"
                      : op.status === "In Progress"
                      ? "text-yellow-600"
                      : "text-red-600"
                    }`}>
                    {op.status}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => deleteOperation(op.id)}
                      className="text-red-500 hover:text-red-700 transition-all"
                    >
                      <LuTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center p-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg ${currentPage === 1
                ? "bg-gray-200 text-gray-500"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
            >
              <LuChevronLeft /> Previous
            </button>
            <span className="text-gray-600 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg ${currentPage === totalPages
                ? "bg-gray-200 text-gray-500"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
            >
              Next <LuChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
